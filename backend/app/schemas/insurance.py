from datetime import datetime

from pydantic import BaseModel, ConfigDict


class InsuranceCreate(BaseModel):
    service_name: str
    date_submitted: str
    type: str
    notes: str | None = None


class InsuranceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    service_name: str
    date_submitted: str
    type: str
    notes: str | None
    status: str
    denial_reason: str | None
    appeal_letter: str | None
    created_at: datetime
