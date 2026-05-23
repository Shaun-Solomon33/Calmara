from app.schemas.insurance import InsuranceResponse
from app.schemas.logs import SensoryLogResponse
from app.schemas.profile import ProfileResponse
from pydantic import BaseModel


class ExportProfileResponse(BaseModel):
    profile: ProfileResponse | None
    sensory_logs: list[SensoryLogResponse]
    insurance_items: list[InsuranceResponse]
