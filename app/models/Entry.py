from pydantic import BaseModel, Field
from typing import Optional


class EntryCreate(BaseModel):
    glucose: int = Field(..., ge=40, le=500)
    meal: Optional[str] = None
    exercise_minutes: int = Field(default=0, ge=0, le=600)
    notes: Optional[str] = Field(default=None, max_length=300)


class Entry(BaseModel):
    id: int
    glucose: int
    meal: Optional[str]
    exercise_minutes: int
    notes: Optional[str]
    created_at: str