from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ProfileCreate(BaseModel):
    name: str
    age: int
    communication_style: str
    sensitivities: list[str]
    triggers: list[str]
    calming_strategies: list[str]
    emergency_notes: str | None = None


class ProfileUpdate(BaseModel):
    name: str | None = None
    age: int | None = None
    communication_style: str | None = None
    sensitivities: list[str] | None = None
    triggers: list[str] | None = None
    calming_strategies: list[str] | None = None
    emergency_notes: str | None = None


class ProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    name: str
    age: int
    communication_style: str
    sensitivities: list[str]
    triggers: list[str]
    calming_strategies: list[str]
    emergency_notes: str | None
    provider_guide: str | None
    emergency_protocol: str | None
    created_at: datetime
