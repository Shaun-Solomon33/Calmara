import asyncio
import time
from collections import defaultdict

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.security import get_current_user
from app.models.user import User
from app.schemas.ai import (
    AdvocacyLetterRequest,
    AnalysisResponse,
    AnalyzeLogsRequest,
    AppealLetterRequest,
    DocumentResponse,
    EmergencyProtocolRequest,
    EnvPrepRequest,
    EnvPrepResponse,
    FindResourcesRequest,
    InsuranceExplanationResponse,
    InsuranceJargonRequest,
    LetterResponse,
    PeerMatchesRequest,
    PeerMatchesResponse,
    ProviderGuideRequest,
    ResourcesResponse,
    SimplifyJargonRequest,
    SimplifyJargonResponse,
    SimulationRequest,
    SimulationResponse,
    StoryStepsRequest,
    StoryStepsResponse,
    StoryStepResponse,
    TranslateBehaviorRequest,
    TranslateBehaviorResponse,
)
from app.services.groq_service import groq_service
from app.services.image_service import image_service


router = APIRouter()
REQUEST_LOG: dict[str, list[float]] = defaultdict(list)
RATE_LIMIT = 15
RATE_WINDOW_SECONDS = 60


def enforce_ai_rate_limit(current_user: User = Depends(get_current_user)) -> User:
    now = time.time()
    user_id = str(current_user.id)
    recent_timestamps = [
        timestamp
        for timestamp in REQUEST_LOG[user_id]
        if now - timestamp < RATE_WINDOW_SECONDS
    ]
    if len(recent_timestamps) >= RATE_LIMIT:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit: 15 AI requests per minute",
        )

    recent_timestamps.append(now)
    REQUEST_LOG[user_id] = recent_timestamps
    return current_user


@router.post("/social-story", response_model=StoryStepsResponse)
async def social_story(
    payload: StoryStepsRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> StoryStepsResponse:
    steps = await groq_service.generate_story_steps(payload.model_dump())
    images = await asyncio.gather(
        *(image_service.generate_illustration(step["imagePrompt"]) for step in steps)
    )
    return StoryStepsResponse(
        steps=[
            StoryStepResponse(
                text=step["text"],
                imagePrompt=step["imagePrompt"],
                image_url=image_url,
            )
            for step, image_url in zip(steps, images, strict=False)
        ]
    )


@router.post("/env-prep", response_model=EnvPrepResponse)
async def env_prep(
    payload: EnvPrepRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> EnvPrepResponse:
    result = await groq_service.generate_environmental_prep(payload.model_dump())
    return EnvPrepResponse(**result)


@router.post("/translate", response_model=TranslateBehaviorResponse)
async def translate(
    payload: TranslateBehaviorRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> TranslateBehaviorResponse:
    result = await groq_service.translate_behavior(payload.behavior)
    return TranslateBehaviorResponse(clinical_language=result)


@router.post("/simplify", response_model=SimplifyJargonResponse)
async def simplify(
    payload: SimplifyJargonRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> SimplifyJargonResponse:
    result = await groq_service.simplify_jargon(payload.jargon)
    image_url = await image_service.generate_illustration(result["imagePrompt"])
    return SimplifyJargonResponse(
        simplificationText=result["simplificationText"],
        imagePrompt=result["imagePrompt"],
        imageUrl=image_url,
    )


@router.post("/emergency-protocol", response_model=DocumentResponse)
async def emergency_protocol(
    payload: EmergencyProtocolRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> DocumentResponse:
    document = await groq_service.generate_emergency_protocol(payload.model_dump())
    return DocumentResponse(document=document)


@router.post("/provider-guide", response_model=DocumentResponse)
async def provider_guide(
    payload: ProviderGuideRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> DocumentResponse:
    profile = payload.model_dump(exclude={"name"})
    document = await groq_service.generate_provider_guide(profile, payload.name)
    return DocumentResponse(document=document)


@router.post("/resources", response_model=ResourcesResponse)
async def resources(
    payload: FindResourcesRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> ResourcesResponse:
    result = await groq_service.find_resources(payload.model_dump())
    return ResourcesResponse(resources=result)


@router.post("/analyze-logs", response_model=AnalysisResponse)
async def analyze_logs(
    payload: AnalyzeLogsRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> AnalysisResponse:
    if len(payload.logs) < 2:
        return AnalysisResponse(analysis="Not enough data yet. Keep logging to see patterns.")

    analysis = await groq_service.analyze_sensory_patterns(payload.logs)
    return AnalysisResponse(analysis=analysis)


@router.post("/insurance-simplify", response_model=InsuranceExplanationResponse)
async def insurance_simplify(
    payload: InsuranceJargonRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> InsuranceExplanationResponse:
    explanation = await groq_service.simplify_insurance_jargon(payload.jargon)
    return InsuranceExplanationResponse(explanation=explanation)


@router.post("/appeal-letter", response_model=LetterResponse)
async def appeal_letter(
    payload: AppealLetterRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> LetterResponse:
    letter = await groq_service.generate_appeal_letter(payload.model_dump())
    return LetterResponse(letter=letter)


@router.post("/peer-matches", response_model=PeerMatchesResponse)
async def peer_matches(
    payload: PeerMatchesRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> PeerMatchesResponse:
    peers = await groq_service.find_peer_matches(payload.model_dump())
    return PeerMatchesResponse(peers=peers)


@router.post("/advocacy-letter", response_model=LetterResponse)
async def advocacy_letter(
    payload: AdvocacyLetterRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> LetterResponse:
    letter = await groq_service.generate_advocacy_letter(payload.model_dump())
    return LetterResponse(letter=letter)


@router.post("/simulate", response_model=SimulationResponse)
async def simulate(
    payload: SimulationRequest,
    _: User = Depends(enforce_ai_rate_limit),
) -> SimulationResponse:
    response = await groq_service.simulate_receptionist(payload.message, payload.history)
    return SimulationResponse(response=response)
