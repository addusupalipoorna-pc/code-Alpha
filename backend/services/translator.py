import time
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
    'vi': 'Vietnamese',
    'id': 'Indonesian',
    'uk': 'Ukrainian',
    'he': 'Hebrew',
    'th': 'Thai',
    'cs': 'Czech',
    'ro': 'Romanian',
    'hu': 'Hungarian',
}


def supported_languages():
    return [{'code': code, 'name': name} for code, name in LANGUAGE_OPTIONS.items()]


def translate_text(text: str, source: str, target: str) -> dict:
    start = time.time()
    translator = GoogleTranslator(source=source if source != 'auto' else 'auto', target=target)
    translated = translator.translate(text)
    elapsed_ms = int((time.time() - start) * 1000)

    return {
        'translated_text': translated,
        'source_lang': source,
        'target_lang': target,
        'confidence': 'High',
        'elapsed_ms': elapsed_ms,
    }
