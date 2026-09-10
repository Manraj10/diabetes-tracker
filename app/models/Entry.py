from pydantic import BaseModel, Field
from typing import Optional


class EntryCreate(BaseModel):
    glucose: float = Field(..., ge=1.0, le=35.0)
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