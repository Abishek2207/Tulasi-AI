import json
from datetime import datetime, timezone
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from app.models.models import UserSkill, SkillEvidence

def update_skill_proficiency(
    user_id: int, 
    skill_id: int, 
    evidence_type: str, 
    evidence_score: float, 
    confidence: float, 
    source_id: str, 
    db: Session
) -> float:
    """
    Deterministic skill update formula.
    new_level = (previous_level * w1) + (evidence_score * w2)
    where weights depend on the evidence_type and confidence.
    """
    # Replay Protection: Prevent duplicate submissions from inflating skills
    if source_id is not None:
        existing_evidence = db.exec(
            select(SkillEvidence).where(
                SkillEvidence.user_id == user_id,
                SkillEvidence.skill_id == skill_id,
                SkillEvidence.source_type == evidence_type,
                SkillEvidence.source_id == source_id
            )
        ).first()
        
        if existing_evidence:
            return existing_evidence.new_level

    # Retrieve current skill
    statement = select(UserSkill).where(
        UserSkill.user_id == user_id, 
        UserSkill.skill_id == skill_id
    )
    user_skill = db.exec(statement).first()
    
    previous_level = 0.0
    if user_skill:
        previous_level = user_skill.proficiency
        
    # Weights Configuration
    if evidence_type == 'assessment':
        w_historical = 0.6
        w_evidence = 0.4
    elif evidence_type == 'practice':
        w_historical = 0.8
        w_evidence = 0.2
    else:
        w_historical = 0.9
        w_evidence = 0.1
        
    # Adjust evidence weight by confidence (confidence is 0.0 to 1.0)
    adjusted_w_evidence = w_evidence * confidence
    adjusted_w_historical = 1.0 - adjusted_w_evidence
    
    new_level = (previous_level * adjusted_w_historical) + (evidence_score * adjusted_w_evidence)
    
    # Clamp to [0.0, 1.0]
    new_level = max(0.0, min(1.0, new_level))
    
    # Store evidence
    evidence = SkillEvidence(
        user_id=user_id,
        skill_id=skill_id,
        source_type=evidence_type,
        source_id=source_id,
        score=evidence_score,
        confidence=confidence,
        previous_level=previous_level,
        new_level=new_level
    )
    db.add(evidence)
    
    # Update or Create UserSkill
    if user_skill:
        user_skill.proficiency = new_level
        
        # Append to the string evidence field for backward compatibility
        old_evidence = []
        if user_skill.evidence:
            try:
                old_evidence = json.loads(user_skill.evidence)
                if not isinstance(old_evidence, list):
                    old_evidence = [user_skill.evidence]
            except:
                old_evidence = [user_skill.evidence]
        
        old_evidence.append(f"{evidence_type} score {evidence_score:.2f} -> {new_level:.2f}")
        user_skill.evidence = json.dumps(old_evidence[-5:]) # keep last 5
        user_skill.updated_at = datetime.now(timezone.utc)
    else:
        user_skill = UserSkill(
            user_id=user_id,
            skill_id=skill_id,
            proficiency=new_level,
            evidence=json.dumps([f"{evidence_type} score {evidence_score:.2f} -> {new_level:.2f}"])
        )
        db.add(user_skill)
        
    try:
        db.commit()
        db.refresh(user_skill)
    except IntegrityError:
        db.rollback()
        # The database blocked the duplicate evidence (race condition).
        # We query the existing level safely.
        existing_evidence = db.exec(
            select(SkillEvidence).where(
                SkillEvidence.user_id == user_id,
                SkillEvidence.skill_id == skill_id,
                SkillEvidence.source_type == evidence_type,
                SkillEvidence.source_id == source_id
            )
        ).first()
        if existing_evidence:
            return existing_evidence.new_level
        return previous_level # fallback if we can't find it for some reason

    return new_level
