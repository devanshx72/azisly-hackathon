from typing import Optional
from fastapi import Header
from .database import get_db

DEFAULT_DEVICE_ID = "default"


def get_device_id(x_device_id: Optional[str] = Header(None, alias="X-Device-Id")) -> str:
    """
    Extracts device partition key from X-Device-Id header.
    Per architecture rules:
    - If header is absent, whitespace-only, or null -> falls back to 'default'.
    - Never throws 400/401/403 for missing or unrecognized keys.
    """
    if not x_device_id or not x_device_id.strip():
        return DEFAULT_DEVICE_ID
    return x_device_id.strip()
