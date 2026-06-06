from pydantic import BaseModel

class TranslateRequest(BaseModel):
    text: str
    source: str
    target: str

class TranslateResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str
    confidence: str
    elapsed_ms: int
