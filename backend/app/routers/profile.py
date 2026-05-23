from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.profile import MedicalProfile
from app.models.user import User
from app.schemas.profile import ProfileCreate, ProfileResponse, ProfileUpdate


router = APIRouter()


def build_profile_response(profile: MedicalProfile) -> ProfileResponse:
    return ProfileResponse(
        id=str(profile.id),
        user_id=str(profile.user_id),
        name=profile.name,
        age=profile.age,
        communication_style=profile.communication_style,
        sensitivities=profile.sensitivities,
        triggers=profile.triggers,
        calming_strategies=profile.calming_strategies,
        emergency_notes=profile.emergency_notes,
        provider_guide=profile.provider_guide,
        emergency_protocol=profile.emergency_protocol,
        created_at=profile.created_at,
    )


async def get_profile_for_user(db: AsyncSession, user_id: str) -> MedicalProfile | None:
    result = await db.execute(select(MedicalProfile).where(MedicalProfile.user_id == user_id))
    return result.scalar_one_or_none()


@router.post("", response_model=ProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_profile(
    payload: ProfileCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    existing_profile = await get_profile_for_user(db, current_user.id)
    if existing_profile is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists",
        )

    profile = MedicalProfile(
        user_id=current_user.id,
        name=payload.name,
        age=payload.age,
        communication_style=payload.communication_style,
        sensitivities=payload.sensitivities,
        triggers=payload.triggers,
        calming_strategies=payload.calming_strategies,
        emergency_notes=payload.emergency_notes,
    )
    db.add(profile)
    await db.commit()
    await db.refresh(profile)
    return build_profile_response(profile)


@router.get("", response_model=ProfileResponse)
async def get_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    profile = await get_profile_for_user(db, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return build_profile_response(profile)


@router.put("", response_model=ProfileResponse)
async def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ProfileResponse:
    profile = await get_profile_for_user(db, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    await db.commit()
    await db.refresh(profile)
    return build_profile_response(profile)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def delete_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    profile = await get_profile_for_user(db, current_user.id)
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    await db.delete(profile)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
