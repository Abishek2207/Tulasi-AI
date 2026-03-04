"""
Notes CRUD endpoints — stores notes in-memory (swap for Supabase DB calls in production).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter()

# In-memory store (replace with Supabase client calls in production)
notes_db: dict = {}


class NoteCreate(BaseModel):
    title: str
    content: str
    tags: Optional[List[str]] = []
    pinned: Optional[bool] = False


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None
    pinned: Optional[bool] = None


class Note(BaseModel):
    id: str
    title: str
    content: str
    tags: List[str]
    pinned: bool
    created_at: str
    updated_at: str


@router.get("", response_model=List[Note], summary="List all notes for user")
def list_notes():
    """Return all notes sorted by pinned first, then by updated_at descending."""
    all_notes = list(notes_db.values())
    return sorted(all_notes, key=lambda n: (not n["pinned"], n["updated_at"]), reverse=False)


@router.post("", response_model=Note, summary="Create a new note")
def create_note(note: NoteCreate):
    note_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()
    new_note = {
        "id": note_id,
        "title": note.title,
        "content": note.content,
        "tags": note.tags or [],
        "pinned": note.pinned or False,
        "created_at": now,
        "updated_at": now,
    }
    notes_db[note_id] = new_note
    return new_note


@router.put("/{note_id}", response_model=Note, summary="Update an existing note")
def update_note(note_id: str, update: NoteUpdate):
    if note_id not in notes_db:
        raise HTTPException(status_code=404, detail="Note not found")
    note = notes_db[note_id]
    if update.title is not None:
        note["title"] = update.title
    if update.content is not None:
        note["content"] = update.content
    if update.tags is not None:
        note["tags"] = update.tags
    if update.pinned is not None:
        note["pinned"] = update.pinned
    note["updated_at"] = datetime.utcnow().isoformat()
    return note


@router.delete("/{note_id}", summary="Delete a note")
def delete_note(note_id: str):
    if note_id not in notes_db:
        raise HTTPException(status_code=404, detail="Note not found")
    del notes_db[note_id]
    return {"message": "Note deleted successfully"}
