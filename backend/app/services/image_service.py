import asyncio
import base64
import logging
import re
from io import BytesIO

from huggingface_hub import AsyncInferenceClient

from app.core.config import get_settings


logger = logging.getLogger(__name__)


class ImageService:
    def __init__(self) -> None:
        self._client: AsyncInferenceClient | None = None

    def _get_client(self) -> AsyncInferenceClient:
        if self._client is None:
            self._client = AsyncInferenceClient(token=get_settings().hf_token)
        return self._client

    async def _generate_once(self, full_prompt: str):
        return await self._get_client().text_to_image(
            full_prompt,
            model="black-forest-labs/FLUX.1-schnell",
            num_inference_steps=4,
        )

    def _sanitize_prompt(self, prompt: str) -> str:
        cleaned = re.sub(r"\s+", " ", prompt).strip()
        cleaned = re.sub(r"[^A-Za-z0-9,.' -]", "", cleaned)
        return cleaned

    async def generate_illustration(self, prompt: str) -> str | None:
        safe_prompt = self._sanitize_prompt(prompt)
        full_prompt = (
            "soft watercolor children's illustration, gentle pastel colors, "
            "child-friendly, warm and safe atmosphere, no scary elements, "
            "simple and clear, full scene artwork, not a book page, "
            "absolutely no text, no letters, no words, no handwriting, "
            "no captions, no labels, no signage, no watermark, no typography, "
            + safe_prompt
        )

        try:
            try:
                image = await self._generate_once(full_prompt)
            except Exception as exc:
                response = getattr(exc, "response", None)
                status_code = getattr(response, "status_code", None)
                if status_code == 503 or "503" in str(exc):
                    await asyncio.sleep(20)
                    image = await self._generate_once(full_prompt)
                else:
                    raise

            buffer = BytesIO()
            image = image.convert("RGB")
            image.save(buffer, format="JPEG")
            encoded = base64.b64encode(buffer.getvalue()).decode()
            return f"data:image/jpeg;base64,{encoded}"
        except Exception:
            logger.exception("generate_illustration failed")
            return None


image_service = ImageService()
