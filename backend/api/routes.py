from fastapi import APIRouter, HTTPException
from ..models.translation import TranslateRequest, TranslateResponse
from ..services.translator import translate_text, supported_languages

router = APIRouter()

@router.get('/languages')
def get_languages():
    return {'languages': supported_languages()}

@router.post('/translate', response_model=TranslateResponse)
def translate(request: TranslateRequest):
    try:
        result = translate_text(request.text, request.source, request.target)
        return TranslateResponse(**result)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
