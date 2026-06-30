import time
import requests
import urllib3

# Disable SSL verification warnings and bypass verification to avoid SSLCertVerificationError on Windows
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Create a global, persistent session with connection pooling for fast keep-alive reuse
session = requests.Session()
session.verify = False

# Fallback translator in case JSON API fails
from deep_translator import GoogleTranslator

LANGUAGE_OPTIONS = {
    'auto': 'Auto Detect',
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'pt': 'Portuguese',
    'it': 'Italian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh-CN': 'Chinese (Simplified)',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'te': 'Telugu',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'tr': 'Turkish',
    'pl': 'Polish',
    'vi': 'Deep English',
    'id': 'Indonesian',
    'uk': 'Ukrainian',
    'he': 'Hebrew',
    'th': 'Thai',
    'cs': 'Czech',
    'ro': 'Romanian',
    'hu': 'Hungarian',
}

# Fix name mismatch for Vietnamese / other languages
LANGUAGE_OPTIONS['vi'] = 'Vietnamese'

def supported_languages():
    return [{'code': code, 'name': name} for code, name in LANGUAGE_OPTIONS.items()]


def translate_text(text: str, source: str, target: str) -> dict:
    start = time.time()
    translated = None
    confidence = 'High'
    
    # Try the stable and fast Google Translate JSON API first
    try:
        url = "https://translate.googleapis.com/translate_a/single"
        params = {
            "client": "gtx",
            "sl": source if source != 'auto' else 'auto',
            "tl": target,
            "dt": "t",
            "q": text
        }
        r = session.get(url, params=params, timeout=5)
        if r.status_code == 200:
            res = r.json()
            translated = "".join([sentence[0] for sentence in res[0] if sentence[0]])
            # Try to extract confidence score if available
            if len(res) > 6 and isinstance(res[6], (int, float)):
                confidence = f"{int(res[6] * 100)}%"
    except Exception:
        pass

    if not translated:
        try:
            translator = GoogleTranslator(source=source if source != 'auto' else 'auto', target=target)
            
            # monkeypatch verify = False for deep_translator requests
            original_request = requests.Session.request
            def patched_request(self, method, url, *args, **kwargs):
                kwargs['verify'] = False
                return original_request(self, method, url, *args, **kwargs)
            requests.Session.request = patched_request
            
            translated = translator.translate(text)
        except Exception as e:
            raise RuntimeError(f"Translation failed: {str(e)}")

    elapsed_ms = int((time.time() - start) * 1000)

    return {
        'translated_text': translated,
        'source_lang': source,
        'target_lang': target,
        'confidence': confidence,
        'elapsed_ms': elapsed_ms,
    }
