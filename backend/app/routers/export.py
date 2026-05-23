from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.insurance import InsuranceItem
from app.models.profile import MedicalProfile
from app.models.sensory_log import SensoryLogEntry
from app.models.user import User
from app.routers.insurance import build_insurance_response
from app.routers.logs import build_log_response
from app.routers.profile import build_profile_response
from app.schemas.export import ExportProfileResponse


router = APIRouter()


@router.get("/profile", response_model=ExportProfileResponse)
async def export_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> JSONResponse:
    profile_result = await db.execute(
        select(MedicalProfile).where(MedicalProfile.user_id == current_user.id)
    )
    logs_result = await db.execute(
        select(SensoryLogEntry)
        .where(SensoryLogEntry.user_id == current_user.id)
        .order_by(SensoryLogEntry.timestamp.desc())
    )
    insurance_result = await db.execute(
        select(InsuranceItem)
        .where(InsuranceItem.user_id == current_user.id)
        .order_by(InsuranceItem.created_at.desc())
    )

    profile = profile_result.scalar_one_or_none()
    logs = logs_result.scalars().all()
    insurance_items = insurance_result.scalars().all()

    payload = ExportProfileResponse(
        profile=build_profile_response(profile) if profile is not None else None,
        sensory_logs=[build_log_response(log) for log in logs],
        insurance_items=[build_insurance_response(item) for item in insurance_items],
    )
    return JSONResponse(
        content=payload.model_dump(mode="json"),
        headers={"Content-Disposition": 'attachment; filename="calmara_profile.json"'},
    )
