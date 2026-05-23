from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.insurance import InsuranceItem
from app.models.sensory_log import SensoryLogEntry
from app.models.user import User
from app.schemas.insurance import InsuranceCreate, InsuranceResponse
from app.schemas.logs import SensoryLogCreate, SensoryLogResponse


router = APIRouter()


def build_log_response(log: SensoryLogEntry) -> SensoryLogResponse:
    return SensoryLogResponse(
        id=str(log.id),
        user_id=str(log.user_id),
        stress_level=log.stress_level,
        environment=log.environment,
        triggers=log.triggers,
        notes=log.notes,
        timestamp=log.timestamp,
    )


@router.post("", response_model=SensoryLogResponse, status_code=status.HTTP_201_CREATED)
async def create_log(
    payload: SensoryLogCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SensoryLogResponse:
    log = SensoryLogEntry(
        user_id=current_user.id,
        stress_level=payload.stress_level,
        environment=payload.environment,
        triggers=payload.triggers,
        notes=payload.notes,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)
    return build_log_response(log)


@router.get("", response_model=list[SensoryLogResponse])
async def list_logs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[SensoryLogResponse]:
    result = await db.execute(
        select(SensoryLogEntry)
        .where(SensoryLogEntry.user_id == current_user.id)
        .order_by(SensoryLogEntry.timestamp.desc())
    )
    logs = result.scalars().all()
    return [build_log_response(log) for log in logs]


@router.get("/{log_id}", response_model=SensoryLogResponse)
async def get_log(
    log_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> SensoryLogResponse:
    result = await db.execute(
        select(SensoryLogEntry).where(
            SensoryLogEntry.id == log_id,
            SensoryLogEntry.user_id == current_user.id,
        )
    )
    log = result.scalar_one_or_none()
    if log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log not found")

    return build_log_response(log)


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_log(
    log_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    result = await db.execute(
        select(SensoryLogEntry).where(
            SensoryLogEntry.id == log_id,
            SensoryLogEntry.user_id == current_user.id,
        )
    )
    log = result.scalar_one_or_none()
    if log is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Log not found")

    await db.delete(log)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
