import pytest
from fastapi import HTTPException

from app.services.groq_service import GroqService


class MockMessage:
    def __init__(self, content: str) -> None:
        self.content = content


class MockChoice:
    def __init__(self, content: str) -> None:
        self.message = MockMessage(content)


class MockResponse:
    def __init__(self, content: str) -> None:
        self.choices = [MockChoice(content)]


class MockCompletions:
    def __init__(self, content: str | None = None, error: Exception | None = None) -> None:
        self.content = content
        self.error = error

    async def create(self, **_: object) -> MockResponse:
        if self.error is not None:
            raise self.error
        return MockResponse(self.content or "")


class MockChat:
    def __init__(self, content: str | None = None, error: Exception | None = None) -> None:
        self.completions = MockCompletions(content=content, error=error)


class MockClient:
    def __init__(self, content: str | None = None, error: Exception | None = None) -> None:
        self.chat = MockChat(content=content, error=error)


def build_service(content: str | None = None, error: Exception | None = None) -> GroqService:
    service = GroqService()
    service._client = MockClient(content=content, error=error)  # type: ignore[assignment]
    return service


@pytest.mark.asyncio
async def test_translate_behavior_returns_non_empty_string() -> None:
    service = build_service(content="Direct translation. Likely anxiety-related self-regulation.")

    result = await service.translate_behavior("Covering ears and pacing")

    assert isinstance(result, str)
    assert result


@pytest.mark.asyncio
async def test_simplify_jargon_returns_expected_keys() -> None:
    service = build_service(
        content='{"simplification_text":"Simple explanation","image_prompt":"Simple diagram"}'
    )

    result = await service.simplify_jargon("Hypertension")

    assert result["simplificationText"] == "Simple explanation"
    assert result["imagePrompt"] == "Simple diagram"


@pytest.mark.asyncio
async def test_generate_story_steps_returns_mapped_fields() -> None:
    service = build_service(
        content=(
            '{"story_steps":[{"story_text":"I walk in calmly.","image_prompt":"calm clinic entrance"}]}'
        )
    )

    result = await service.generate_story_steps(
        {
            "name": "Ava",
            "age": 9,
            "communicationStyle": "visual",
            "sensorySensitivities": ["noise"],
            "anxietyTriggers": ["waiting"],
            "doctorName": "Dr. Lee",
            "appointmentType": "checkup",
        }
    )

    assert len(result) == 6
    assert result[0] == {"text": "I walk in calmly.", "imagePrompt": "calm clinic entrance"}
    assert result[1]["text"].endswith(".")
    assert len(result[1]["imagePrompt"]) > 8


@pytest.mark.asyncio
async def test_generate_story_steps_sanitizes_garbled_or_unsafe_output() -> None:
    service = build_service(
        content=(
            '{"story_steps":['
            '{"story_text":"M. Th\\u2019s might, is boy: beged Five be brom","image_prompt":"blood draw room"},'
            '{"story_text":"I wait calmly.","image_prompt":"quiet waiting room"},'
            '{"story_text":"%%%","image_prompt":"%%%"}'
            ']}'
        )
    )

    result = await service.generate_story_steps(
        {
            "name": "Ali",
            "age": 8,
            "communicationStyle": "visual",
            "sensorySensitivities": ["noise"],
            "anxietyTriggers": ["waiting"],
            "doctorName": "Dr. Smith",
            "appointmentType": "Eye Doctor",
        }
    )

    assert len(result) == 6
    assert "blood" not in result[0]["imagePrompt"].lower()
    assert "Ali" in result[0]["text"]
    assert result[0]["text"].endswith(".")
    assert result[2]["text"].endswith(".")
    assert len(result[2]["imagePrompt"]) > 8


@pytest.mark.asyncio
async def test_function_raises_503_when_groq_fails() -> None:
    service = build_service(error=Exception("Groq unavailable"))

    with pytest.raises(HTTPException) as exc_info:
        await service.translate_behavior("Hiding under chair")

    assert exc_info.value.status_code == 503
    assert exc_info.value.detail == "AI service temporarily unavailable"
