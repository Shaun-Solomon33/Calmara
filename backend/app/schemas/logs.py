from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SensoryLogCreate(BaseModel):
    stress_level: int = Field(ge=1, le=10)
    environment: str
    triggers: list[str]
    notes: str | None = None


class SensoryLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    stress_level: int
    environment: str
    triggers: list[str]
    notes: str | None
    timestamp: datetime
