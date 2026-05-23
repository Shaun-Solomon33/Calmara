from pydantic import BaseModel


class StoryStepsRequest(BaseModel):
    name: str
    age: int
    communicationStyle: str
    sensorySensitivities: list[str]
    anxietyTriggers: list[str]
    doctorName: str
    appointmentType: str


class EnvPrepRequest(BaseModel):
    appointmentType: str
    sensorySensitivities: list[str]
    anxietyTriggers: list[str]


class TranslateBehaviorRequest(BaseModel):
    behavior: str


class SimplifyJargonRequest(BaseModel):
    jargon: str


class EmergencyProtocolRequest(BaseModel):
    communication: str
    sensory: str
    calming: str
    accommodations: str


class ProviderGuideRequest(BaseModel):
    communication: str
    sensory: str
    calming: str
    accommodations: str
    name: str


class FindResourcesRequest(BaseModel):
    need: str
    age: int
    location: str


class AnalyzeLogsRequest(BaseModel):
    logs: list[dict]


class InsuranceJargonRequest(BaseModel):
    jargon: str


class AppealLetterRequest(BaseModel):
    service_name: str
    date_submitted: str
    type: str
    notes: str


class PeerMatchesRequest(BaseModel):
    childAge: int
    location: str
    challenges: list[str]


class AdvocacyLetterRequest(BaseModel):
    letterType: str
    details: str


class SimulationRequest(BaseModel):
    message: str
    history: list[dict]


class StoryStepResponse(BaseModel):
    text: str
    imagePrompt: str
    image_url: str | None


class StoryStepsResponse(BaseModel):
    steps: list[StoryStepResponse]


class SensoryProfileItem(BaseModel):
    title: str
    description: str


class ChecklistItem(BaseModel):
    item: str
    reason: str


class EnvPrepResponse(BaseModel):
    sensoryProfile: list[SensoryProfileItem]
    checklist: list[ChecklistItem]


class TranslateBehaviorResponse(BaseModel):
    clinical_language: str


class SimplifyJargonResponse(BaseModel):
    simplificationText: str
    imagePrompt: str
    imageUrl: str | None


class DocumentResponse(BaseModel):
    document: str


class InsuranceExplanationResponse(BaseModel):
    explanation: str


class LetterResponse(BaseModel):
    letter: str


class ResourceItemResponse(BaseModel):
    name: str
    type: str
    description: str
    contactInfo: str


class ResourcesResponse(BaseModel):
    resources: list[ResourceItemResponse]


class PeerMatchResponse(BaseModel):
    name: str
    bio: str
    sharedInterests: list[str]
    connectionReason: str


class PeerMatchesResponse(BaseModel):
    peers: list[PeerMatchResponse]


class AnalysisResponse(BaseModel):
    analysis: str


class SimulationResponse(BaseModel):
    response: str
