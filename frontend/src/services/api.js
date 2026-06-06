import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

/** Map app language codes to MyMemory / Google-style codes */
function toMyMemoryCode(code) {
  if (!code || code === 'auto') return 'Autodetect';
  return code;
}

async function translateViaMyMemory({ sourceText, sourceLang, targetLang }) {
  const src = toMyMemoryCode(sourceLang);
  const tgt = toMyMemoryCode(targetLang);
  const langpair = `${encodeURIComponent(src)}|${encodeURIComponent(tgt)}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${langpair}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Translation service returned ${response.status}`);
  }

  const data = await response.json();
  const translated = data?.responseData?.translatedText;
  if (!translated) {
    throw new Error(data?.responseDetails || 'No translation returned');
  }

  if (translated.includes('MYMEMORY WARNING') || translated.includes('QUOTA')) {
    throw new Error('Translation quota reached. Try again in a moment.');
  }

  const start = performance.now();
  return {
    translated_text: translated,
    source_lang: sourceLang,
    target_lang: targetLang,
    confidence: 'High',
    elapsed_ms: Math.round(performance.now() - start),
    provider: 'mymemory',
  };
}

export async function translateText({ sourceText, sourceLang, targetLang }) {
  const payload = {
    text: sourceText,
    source: sourceLang,
    target: targetLang,
  };

  try {
    const response = await api.post('/translate', payload);
    return { ...response.data, provider: 'backend' };
  } catch (backendError) {
    try {
      return await translateViaMyMemory({ sourceText, sourceLang, targetLang });
    } catch (fallbackError) {
      const detail = backendError?.response?.data?.detail || backendError?.message;
      throw new Error(detail || fallbackError.message || 'Translation failed');
    }
  }
}

export async function getSupportedLanguages() {
  try {
    const response = await api.get('/languages');
    return response.data;
  } catch {
    return null;
  }
}
