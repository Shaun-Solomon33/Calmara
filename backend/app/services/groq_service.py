import json
import logging
import re
from typing import Any

from fastapi import HTTPException, status
from groq import AsyncGroq

from app.core.config import get_settings


logger = logging.getLogger(__name__)
BANNED_STORY_TERMS = {
    "needle",
    "needles",
    "shot",
    "shots",
    "poke",
    "pokes",
    "blood",
    "pain",
    "painful",
    "scary",
    "hurt",
    "hurts",
}
STORY_SEQUENCE = [
    "arriving",
    "waiting room",
    "nurse",
    "doctor",
    "procedure",
    "leaving",
]


class GroqService:
    def __init__(self) -> None:
        self._client: AsyncGroq | None = None
        self._model = "llama-3.3-70b-versatile"

    def _get_client(self) -> AsyncGroq:
        if self._client is None:
            settings = get_settings()
            self._client = AsyncGroq(api_key=settings.groq_api_key)
        return self._client

    async def _request_text(
        self,
        *,
        user_prompt: str,
        system_prompt: str | None = None,
        json_mode: bool = False,
    ) -> str:
        messages: list[dict[str, str]] = []
        if system_prompt is not None:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": user_prompt})

        kwargs: dict[str, Any] = {
            "model": self._model,
            "messages": messages,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = await self._get_client().chat.completions.create(**kwargs)
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from Groq")
        return content

    async def _request_text_from_messages(self, messages: list[dict[str, str]]) -> str:
        response = await self._get_client().chat.completions.create(
            model=self._model,
            messages=messages,
        )
        content = response.choices[0].message.content
        if not content:
            raise ValueError("Empty response from Groq")
        return content

    async def _request_json(
        self,
        *,
        user_prompt: str,
        system_prompt: str | None = None,
    ) -> dict[str, Any]:
        content = await self._request_text(
            user_prompt=user_prompt,
            system_prompt=system_prompt,
            json_mode=True,
        )
        return json.loads(content)

    def _normalize_text(self, value: Any) -> str:
        if not isinstance(value, str):
            return ""
        return re.sub(r"\s+", " ", value).strip()

    def _contains_banned_terms(self, value: str) -> bool:
        lowered = value.lower()
        return any(term in lowered for term in BANNED_STORY_TERMS)

    def _is_readable_story_text(self, value: str) -> bool:
        if len(value) < 8 or len(value) > 220:
            return False
        if "�" in value or "\n" in value:
            return False
        allowed_chars = sum(
            1 for char in value if char.isalnum() or char in " .,!?'-"
        )
        if allowed_chars / max(len(value), 1) < 0.85:
            return False
        alpha_chars = sum(1 for char in value if char.isalpha())
        if alpha_chars < 6:
            return False
        return True

    def _has_supported_story_pov(self, value: str, user_input: dict) -> bool:
        lowered = value.lower()
        normalized_name = self._normalize_text(user_input.get("name")).lower()
        pov_markers = (" i ", " i'm", " i’ll", " i will", " my ", " me ", " you ", " your ", " we ", " our ")
        padded = f" {lowered} "
        if any(marker in padded for marker in pov_markers):
            return True
        return bool(normalized_name and normalized_name in lowered)

    def _is_readable_image_prompt(self, value: str) -> bool:
        if len(value) < 8 or len(value) > 180:
            return False
        if "�" in value:
            return False
        allowed_chars = sum(
            1 for char in value if char.isalnum() or char in " ,.-'"
        )
        return allowed_chars / max(len(value), 1) >= 0.85

    def _fallback_story_text(self, phase: str, user_input: dict) -> str:
        name = self._normalize_text(user_input.get("name")) or "I"
        appointment_type = self._normalize_text(user_input.get("appointmentType")) or "appointment"
        doctor_name = self._normalize_text(user_input.get("doctorName")) or "the doctor"

        fallbacks = {
            "arriving": f"{name} can walk into the clinic calmly for the {appointment_type.lower()}.",
            "waiting room": f"{name} can take slow breaths and feel safe in the waiting room.",
            "nurse": f"A friendly nurse can greet {name} and explain each step clearly.",
            "doctor": f"{doctor_name} can speak gently and help {name} feel comfortable.",
            "procedure": f"{name} can stay brave while the care team helps with the visit.",
            "leaving": f"After the visit, {name} can leave knowing they did a great job.",
        }
        return fallbacks.get(phase, f"{name} can take this visit one calm step at a time.")

    def _fallback_image_prompt(self, phase: str, user_input: dict) -> str:
        appointment_type = self._normalize_text(user_input.get("appointmentType")) or "medical visit"
        fallbacks = {
            "arriving": f"gentle child arriving at a clinic for a {appointment_type.lower()}, family nearby, calm smiles",
            "waiting room": "quiet waiting room, child taking deep breaths, soft chairs, peaceful atmosphere",
            "nurse": "friendly nurse greeting child kindly in a bright calm room",
            "doctor": "kind doctor talking gently with child, warm clinic room, reassuring atmosphere",
            "procedure": "child sitting calmly with supportive care team, peaceful and brave mood",
            "leaving": "child leaving clinic feeling proud and relaxed, sunny gentle watercolor scene",
        }
        return fallbacks.get(phase, "gentle clinic scene, calm child, warm watercolor storybook style")

    def _has_story_voice(self, value: str, user_input: dict) -> bool:
        normalized_value = value.lower().replace("’", "'")
        lowered = f" {normalized_value} "
        normalized_name = self._normalize_text(user_input.get("name")).lower()
        markers = (
            " i ",
            " i'm ",
            " i'll ",
            " i will ",
            " my ",
            " me ",
            " you ",
            " your ",
            " we ",
            " our ",
        )
        if any(marker in lowered for marker in markers):
            return True
        return bool(normalized_name and normalized_name in lowered)

    def _sanitize_story_step(self, step: dict[str, Any], phase: str, user_input: dict) -> dict[str, str]:
        story_text = self._normalize_text(step.get("story_text"))
        image_prompt = self._normalize_text(step.get("image_prompt"))

        if (
            not self._is_readable_story_text(story_text)
            or not self._has_story_voice(story_text, user_input)
            or self._contains_banned_terms(story_text)
        ):
            story_text = self._fallback_story_text(phase, user_input)

        if story_text[-1:] not in {".", "!", "?"}:
            story_text = f"{story_text}."

        if (
            not self._is_readable_image_prompt(image_prompt)
            or self._contains_banned_terms(image_prompt)
        ):
            image_prompt = self._fallback_image_prompt(phase, user_input)

        return {"text": story_text, "imagePrompt": image_prompt}

    async def generate_story_steps(self, user_input: dict) -> list[dict]:
        try:
            payload = await self._request_json(
                system_prompt=(
                    "You are a compassionate assistant creating visual social stories for "
                    "autistic individuals preparing for medical appointments. Never use words like "
                    "needle, shot, poke, or blood. Use positive brave language. "
                    "Output must be in clear plain English only, with no gibberish, no symbols, and no non-English text. "
                    "Return valid JSON only."
                ),
                user_prompt=(
                    "Create a simple reassuring step-by-step social story for an autistic individual \n"
                    "preparing for a medical appointment.\n"
                    "For each step provide:\n"
                    "1. story_text: A single simple sentence in first or second person.\n"
                    "2. image_prompt: Short SFW prompt for image generator. \n"
                    "   Avoid: needle, shot, poke, blood. Focus on positive emotional state.\n\n"
                    "Hard rules:\n"
                    "- English only\n"
                    "- No gibberish, broken words, or nonsense text\n"
                    "- No scary or painful language\n"
                    "- Keep each story_text to one short readable sentence\n"
                    "- Keep each image_prompt short, concrete, and child-safe\n\n"
                    "Personalization:\n"
                    f"- Name: {user_input['name']}\n"
                    f"- Age: {user_input['age']}\n"
                    f"- Communication Style: {user_input['communicationStyle']}\n"
                    f"- Sensory Sensitivities: {user_input['sensorySensitivities']}\n"
                    f"- Anxiety Triggers: {user_input['anxietyTriggers']}\n"
                    f"- Doctor Name: {user_input['doctorName']}\n"
                    f"- Appointment Type: {user_input['appointmentType']}\n\n"
                    "Sequence: arriving, waiting room, nurse, doctor, procedure, leaving.\n"
                    "Generate exactly 6 steps in that sequence order.\n"
                    'Return JSON: {"story_steps": [{"story_text": str, "image_prompt": str}]}'
                ),
            )
            raw_steps = payload.get("story_steps", [])
            if not isinstance(raw_steps, list):
                raise ValueError("story_steps must be a list")

            sanitized_steps = [
                self._sanitize_story_step(
                    raw_steps[index] if index < len(raw_steps) and isinstance(raw_steps[index], dict) else {},
                    phase,
                    user_input,
                )
                for index, phase in enumerate(STORY_SEQUENCE)
            ]
            return sanitized_steps
        except Exception as exc:
            logger.exception("generate_story_steps failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def generate_environmental_prep(self, user_input: dict) -> dict:
        try:
            return await self._request_json(
                user_prompt=(
                    "Generate a sensory profile and preparation checklist.\n"
                    f"- Appointment Type: {user_input['appointmentType']}\n"
                    f"- Sensory Sensitivities: {user_input['sensorySensitivities']}\n"
                    f"- Anxiety Triggers: {user_input['anxietyTriggers']}\n\n"
                    '1. sensoryProfile: 3-4 points on what to expect (sounds, lights, smells).\n'
                    '   Each: {"title": str, "description": str}\n'
                    '2. checklist: 4-5 actionable prep items addressing sensitivities.\n'
                    '   Each: {"item": str, "reason": str}\n\n'
                    'Return JSON: {"sensoryProfile": [...], "checklist": [...]}'
                )
            )
        except Exception as exc:
            logger.exception("generate_environmental_prep failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def translate_behavior(self, behavior: str) -> str:
        try:
            return await self._request_text(
                system_prompt="You are an expert in both autism and clinical practice.",
                user_prompt=(
                    "Translate this behavior into objective non-judgmental clinical language \n"
                    "a medical professional can understand. Explain the likely underlying reason \n"
                    "(sensory overload, anxiety, self-regulation) and what it indicates.\n\n"
                    f'Behavior: "{behavior}"\n\n'
                    "Concise, professional, empathetic. Start with direct translation then reason."
                ),
            )
        except Exception as exc:
            logger.exception("translate_behavior failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def simplify_jargon(self, jargon: str) -> dict:
        try:
            payload = await self._request_json(
                user_prompt=(
                    "Simplify this medical jargon into plain language and provide a visual diagram concept.\n\n"
                    f'Medical Jargon: "{jargon}"\n\n'
                    "Return JSON:\n"
                    "{\n"
                    '  "simplification_text": "simple clear reassuring explanation, no technical terms",\n'
                    '  "image_prompt": "short SFW prompt for simple diagram using shapes and metaphors"\n'
                    "}"
                )
            )
            return {
                "simplificationText": payload["simplification_text"],
                "imagePrompt": payload["image_prompt"],
            }
        except Exception as exc:
            logger.exception("simplify_jargon failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def generate_emergency_protocol(self, profile: dict) -> str:
        try:
            return await self._request_text(
                user_prompt=(
                    "Create a concise clear actionable Emergency Protocol for an autistic individual \n"
                    "for caregivers or first responders during a crisis or meltdown.\n\n"
                    f"- Communication Needs: {profile['communication']}\n"
                    f"- Sensory Triggers: {profile['sensory']}\n"
                    f"- Calming Strategies: {profile['calming']}\n"
                    f"- Important Accommodations: {profile['accommodations']}\n\n"
                    "Simple direct language. Sections: 'If I Become Overwhelmed', \n"
                    "'Key Sensory Information', 'Effective Calming Methods'.\n"
                    "Focus on de-escalation and safety. Brief and easy to scan."
                )
            )
        except Exception as exc:
            logger.exception("generate_emergency_protocol failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def generate_provider_guide(self, profile: dict, name: str) -> str:
        try:
            return await self._request_text(
                user_prompt=(
                    f"Create a one-page 'How to Work with Me' guide for a new doctor for {name}.\n\n"
                    f"- Communication Preferences: {profile['communication']}\n"
                    f"- Sensory Sensitivities: {profile['sensory']}\n"
                    f"- Successful Calming Strategies: {profile['calming']}\n"
                    f"- Necessary Medical Accommodations: {profile['accommodations']}\n\n"
                    "Brief positive introduction. Headings: 'Communication Style', \n"
                    "'Sensory Environment', 'Appointments & Procedures', 'In Case of Stress'.\n"
                    "Present as helpful tips. Concise and respectful."
                )
            )
        except Exception as exc:
            logger.exception("generate_provider_guide failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def find_resources(self, query: dict) -> list[dict]:
        try:
            payload = await self._request_json(
                user_prompt=(
                    "Find relevant local support services for families of autistic individuals.\n\n"
                    f'- Looking for: "{query["need"]}"\n'
                    f'- Child age: {query["age"]}\n'
                    f'- Near: "{query["location"]}"\n\n'
                    "Generate 3-5 realistic resources typical in a city.\n"
                    "type must be one of: Therapy Center, Respite Care, Support Group, \n"
                    "Government Program, Advocacy Group, Other\n\n"
                    'Return JSON: {"resources": [{"name": str, "type": str, \n'
                    '"description": str, "contactInfo": str}]}'
                )
            )
            return payload["resources"]
        except Exception as exc:
            logger.exception("find_resources failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def analyze_sensory_patterns(self, logs: list[dict]) -> str:
        try:
            formatted_logs = "\n".join(
                (
                    f'- On {log["timestamp"]}, in "{log["environment"]}", stress was '
                    f'{log["stressLevel"]}/10. Triggers: {log["triggers"]}'
                )
                for log in logs
            )
            return await self._request_text(
                user_prompt=(
                    "You are an expert in sensory processing and autism. Analyze these sensory \n"
                    "log entries to identify patterns and provide actionable insights.\n\n"
                    f"{formatted_logs}\n\n"
                    "Instructions:\n"
                    "1. Identify recurring triggers or environments with high stress (6+/10)\n"
                    "2. Point out clear correlations\n"
                    "3. Suggest 2-3 simple actionable coping strategies based ONLY on patterns\n"
                    "4. Tone: supportive, gentle, encouraging\n"
                    "5. Use headings/bullets. If no clear patterns, encourage more logging."
                )
            )
        except Exception as exc:
            logger.exception("analyze_sensory_patterns failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def simplify_insurance_jargon(self, jargon: str) -> str:
        try:
            return await self._request_text(
                user_prompt=(
                    "You are an expert in health insurance communication. Simplify this \n"
                    "insurance jargon into plain easy-to-understand language for a stressed \n"
                    "caregiver. Clear, concise, and reassuring.\n\n"
                    f'Insurance Jargon: "{jargon}"'
                )
            )
        except Exception as exc:
            logger.exception("simplify_insurance_jargon failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def generate_appeal_letter(self, item: dict) -> str:
        try:
            return await self._request_text(
                user_prompt=(
                    "Write a formal appeal letter for a denied insurance claim.\n"
                    "Professional, firm, polite.\n\n"
                    f"- Service/Procedure: {item['service_name']}\n"
                    f"- Date Submitted: {item['date_submitted']}\n"
                    f"- Type: {item['type']}\n"
                    f"- Caregiver Notes: {item['notes']}\n\n"
                    "Include placeholders: [Your Name], [Your Address], [Policy Number], \n"
                    "[Date], [Insurance Company Name], [Claim/Reference Number].\n"
                    f"State purpose: appeal the denial of {item['service_name']}.\n"
                    "Request written explanation for denial and specific policy provision.\n"
                    "Conclude: looks forward to prompt review and reversal.\n"
                    "Concise and to the point."
                )
            )
        except Exception as exc:
            logger.exception("generate_appeal_letter failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def find_peer_matches(self, query: dict) -> list[dict]:
        try:
            payload = await self._request_json(
                user_prompt=(
                    "Create 3-4 supportive peer caregiver profiles.\n\n"
                    f"- Child Age: {query['childAge']}\n"
                    f'- Location: "{query["location"]}"\n'
                    f"- Shared Challenges: {query['challenges']}\n\n"
                    "For each: name, friendly bio, sharedInterests (list), \n"
                    "connectionReason (reference user's profile directly).\n"
                    "Authentic, encouraging, diverse, positive.\n\n"
                    'Return JSON: {"peers": [{"name": str, "bio": str, \n'
                    '"sharedInterests": [str], "connectionReason": str}]}'
                )
            )
            return payload["peers"]
        except Exception as exc:
            logger.exception("find_peer_matches failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def generate_advocacy_letter(self, query: dict) -> str:
        try:
            return await self._request_text(
                user_prompt=(
                    "Write a formal advocacy letter for a caregiver of a person with a disability.\n"
                    "Professional, firm, clear.\n\n"
                    f"Letter Type: {query['letterType']}\n"
                    f'Key Details: "{query["details"]}"\n\n'
                    "Placeholders: [Your Name], [Your Address], [Date], \n"
                    "[Recipient Name/Title], [Recipient Organization]\n\n"
                    "Based on type:\n"
                    "- School Accommodation: Reference ADA/IDEA, state specific accommodation\n"
                    "- Insurance Appeal: State denied service, intent to appeal, \n"
                    "  request specific policy language\n"
                    "- Procedural Change Request: Outline issue, propose specific change\n\n"
                    "Incorporate user details. Conclude with clear call to action.\n"
                    "Concise, factual, to the point."
                )
            )
        except Exception as exc:
            logger.exception("generate_advocacy_letter failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc

    async def simulate_receptionist(self, message: str, history: list[dict]) -> str:
        try:
            messages: list[dict[str, str]] = [
                {
                    "role": "system",
                    "content": (
                        "You are a friendly patient doctor's office receptionist helping an autistic "
                        "patient practice their upcoming appointment. Be predictable, calm, reassuring. "
                        "Never mention pain, needles, or frightening procedures. Simple clear language."
                    ),
                }
            ]
            for item in history:
                role = item.get("role")
                content = item.get("content")
                if role in {"user", "assistant", "system"} and isinstance(content, str):
                    messages.append({"role": role, "content": content})
            messages.append({"role": "user", "content": message})
            return await self._request_text_from_messages(messages)
        except Exception as exc:
            logger.exception("simulate_receptionist failed")
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="AI service temporarily unavailable",
            ) from exc


groq_service = GroqService()
