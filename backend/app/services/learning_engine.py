from sqlmodel import Session, select
from typing import Dict, Any, Optional
from datetime import datetime, timezone
from app.models.models import (
    Goal, Skill, LearningTopic, LearningResource, UserLearningProgress,
    PracticeTask, PracticeAttempt, Assessment, AssessmentQuestion, AssessmentAttempt
)
from app.services.intelligence_service import intelligence_service
from app.services.skill_engine import update_skill_proficiency

PASSING_THRESHOLD = 0.7

class LearningEngine:
    @staticmethod
    def get_next_best_learning_action(db: Session, user_id: int) -> Dict[str, Any]:
        """
        Calculates the next best daily learning action based on the user's active goal
        and priority skill gaps.
        """
        goal = db.exec(select(Goal).where(Goal.user_id == user_id, Goal.status == 'active')).first()
        if not goal or not goal.target_role:
            return {"error": True, "message": "No active target role goal found."}
            
        gap_analysis = intelligence_service.get_user_skill_gap(db, user_id, goal.target_role)
        if gap_analysis.get("error"):
            return gap_analysis
            
        priority_skill = gap_analysis.get("top_priority")
        if not priority_skill:
            return {"error": False, "message": "No skill gaps found! Ready for role.", "ready": True}
            
        skill_name = priority_skill["skill_name"]
        skill = db.exec(select(Skill).where(Skill.name == skill_name)).first()
        
        # Find next learning topic the user hasn't completed
        topics = db.exec(select(LearningTopic).where(LearningTopic.skill_id == skill.id).order_by(LearningTopic.order_index)).all()
        
        next_topic = None
        next_resource = None
        
        for topic in topics:
            # Find a resource for this topic that is not completed
            resources = db.exec(select(LearningResource).where(LearningResource.topic_id == topic.id)).all()
            for res in resources:
                progress = db.exec(
                    select(UserLearningProgress).where(
                        UserLearningProgress.user_id == user_id,
                        UserLearningProgress.resource_id == res.id
                    )
                ).first()
                if not progress or progress.status != "completed":
                    next_topic = topic
                    next_resource = res
                    break
            if next_topic:
                break
                
        # Also find an assessment and practice task for this skill
        assessment = db.exec(select(Assessment).where(Assessment.skill_id == skill.id)).first()
        practice_task = db.exec(select(PracticeTask).where(PracticeTask.skill_id == skill.id)).first()
                
        return {
            "error": False,
            "target_role": goal.target_role,
            "priority_skill": priority_skill,
            "next_topic": next_topic.model_dump() if next_topic else None,
            "next_resource": next_resource.model_dump() if next_resource else None,
            "assessment_available": bool(assessment),
            "practice_available": bool(practice_task),
            "assessment_id": assessment.id if assessment else None,
            "practice_task_id": practice_task.id if practice_task else None,
            "daily_minutes": goal.daily_minutes
        }
        
    @staticmethod
    def start_resource(db: Session, user_id: int, resource_id: int) -> UserLearningProgress:
        prog = db.exec(select(UserLearningProgress).where(
            UserLearningProgress.user_id == user_id,
            UserLearningProgress.resource_id == resource_id
        )).first()
        if not prog:
            prog = UserLearningProgress(
                user_id=user_id, resource_id=resource_id,
                status="in_progress", started_at=datetime.now(timezone.utc)
            )
            db.add(prog)
        elif prog.status == "not_started":
            prog.status = "in_progress"
            prog.started_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(prog)
        return prog
        
    @staticmethod
    def complete_resource(db: Session, user_id: int, resource_id: int) -> UserLearningProgress:
        prog = db.exec(select(UserLearningProgress).where(
            UserLearningProgress.user_id == user_id,
            UserLearningProgress.resource_id == resource_id
        )).first()
        if not prog:
            prog = UserLearningProgress(
                user_id=user_id, resource_id=resource_id,
                status="completed", started_at=datetime.now(timezone.utc), completed_at=datetime.now(timezone.utc)
            )
            db.add(prog)
        else:
            prog.status = "completed"
            prog.completed_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(prog)
        return prog
        
    @staticmethod
    def evaluate_practice(db: Session, user_id: int, task_id: int, submission: str) -> PracticeAttempt:
        task = db.exec(select(PracticeTask).where(PracticeTask.id == task_id)).first()
        if not task:
            raise Exception("Task not found")
            
        score = 0.0
        feedback = "Evaluated."

        if task.evaluation_method == 'exact_match':
            score = 1.0 if submission.strip().lower() == task.expected_output.strip().lower() else 0.0
            feedback = "Perfect match." if score == 1.0 else "Incorrect answer."
        elif task.evaluation_method == 'regex':
            import re
            pattern = task.expected_output
            try:
                if re.search(pattern, submission, re.IGNORECASE):
                    score = 1.0
                    feedback = "Regex matched."
                else:
                    score = 0.0
                    feedback = "Did not match expected pattern."
            except Exception as e:
                score = 0.0
                feedback = f"Invalid regex pattern: {str(e)}"
        elif task.evaluation_method == 'code_execution':
            raise NotImplementedError("BLOCKED: Existing code execution architecture cannot safely support code_execution evaluation.")
        else:
            score = 0.0
            feedback = f"Unrecognized evaluation method: {task.evaluation_method}"

        attempt = PracticeAttempt(
            user_id=user_id, task_id=task_id,
            user_answer=submission, score=score, feedback=feedback,
            attempted_at=datetime.now(timezone.utc)
        )
        db.add(attempt)
        db.commit()
        db.refresh(attempt)
        
        # Trigger deterministic skill update
        update_skill_proficiency(user_id, task.skill_id, "practice", score, 0.8, str(attempt.id), db)
        return attempt

    @staticmethod
    def evaluate_assessment(db: Session, user_id: int, assessment_id: int, answers: Dict[int, str]) -> AssessmentAttempt:
        # answers maps question_id to user_answer string
        assessment = db.exec(select(Assessment).where(Assessment.id == assessment_id)).first()
        if not assessment:
            raise Exception("Assessment not found")
            
        questions = db.exec(select(AssessmentQuestion).where(AssessmentQuestion.assessment_id == assessment_id)).all()
        if not questions:
            raise Exception("No questions in assessment")
            
        total_points = sum(q.points for q in questions)
        earned_points = 0
        
        for q in questions:
            user_ans = answers.get(q.id) or answers.get(str(q.id))
            if user_ans and user_ans.strip().lower() == q.expected_answer.strip().lower():
                earned_points += q.points
                
        score = earned_points / total_points if total_points > 0 else 0.0
        
        attempt = AssessmentAttempt(
            user_id=user_id, assessment_id=assessment_id,
            score=score, passed=score >= PASSING_THRESHOLD, attempted_at=datetime.now(timezone.utc)
        )
        db.add(attempt)
        db.commit()
        
        # Trigger deterministic skill update
        update_skill_proficiency(user_id, assessment.skill_id, "assessment", score, 1.0, str(attempt.id), db)
        return attempt

learning_engine = LearningEngine()
