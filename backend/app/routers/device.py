from fastapi import APIRouter, Depends
from ..dependencies import get_device_id
from ..schemas import DeviceResponse

router = APIRouter(prefix="/api/device", tags=["Device / Identity"])


@router.get(
    "/current",
    response_model=DeviceResponse,
    summary="Get active device ID partition key (No-auth identity)",
)
def get_current_device(device_id: str = Depends(get_device_id)):
    """
    Returns the active device ID partition key.
    
    PlanetPulse uses zero authentication. This ID is purely a client-provided
    data partition bookmark passed via the X-Device-Id header. If the header
    is omitted, this endpoint transparently defaults to 'default'.
    """
    return DeviceResponse(
        device_id=device_id,
        message="Active data partition key successfully resolved without authentication.",
    )
