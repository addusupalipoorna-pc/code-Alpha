import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BiCopy, BiDownload, BiMicrophone, BiRefresh } from 'react-icons/bi';
import { MdLanguage, MdOutlineVolumeUp, MdSwapHoriz, MdTranslate } from 'react-icons/md';
import { translateText } from '../services/api.js';
import languages from '../assets/languages.js';

const defaultSource = 'auto';
const defaultTarget = 'es';

const languageCodeToLocale = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  pt: 'pt-PT',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  'zh-CN': 'zh-CN',
  ru: 'ru-RU',
  ar: 'ar-SA',
  hi: 'hi-IN',
  te: 'te-IN',
  nl: 'nl-NL',
  sv: 'sv-SE',
  tr: 'tr-TR',
  pl: 'pl-PL',
  vi: 'vi-VN',
  id: 'id-ID',
  uk: 'uk-UA',
  he: 'he-IL',
  th: 'th-TH',
  cs: 'cs-CZ',
  ro: 'ro-RO',
  hu: 'hu-HU',
};

function localeForCode(code) {
  return languageCodeToLocale[code] || 'en-US';
}

export default function TranslationWorkspace({ history, setHistory }) {
  const [sourceLang, setSourceLang] = useState(defaultSource);
  const [targetLang, setTargetLang] = useState(defaultTarget);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready — type or use voice, then translate');
  const [confidence, setConfidence] = useState('—');
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const translateGenRef = useRef(0);
  const lastHistoryKeyRef = useRef('');
  const voicesPrimedRef = useRef(false);

  const words = useMemo(() => sourceText.trim().split(/\s+/).filter(Boolean).length, [sourceText]);
  const characters = sourceText.length;

  const handleTranslate = useCallback(async () => {
    const text = sourceText.trim();
    if (!text) {
      setTranslatedText('');
      setStatus('Enter text to translate.');
      setIsLoading(false);
      return;
    }
    if (targetLang === sourceLang && sourceLang !== 'auto') {
      setStatus('Source and target languages must differ.');
      setIsLoading(false);
      return;
    }

    const gen = ++translateGenRef.current;
    setIsLoading(true);
    setStatus('Translating…');

    try {
      const data = await translateText({ sourceText: text, sourceLang, targetLang });
      if (gen !== translateGenRef.current) return;

      setTranslatedText(data.translated_text);
      const provider = data.provider === 'backend' ? 'API' : 'cloud';
      setStatus(`Done in ${data.elapsed_ms}ms · ${provider}`);
      setConfidence(data.confidence || 'High');

      if (data.translated_text) {
        const historyKey = `${text}|${sourceLang}|${targetLang}|${data.translated_text}`;
        if (historyKey !== lastHistoryKeyRef.current) {
          lastHistoryKeyRef.current = historyKey;
          setHistory((previous) => [
            {
              id: Date.now(),
              sourceText: text,
              translatedText: data.translated_text,
              sourceLang,
              targetLang,
              createdAt: new Date().toISOString(),
            },
            ...previous,
          ]);
        }
      }
    } catch (error) {
      if (gen !== translateGenRef.current) return;
      setStatus(error.message || 'Translation failed. Check connection and try again.');
      console.error(error);
    } finally {
      if (gen === translateGenRef.current) setIsLoading(false);
    }
  }, [sourceText, sourceLang, targetLang, setHistory]);

  useEffect(() => {
    if (!sourceText.trim()) {
      setTranslatedText('');
      setStatus('Ready — type or use voice, then translate');
      setConfidence('—');
      return undefined;
    }

    clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      handleTranslate();
    }, 800);

    return () => clearTimeout(timerRef.current);
  }, [sourceText, sourceLang, targetLang, handleTranslate]);

  useEffect(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSpeechSupported('speechSynthesis' in window);
    setVoiceSupported(Boolean(Recognition));

    if (!Recognition) return undefined;

    const recog = new Recognition();
    recog.continuous = true;
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    recog.onstart = () => setStatus('Listening… speak now');

    recog.onresult = (event) => {
      let interim = '';
      let final = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const chunk = event.results[i][0]?.transcript || '';
        if (event.results[i].isFinal) final += chunk;
        else interim += chunk;
      }
      if (final) setSourceText((prev) => (prev ? `${prev.trim()} ${final.trim()}` : final.trim()));
      else if (interim) setStatus(`Hearing: ${interim.slice(0, 48)}…`);
    };

    recog.onerror = (e) => {
      const messages = {
        'not-allowed': 'Microphone access denied. Allow mic in browser settings.',
        'no-speech': 'No speech detected. Try again.',
        'network': 'Voice needs an internet connection.',
        'aborted': 'Voice input stopped.',
      };
      setStatus(messages[e.error] || `Voice error: ${e.error || 'unknown'}`);
      setRecognitionActive(false);
    };

    recog.onend = () => {
      setRecognitionActive(false);
      setStatus((prev) => (prev.startsWith('Hearing') ? 'Ready — type or use voice, then translate' : prev));
    };

    recognitionRef.current = recog;
    return () => {
      try {
        recog.abort?.() || recog.stop?.();
      } catch {
        /* ignore */
      }
      recognitionRef.current = null;
    };
  }, []);

  useEffect(() => {
    const primeVoices = () => {
      if (voicesPrimedRef.current || !window.speechSynthesis) return;
      window.speechSynthesis.getVoices();
      voicesPrimedRef.current = true;
    };
    primeVoices();
    window.speechSynthesis.onvoiceschanged = primeVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const copyTranslation = async () => {
    if (!translatedText) return;
    await navigator.clipboard.writeText(translatedText);
    setStatus('Copied to clipboard');
  };

  const downloadTxt = () => {
    const blob = new Blob([translatedText || ''], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'translation.txt';
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const exportPdf = async () => {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const maxWidth = pageWidth - margin * 2;
    const lineHeight = 14;

    doc.setFontSize(14);
    doc.text('Code Alpha — Translation', margin, 60);
    doc.setFontSize(10);
    doc.text(`From: ${sourceLang.toUpperCase()}  To: ${targetLang.toUpperCase()}`, margin, 80);
    doc.text(`Date: ${new Date().toLocaleString()}`, margin, 96);

    let y = 116;
    doc.setFontSize(12);
    doc.text('Source:', margin, y);
    y += 16;
    doc.splitTextToSize(sourceText || '—', maxWidth).forEach((line) => {
      if (y + lineHeight > pageHeight - 60) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    y += 8;
    doc.text('Translation:', margin, y);
    y += 16;
    doc.splitTextToSize(translatedText || '—', maxWidth).forEach((line) => {
      if (y + lineHeight > pageHeight - 60) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    doc.save(`translation-${Date.now()}.pdf`);
  };

  const speakTranslation = () => {
    if (!speechSupported) {
      setStatus('Speech playback is not supported in this browser.');
      return;
    }
    if (!translatedText.trim()) {
      setStatus('Translate text first, then play speech.');
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    const locale = localeForCode(targetLang);
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = locale;
    utterance.rate = 0.95;
    utterance.pitch = 1;

    const speak = () => {
      const voices = synth.getVoices();
      const prefix = locale.split('-')[0].toLowerCase();
      const voice = voices.find((v) => v.lang?.toLowerCase().startsWith(prefix))
        || voices.find((v) => v.lang?.toLowerCase().includes(prefix));
      if (voice) utterance.voice = voice;

      utterance.onstart = () => setStatus('Playing translation…');
      utterance.onend = () => setStatus('Speech finished');
      utterance.onerror = () => setStatus('Could not play speech. Try Chrome or Edge.');

      synth.resume?.();
      synth.speak(utterance);
    };

    const voices = synth.getVoices();
    if (voices.length === 0) {
      setStatus('Loading voices…');
      synth.onvoiceschanged = () => {
        synth.onvoiceschanged = null;
        speak();
      };
      setTimeout(speak, 400);
    } else {
      speak();
    }
  };

  const toggleRecognition = () => {
    if (!voiceSupported || !recognitionRef.current) {
      setStatus('Voice input needs Chrome or Edge with microphone access.');
      return;
    }

    const recog = recognitionRef.current;
    if (recognitionActive) {
      recog.stop();
      setRecognitionActive(false);
      return;
    }

    const locale = sourceLang === 'auto' ? 'en-US' : localeForCode(sourceLang);
    try {
      recog.lang = locale;
      recog.start();
      setRecognitionActive(true);
    } catch (err) {
      if (err.name === 'InvalidStateError') {
        recog.stop();
        setTimeout(() => {
          try {
            recog.start();
            setRecognitionActive(true);
          } catch {
            setStatus('Voice busy — wait a moment and try again.');
          }
        }, 300);
      } else {
        setStatus('Could not start microphone.');
        setRecognitionActive(false);
      }
    }
  };

  const swapLanguages = () => {
    if (sourceLang === 'auto') {
      setSourceLang(targetLang);
      setTargetLang(defaultTarget);
    } else {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
    }
    setSourceText(translatedText || sourceText);
    setTranslatedText('');
  };

  const progressSteps = ['Detect language', 'AI processing', 'Optimizing', 'Complete'];
  const [swapBurst, setSwapBurst] = useState(false);
  const doSwap = () => {
    setSwapBurst(true);
    swapLanguages();
    setTimeout(() => setSwapBurst(false), 600);
  };

  const btnHover = { scale: 1.02 };
  const btnTap = { scale: 0.98 };

  return (
    <motion.section
      id="translator"
      className="workspace-pro glass-card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="workspace-pro-header">
        <div>
          <p className="workspace-eyebrow">Translation studio</p>
          <h2 className="workspace-title">Real-time AI translation</h2>
          <p className="workspace-subtitle">
            Type or dictate in any language. Hear results with natural speech. Export when you are done.
          </p>
        </div>
        <div className="workspace-header-actions">
          <motion.button type="button" whileHover={btnHover} whileTap={btnTap} onClick={doSwap} className="workspace-btn workspace-btn-ghost">
            <MdSwapHoriz className="h-5 w-5" />
            Swap
            {swapBurst && <span className="swap-ping" aria-hidden />}
          </motion.button>
          <motion.button type="button" whileHover={btnHover} whileTap={btnTap} onClick={() => { setSourceText(''); setTranslatedText(''); setStatus('Cleared'); }} className="workspace-btn workspace-btn-ghost">
            <BiRefresh className="h-5 w-5" />
            Clear
          </motion.button>
          <motion.button
            type="button"
            whileHover={btnHover}
            whileTap={btnTap}
            onClick={handleTranslate}
            disabled={isLoading || !sourceText.trim()}
            className="workspace-btn workspace-btn-primary"
          >
            <MdTranslate className="h-5 w-5" />
            {isLoading ? 'Translating…' : 'Translate'}
          </motion.button>
        </div>
      </div>

      {isLoading && (
        <div className="workspace-progress" aria-live="polite">
          {progressSteps.map((step, idx) => (
            <span key={step} className={`workspace-progress-step ${idx <= 1 ? 'active' : ''}`}>{step}</span>
          ))}
        </div>
      )}

      <div className="workspace-grid">
        <div className="workspace-panel workspace-panel-source">
          <div className="workspace-panel-head">
            <MdLanguage className="text-cyan-400" />
            <span>Source</span>
            <select value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="workspace-select" aria-label="Source language">
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            rows={9}
            placeholder="Enter text or tap the microphone to speak…"
            className="workspace-textarea"
            aria-label="Source text"
          />
          <div className="workspace-meta">
            <span>{words} words · {characters} chars</span>
            <span className={`workspace-status ${isLoading ? 'is-loading' : ''}`}>{status}</span>
          </div>
          <div className="workspace-actions">
            <motion.button
              type="button"
              whileHover={btnHover}
              whileTap={btnTap}
              onClick={toggleRecognition}
              className={`workspace-btn ${recognitionActive ? 'workspace-btn-recording' : 'workspace-btn-voice'}`}
              aria-pressed={recognitionActive}
            >
              <BiMicrophone className="h-5 w-5" />
              {recognitionActive ? 'Stop listening' : 'Voice input'}
            </motion.button>
            {!voiceSupported && (
              <span className="workspace-hint">Use Chrome or Edge for voice</span>
            )}
          </div>
        </div>

        <div className="workspace-panel workspace-panel-target">
          <div className="workspace-panel-head">
            <MdLanguage className="text-violet-400" />
            <span>Translation</span>
            <select value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="workspace-select" aria-label="Target language">
              {languages.filter((l) => l.code !== 'auto').map((lang) => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
            <span className="workspace-confidence">Confidence: {confidence}</span>
          </div>
          <div className="workspace-output" aria-live="polite">
            {isLoading ? (
              <span className="workspace-output-placeholder">Translating your text…</span>
            ) : (
              translatedText || <span className="workspace-output-placeholder">Your translation will appear here.</span>
            )}
          </div>
          <div className="workspace-actions workspace-actions-row">
            <motion.button type="button" whileHover={btnHover} whileTap={btnTap} onClick={copyTranslation} className="workspace-btn workspace-btn-ghost">
              <BiCopy className="h-5 w-5" /> Copy
            </motion.button>
            <motion.button type="button" whileHover={btnHover} whileTap={btnTap} onClick={downloadTxt} className="workspace-btn workspace-btn-ghost">
              <BiDownload className="h-5 w-5" /> TXT
            </motion.button>
            <motion.button type="button" whileHover={btnHover} whileTap={btnTap} onClick={exportPdf} className="workspace-btn workspace-btn-ghost">
              <BiDownload className="h-5 w-5" /> PDF
            </motion.button>
            <motion.button
              type="button"
              whileHover={btnHover}
              whileTap={btnTap}
              onClick={speakTranslation}
              disabled={!translatedText.trim()}
              className="workspace-btn workspace-btn-speak"
            >
              <MdOutlineVolumeUp className="h-5 w-5" />
              Listen
            </motion.button>
          </div>
          {!speechSupported && (
            <p className="workspace-hint workspace-hint-block">Speech playback requires a modern browser (Chrome, Edge, Safari).</p>
          )}
        </div>
      </div>
    </motion.section>
  );
}
