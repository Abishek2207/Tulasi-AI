"""
Phase 5 Precondition Repair Script - Surgical edits only.
Repairs models.py with targeted line replacements. No broad rewrites.
"""

with open('backend/app/models/models.py', 'r', encoding='utf-8') as f:
    content = f.read()
    lines = f.readlines() if False else content.splitlines(keepends=True)

# ── Repair 1: Fix Notification model (lines 178-191 in backup) ──────────────
# The corrupted Notification block contains IndustryUpdate fields (lines 186-191).
# Replace the entire corrupted block with the clean version from git history.

CORRUPTED_NOTIFICATION = (
    "class Notification(SQLModel, table=True):\n"
    "    id: Optional[int] = Field(default=None, primary_key=True)\n"
    "    user_id: int = Field(foreign_key=\"user.id\", index=True)\n"
    "    title: str\n"
    "    message: str\n"
    "    category: str # AI Skills | Certifications | Placement | Job Switch | Package Growth | Roadmap Reminder\n"
    "    is_read: bool = False\n"
    "    created_at: datetime = Field(default_factory=datetime.utcnow)\n"
    "    role_context: str\n"
    "    title: str\n"
    "    summary: str\n"
    "    impact_level: str # High | Medium | Low\n"
    "    source_tech: str\n"
    "    created_at: datetime = Field(default_factory=datetime.utcnow)\n"
    "\n"
    "\n"
    "\n"
    "\n"
)

CLEAN_NOTIFICATION_AND_RESTORED = (
    "class Notification(SQLModel, table=True):\n"
    "    id: Optional[int] = Field(default=None, primary_key=True)\n"
    "    user_id: int = Field(foreign_key=\"user.id\", index=True)\n"
    "    title: str\n"
    "    message: str\n"
    "    category: str # AI Skills | Certifications | Placement | Job Switch | Package Growth | Roadmap Reminder\n"
    "    is_read: bool = False\n"
    "    created_at: datetime = Field(default_factory=datetime.utcnow)\n"
    "\n"
    "\n"
    "class FocusSession(SQLModel, table=True):\n"
    "    id: Optional[int] = Field(default=None, primary_key=True)\n"
    "    user_id: int = Field(foreign_key=\"user.id\", index=True)\n"
    "    topic: str\n"
    "    duration_minutes: int\n"
    "    status: str = \"active\" # active | completed | interrupted\n"
    "    completed_at: Optional[datetime] = None\n"
    "    created_at: datetime = Field(default_factory=datetime.utcnow)\n"
    "\n"
    "\n"
    "class IndustryUpdate(SQLModel, table=True):\n"
    "    id: Optional[int] = Field(default=None, primary_key=True)\n"
    "    user_id: int = Field(foreign_key=\"user.id\", index=True)\n"
    "    role_context: str\n"
    "    title: str\n"
    "    summary: str\n"
    "    impact_level: str # High | Medium | Low\n"
    "    source_tech: str\n"
    "    created_at: datetime = Field(default_factory=datetime.utcnow)\n"
    "\n"
    "\n"
)

if CORRUPTED_NOTIFICATION in content:
    content = content.replace(CORRUPTED_NOTIFICATION, CLEAN_NOTIFICATION_AND_RESTORED, 1)
    print("✅ Notification fixed + FocusSession + IndustryUpdate restored")
else:
    print("❌ Could not find exact corrupted Notification block — check manually")

# Write repaired file
with open('backend/app/models/models.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Done. Run verification next.")
