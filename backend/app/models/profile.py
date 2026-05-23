import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON, String, Text, Uuid, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class MedicalProfile(Base):
    __tablename__ = "medical_profiles"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    age: Mapped[int] = mapped_column(nullable=False)
    communication_style: Mapped[str] = mapped_column(String(255), nullable=False)
    sensitivities: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    triggers: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    calming_strategies: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    emergency_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    provider_guide: Mapped[str | None] = mapped_column(Text, nullable=True)
    emergency_protocol: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=True,
    )

    user = relationship("User", back_populates="medical_profile")
