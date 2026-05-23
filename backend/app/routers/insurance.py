from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.insurance import InsuranceItem
from app.models.user import User
from app.schemas.insurance import InsuranceCreate, InsuranceResponse


router = APIRouter()


def build_insurance_response(item: InsuranceItem) -> InsuranceResponse:
    return InsuranceResponse(
        id=str(item.id),
        user_id=str(item.user_id),
        service_name=item.service_name,
        date_submitted=item.date_submitted,
        type=item.type,
        notes=item.notes,
        status=item.status,
        denial_reason=item.denial_reason,
        appeal_letter=item.appeal_letter,
        created_at=item.created_at,
    )


@router.post("", response_model=InsuranceResponse, status_code=status.HTTP_201_CREATED)
async def create_insurance_item(
    payload: InsuranceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InsuranceResponse:
    item = InsuranceItem(
        user_id=current_user.id,
        service_name=payload.service_name,
        date_submitted=payload.date_submitted,
        type=payload.type,
        notes=payload.notes,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return build_insurance_response(item)


@router.get("", response_model=list[InsuranceResponse])
async def list_insurance_items(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[InsuranceResponse]:
    result = await db.execute(
        select(InsuranceItem)
        .where(InsuranceItem.user_id == current_user.id)
        .order_by(InsuranceItem.created_at.desc())
    )
    items = result.scalars().all()
    return [build_insurance_response(item) for item in items]


@router.get("/{item_id}", response_model=InsuranceResponse)
async def get_insurance_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> InsuranceResponse:
    result = await db.execute(
        select(InsuranceItem).where(
            InsuranceItem.id == item_id,
            InsuranceItem.user_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insurance item not found")

    return build_insurance_response(item)


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_insurance_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    result = await db.execute(
        select(InsuranceItem).where(
            InsuranceItem.id == item_id,
            InsuranceItem.user_id == current_user.id,
        )
    )
    item = result.scalar_one_or_none()
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Insurance item not found")

    await db.delete(item)
    await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
