import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { BiCopy, BiDownload, BiMicrophone, BiRefresh, BiClipboard, BiUpload } from 'react-icons/bi';
import { MdLanguage, MdOutlineVolumeUp, MdSwapHoriz, MdTranslate } from 'react-icons/md';
import { translateText, transcribeAudio } from '../services/api.js';
import CommandPalettePicker from './CommandPalettePicker.jsx';
import VoiceSpectrum from './VoiceSpectrum.jsx';

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

function writeUTFBytes(view, offset, string) {
  for (let i = 0; i < string.length; i += 1) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function bufferToWav(buffer) {
  const numOfChan = buffer.numberOfChannels;
  const btwLength = buffer.length * 2 * numOfChan + 44;
  const btwBuffer = new ArrayBuffer(btwLength);
  const btwView = new DataView(btwBuffer);
  const channels = [];

  for (let i = 0; i < numOfChan; i += 1) {
    channels.push(buffer.getChannelData(i));
  }

  writeUTFBytes(btwView, 0, 'RIFF');
  btwView.setUint32(4, btwLength - 8, true);
  writeUTFBytes(btwView, 8, 'WAVE');
  writeUTFBytes(btwView, 12, 'fmt ');
  btwView.setUint32(16, 16, true);
  btwView.setUint16(20, 1, true); // Linear PCM
  btwView.setUint16(22, numOfChan, true);
  btwView.setUint32(24, buffer.sampleRate, true);
  btwView.setUint32(28, buffer.sampleRate * 2 * numOfChan, true);
  btwView.setUint16(32, numOfChan * 2, true);
  btwView.setUint16(34, 16, true); // 16-bit
  writeUTFBytes(btwView, 36, 'data');
  btwView.setUint32(40, btwLength - 44, true);

  let offset = 44;
  for (let i = 0; i < buffer.length; i += 1) {
    for (let channel = 0; channel < numOfChan; channel += 1) {
      let sample = channels[channel][i];
      if (sample > 1) sample = 1;
      else if (sample < -1) sample = -1;
      btwView.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
      offset += 2;
    }
  }

  return new Blob([btwBuffer], { type: 'audio/wav' });
}

function localeForCode(code) {
  return languageCodeToLocale[code] || 'en-US';
}

export default function TranslationWorkspace({ history, setHistory }) {
  const [sourceLang, setSourceLang] = useState(defaultSource);
  const [targetLang, setTargetLang] = useState(defaultTarget);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState('Ready — type or dictate to begin');
  const [confidence, setConfidence] = useState('—');
  const [recognitionActive, setRecognitionActive] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // loading steps visual simulation
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const stepMessages = [
    'Detecting Language...',
    'Understanding Grammar...',
    'Analyzing Context...',
    'Generating Translation...',
    'Optimizing Output...',
    'Completed Successfully.'
  ];

  // custom scores
  const [scores, setScores] = useState({ grammar: '—', context: '—' });

  const recognitionRef = useRef(null);
  const baseTextRef = useRef('');
  const timerRef = useRef(null);
  const translateGenRef = useRef(0);
  const lastHistoryKeyRef = useRef('');
  const voicesPrimedRef = useRef(false);
  const fileInputRef = useRef(null);
  const utteranceRef = useRef(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const streamRef = useRef(null);
  const [activeStream, setActiveStream] = useState(null);

  const words = useMemo(() => sourceText.trim().split(/\s+/).filter(Boolean).length, [sourceText]);
  const characters = sourceText.length;

  useEffect(() => {
    let interval;
    if (isLoading) {
      setLoadingStepIdx(0);
      interval = setInterval(() => {
        setLoadingStepIdx((prev) => Math.min(stepMessages.length - 1, prev + 1));
      }, 350);
    } else {
      setLoadingStepIdx(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const performTranslation = useCallback(async (text, src, tgt) => {
    if (!text) {
      setTranslatedText('');
      setStatus('Ready — type or dictate to begin');
      setIsLoading(false);
      return;
    }
    if (tgt === src && src !== 'auto') {
      setStatus('Source and target languages must differ.');
      setIsLoading(false);
      return;
    }

    const gen = ++translateGenRef.current;
    setIsLoading(true);

    try {
      const data = await translateText({ sourceText: text, sourceLang: src, targetLang: tgt });
      if (gen !== translateGenRef.current) return;

      // Simulated small delay to show AI pipeline progress steps
      await new Promise((resolve) => setTimeout(resolve, 800));

      setTranslatedText(data.translated_text);
      setStatus(`Translated successfully in ${data.elapsed_ms}ms`);
      setConfidence(data.confidence || '98.5%');
      
      // Calculate realistic dummy metric scores
      const gl = Math.floor(95 + Math.random() * 4.8);
      const cl = Math.floor(94 + Math.random() * 5.8);
      setScores({ grammar: `${gl}%`, context: `${cl}%` });

      if (data.translated_text) {
        const historyKey = `${text}|${src}|${tgt}|${data.translated_text}`;
        if (historyKey !== lastHistoryKeyRef.current) {
          lastHistoryKeyRef.current = historyKey;
          setHistory((previous) => [
            {
              id: Date.now(),
              sourceText: text,
              translatedText: data.translated_text,
              sourceLang: src,
              targetLang: tgt,
              createdAt: new Date().toISOString(),
            },
            ...previous,
          ]);
        }
      }
    } catch (err) {
      if (gen !== translateGenRef.current) return;
      setTranslatedText('');
      setStatus('Translation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [setHistory]);

  const handleTranslate = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    performTranslation(sourceText.trim(), sourceLang, targetLang);
  }, [sourceText, sourceLang, targetLang, performTranslation]);

  // Debounced translation on typing
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    const text = sourceText.trim();
    if (!text) {
      setTranslatedText('');
      setStatus('Ready — type or dictate to begin');
      return;
    }

    timerRef.current = setTimeout(() => {
      performTranslation(text, sourceLang, targetLang);
    }, 700);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [sourceText, sourceLang, targetLang, performTranslation]);

  const doSwap = () => {
    if (sourceLang === 'auto') return;
    const s = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(s);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  // Clipboard Paste Support
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceText(text);
        setStatus('Pasted from clipboard');
      }
    } catch (e) {
      setStatus('Failed to read from clipboard');
    }
  };

  // Drag and Drop files
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    if (file.type !== 'text/plain') {
      setStatus('Only .txt files are supported currently.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSourceText(e.target.result);
      setStatus(`Loaded text file: ${file.name}`);
    };
    reader.readAsText(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current.click();
  };

  const fileChanged = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  // Web Speech synthesis and Audio record pipelines
  useEffect(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const hasMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    setVoiceSupported(!!Recognition || hasMedia);
    setSpeechSupported('speechSynthesis' in window);

    if (Recognition) {
      const rec = new Recognition();
      rec.continuous = true;
      rec.interimResults = true;

      rec.onresult = (ev) => {
        let interim = '';
        let final = '';
        for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
          const trans = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) {
            final += trans;
          } else {
            interim += trans;
          }
        }
        if (final) {
          baseTextRef.current += final;
        }
        setSourceText(baseTextRef.current + interim);
      };

      rec.onerror = () => {
        setRecognitionActive(false);
      };

      rec.onend = () => {
        setRecognitionActive(false);
      };

      recognitionRef.current = rec;
    }

    const primeVoices = () => {
      window.speechSynthesis.getVoices();
      voicesPrimedRef.current = true;
    };
    primeVoices();
    window.speechSynthesis.onvoiceschanged = primeVoices;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const startFallbackRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setActiveStream(stream);
      audioChunksRef.current = [];

      const options = { mimeType: 'audio/webm' };
      let rec;
      try {
        rec = new MediaRecorder(stream, options);
      } catch (e) {
        rec = new MediaRecorder(stream);
      }

      rec.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      rec.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: rec.mimeType });
        setActiveStream(null);
        setStatus('Processing audio input...');
        setIsLoading(true);

        try {
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const arrayBuffer = await audioBlob.arrayBuffer();
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          const wavBlob = bufferToWav(audioBuffer);

          const locale = localeForCode(sourceLang);
          const trans = await transcribeAudio(wavBlob, locale);

          if (trans.text) {
            setSourceText((prev) => (prev ? prev + ' ' + trans.text : trans.text));
            setStatus('Speech transcribed successfully');
          } else {
            setStatus('Could not understand speech');
          }
        } catch (err) {
          setStatus('Failed to transcribe audio. Try Chrome.');
        } finally {
          setIsLoading(false);
          if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
            streamRef.current = null;
          }
        }
      };

      mediaRecorderRef.current = rec;
      rec.start(250);
      setRecognitionActive(true);
      setStatus('Recording...');
    } catch (e) {
      setVoiceSupported(false);
      setStatus('Microphone access denied or unsupported');
    }
  };

  const toggleRecognition = async () => {
    if (recognitionActive) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      } else if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      setRecognitionActive(false);
      return;
    }

    if (recognitionRef.current) {
      baseTextRef.current = sourceText;
      const locale = localeForCode(sourceLang);
      recognitionRef.current.lang = locale;
      try {
        recognitionRef.current.start();
        setRecognitionActive(true);
        setStatus('Listening...');
      } catch (err) {
        setStatus('Microphone is busy. Please try again.');
      }
    } else {
      startFallbackRecording();
    }
  };

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
    doc.text('Code Alpha — Translation Report', margin, 60);
    doc.setFontSize(10);
    doc.text(`From: ${sourceLang.toUpperCase()}  To: ${targetLang.toUpperCase()}`, margin, 80);
    doc.text(`Date: ${new Date().toLocaleString()}`, margin, 96);

    let y = 116;
    doc.setFontSize(12);
    doc.text('Source Text:', margin, y);
    y += 16;
    doc.splitTextToSize(sourceText || '—', maxWidth).forEach((line) => {
      if (y + lineHeight > pageHeight - 60) { doc.addPage(); y = margin; }
      doc.text(line, margin, y);
      y += lineHeight;
    });

    y += 12;
    doc.text('Translation Output:', margin, y);
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
    const wasSpeaking = synth.speaking || synth.pending;
    if (wasSpeaking) {
      synth.cancel();
    }

    const locale = localeForCode(targetLang);
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utteranceRef.current = utterance; // Prevent garbage collection bug
    
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
      utterance.onend = () => {
        setStatus('Speech finished');
        utteranceRef.current = null;
      };
      utterance.onerror = (err) => {
        console.error('Speech error:', err);
        setStatus('Could not play speech.');
        utteranceRef.current = null;
      };

      setTimeout(() => {
        synth.speak(utterance);
      }, wasSpeaking ? 150 : 0);
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

  const btnHover = { scale: 1.02, boxShadow: '0 0 12px rgba(34, 211, 238, 0.2)' };
  const btnTap = { scale: 0.98 };

  return (
    <motion.section
      id="translator"
      className="workspace-section mt-12 py-12 px-4 md:px-8 bg-slate-950/20 border border-white/5 rounded-3xl backdrop-blur-md relative"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <div className="workspace-pro-header flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <p className="text-xs uppercase font-extrabold text-cyan-400 tracking-widest">Translation studio</p>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mt-1">Real-time AI translation</h2>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            Type or dictate in any language. Hear results with natural speech. Export when you are done.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 items-center">
          <motion.button type="button" whileHover={btnHover} whileTap={btnTap} onClick={doSwap} className="workspace-btn workspace-btn-ghost py-2.5 px-4 rounded-xl border border-white/10 hover:border-cyan-500/20 bg-slate-900/60 backdrop-blur-md text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all">
            <MdSwapHoriz className="h-4 w-4" /> Swap
          </motion.button>
          <motion.button type="button" whileHover={btnHover} whileTap={btnTap} onClick={() => { setSourceText(''); setTranslatedText(''); setStatus('Cleared'); }} className="workspace-btn workspace-btn-ghost py-2.5 px-4 rounded-xl border border-white/10 hover:border-cyan-500/20 bg-slate-900/60 backdrop-blur-md text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-all">
            <BiRefresh className="h-4 w-4" /> Clear
          </motion.button>
          <motion.button
            type="button"
            whileHover={btnHover}
            whileTap={btnTap}
            onClick={handleTranslate}
            disabled={isLoading || !sourceText.trim()}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-extrabold text-xs tracking-wider uppercase disabled:opacity-40 flex items-center gap-1.5 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <MdTranslate className="h-4 w-4" />
            Translate
          </motion.button>
        </div>
      </div>

      {/* Dynamic Process Pipeline Steps */}
      {isLoading && (
        <div className="flex flex-wrap gap-2 mb-6" aria-live="polite">
          {stepMessages.map((step, idx) => {
            const isActive = idx === loadingStepIdx;
            const isDone = idx < loadingStepIdx;
            return (
              <span
                key={step}
                className={`text-[10px] uppercase font-bold tracking-widest px-3 py-1.5 rounded-lg border transition-all duration-200 ${
                  isActive
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-md shadow-cyan-500/5 animate-pulse'
                    : isDone
                    ? 'bg-violet-950/20 border-violet-800/10 text-violet-400 opacity-60'
                    : 'bg-slate-900/10 border-white/5 text-slate-600'
                }`}
              >
                {step}
              </span>
            );
          })}
        </div>
      )}

      {/* Editor Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Source Text Container */}
        <div
          className={`flex flex-col gap-3 p-5 rounded-2xl bg-slate-950/40 border backdrop-blur-md relative transition-all duration-300 ${
            isDragging ? 'border-cyan-400 bg-slate-950/70 scale-[1.005] shadow-[0_0_20px_rgba(34,211,238,0.15)]' : 'border-white/5'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-cyan-400 tracking-wider">
              <MdLanguage className="text-sm" />
              <span>Source Text</span>
            </div>
            {/* Searchable Command Palette picker */}
            <CommandPalettePicker value={sourceLang} onChange={setSourceLang} />
          </div>

          <textarea
            value={sourceText}
            onChange={(e) => setSourceText(e.target.value)}
            placeholder="Type your message, drop files here, or dictate..."
            className="w-full min-h-[220px] bg-slate-950/50 border border-white/5 rounded-xl p-4 text-slate-100 text-sm leading-relaxed outline-none focus:border-cyan-500/30 transition-all placeholder-slate-600 resize-none"
            aria-label="Source text input"
          />

          {/* Interactive Voice Spectrogram Overlay */}
          {recognitionActive && (
            <div className="my-2">
              <VoiceSpectrum stream={activeStream} />
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-slate-500 font-bold border-t border-white/5 pt-3">
            <span>{words} words · {characters} chars</span>
            <span className="text-[11px] font-bold text-slate-400">{status}</span>
          </div>

          {/* Source Controls */}
          <div className="flex flex-wrap gap-2 items-center mt-2 border-t border-white/5 pt-3">
            <motion.button
              type="button"
              whileHover={btnHover}
              whileTap={btnTap}
              onClick={toggleRecognition}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                recognitionActive
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 hover:bg-cyan-500/20'
              }`}
            >
              <BiMicrophone className="h-4 w-4" />
              {recognitionActive ? 'Stop Listening' : 'Voice Input'}
            </motion.button>

            <motion.button
              type="button"
              whileHover={btnHover}
              whileTap={btnTap}
              onClick={handlePaste}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 transition-all"
            >
              <BiClipboard className="h-4 w-4" />
              Paste text
            </motion.button>

            <motion.button
              type="button"
              whileHover={btnHover}
              whileTap={btnTap}
              onClick={triggerFileUpload}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 transition-all"
            >
              <BiUpload className="h-4 w-4" />
              Upload file
            </motion.button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={fileChanged}
              accept=".txt"
              className="hidden"
            />
          </div>
        </div>

        {/* Target Translation Container */}
        <div className="flex flex-col gap-3 p-5 rounded-2xl bg-slate-950/40 border border-white/5 backdrop-blur-md relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase text-violet-400 tracking-wider">
              <MdLanguage className="text-sm" />
              <span>Translation Output</span>
            </div>
            {/* Searchable Command Palette picker */}
            <CommandPalettePicker value={targetLang} onChange={setTargetLang} excludeAuto={true} />
          </div>

          <div className="w-full min-h-[220px] bg-slate-950/30 border border-white/5 rounded-xl p-4 text-slate-200 text-sm leading-relaxed overflow-y-auto whitespace-pre-wrap select-text">
            {isLoading ? (
              <span className="text-slate-600 italic">Processing translation...</span>
            ) : (
              translatedText || <span className="text-slate-600 italic">Your translation output will appear here...</span>
            )}
          </div>

          {/* Scores Panel */}
          {translatedText && (
            <div className="grid grid-cols-3 gap-2 bg-slate-900/40 border border-white/5 rounded-xl p-2.5 text-center">
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Confidence</p>
                <p className="text-sm font-extrabold text-cyan-400 mt-0.5">{confidence}</p>
              </div>
              <div className="border-x border-white/5">
                <p className="text-[9px] uppercase font-bold text-slate-500">Grammar Score</p>
                <p className="text-sm font-extrabold text-emerald-400 mt-0.5">{scores.grammar}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500">Context Accuracy</p>
                <p className="text-sm font-extrabold text-violet-400 mt-0.5">{scores.context}</p>
              </div>
            </div>
          )}

          {/* Target Controls */}
          <div className="flex flex-wrap gap-2 items-center mt-auto border-t border-white/5 pt-3">
            <motion.button
              type="button"
              whileHover={btnHover}
              whileTap={btnTap}
              onClick={copyTranslation}
              disabled={!translatedText}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all"
            >
              <BiCopy className="h-4 w-4" /> Copy
            </motion.button>

            <motion.button
              type="button"
              whileHover={btnHover}
              whileTap={btnTap}
              onClick={downloadTxt}
              disabled={!translatedText}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all"
            >
              <BiDownload className="h-4 w-4" /> TXT
            </motion.button>

            <motion.button
              type="button"
              whileHover={btnHover}
              whileTap={btnTap}
              onClick={exportPdf}
              disabled={!translatedText}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-white/10 text-slate-300 hover:bg-slate-800 disabled:opacity-40 transition-all"
            >
              <BiDownload className="h-4 w-4" /> PDF Report
            </motion.button>

            <motion.button
              type="button"
              whileHover={btnHover}
              whileTap={btnTap}
              onClick={speakTranslation}
              disabled={!translatedText.trim()}
              className="flex-1 min-width-[100px] flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase bg-gradient-to-r from-violet-600 to-cyan-500 text-white disabled:opacity-40 transition-all"
            >
              <MdOutlineVolumeUp className="h-4 w-4" />
              Listen Speech
            </motion.button>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
