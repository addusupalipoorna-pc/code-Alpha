from fastapi import APIRouter, HTTPException, UploadFile, File
from backend.models.translation import TranslateRequest, TranslateResponse
from backend.services.translator import translate_text, supported_languages
import speech_recognition as sr
import io

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

@router.post('/transcribe')
async def transcribe(lang: str = 'en-US', file: UploadFile = File(...)):
    try:
        audio_bytes = await file.read()
        recognizer = sr.Recognizer()
        
        # Load WAV bytes
        audio_file = io.BytesIO(audio_bytes)
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)
            
        # Transcribe with SpeechRecognition (uses Google Web Speech API free endpoint)
        text = recognizer.recognize_google(audio_data, language=lang)
        return {'text': text}
    except sr.UnknownValueError:
        return {'text': '', 'error': 'Could not understand the audio.'}
    except sr.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Google Speech service error: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription error: {str(e)}")


import urllib.request
import json

from pydantic import BaseModel

class SubscribeRequest(BaseModel):
    name: str
    email: str
    contact: str
    password: str

@router.post('/subscribe')
def subscribe(request: SubscribeRequest):
    print("=========================================")
    print("         NEW SUBSCRIPTION SUBMITTED       ")
    print(f"Name: {request.name}")
    print(f"Email: {request.email}")
    print(f"Contact: {request.contact}")
    print(f"Password: {request.password}")
    print("Forwarding payload to: addusupalipoorna@gmail.com via FormSubmit.co")
    print("=========================================")
    
    # Post to FormSubmit.co
    url = "https://formsubmit.co/ajax/addusupalipoorna@gmail.com"
    payload = {
        "name": request.name,
        "email": request.email,
        "contact": request.contact,
        "password": request.password
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
        }
    )
    
    import ssl
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            res_body = response.read().decode('utf-8')
            print("FormSubmit Response:", res_body)
    except Exception as e:
        print("Failed to forward email via FormSubmit:", e)
        
    return {'status': 'success', 'message': 'Subscription submitted successfully.'}

