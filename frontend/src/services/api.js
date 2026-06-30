import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

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
    const detail = backendError?.response?.data?.detail || backendError?.message;
    throw new Error(detail || 'Translation failed');
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

export async function transcribeAudio(wavBlob, lang) {
  const formData = new FormData();
  formData.append('file', wavBlob, 'recording.wav');
  
  try {
    const response = await api.post(`/transcribe?lang=${lang}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    const detail = error?.response?.data?.detail || error?.message;
    throw new Error(detail || 'Transcription failed');
  }
}

export async function subscribeNewsletter({ name, email, contact, password }) {
  try {
    const response = await api.post('/subscribe', { name, email, contact, password });
    return response.data;
  } catch (error) {
    const detail = error?.response?.data?.detail || error?.message;
    throw new Error(detail || 'Subscription failed');
  }
}
