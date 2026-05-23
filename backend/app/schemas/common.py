from pydantic import BaseModel


class StatusResponse(BaseModel):
    status: str


class HealthResponse(StatusResponse):
    version: str
