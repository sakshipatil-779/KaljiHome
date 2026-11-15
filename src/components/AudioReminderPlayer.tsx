'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Globe, Play, Square, Sparkles, Check } from 'lucide-react';

export type IndianLanguage = 'mr' | 'hi' | 'en' | 'gu' | 'bn' | 'ta' | 'te' | 'kn';

export interface LanguageOption {
  code: IndianLanguage;
  locale: string;
  name: string;
  nativeName: string;
  badge: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'mr', locale: 'mr-IN', name: 'Marathi', nativeName: 'मराठी', badge: 'महाराष्ट्र' },
  { code: 'hi', locale: 'hi-IN', name: 'Hindi', nativeName: 'हिंदी', badge: 'भारत' },
  { code: 'en', locale: 'en-IN', name: 'English', nativeName: 'English (India)', badge: 'Global' },
  { code: 'gu', locale: 'gu-IN', name: 'Gujarati', nativeName: 'ગુજરાતી', badge: 'ગુજરાત' },
  { code: 'bn', locale: 'bn-IN', name: 'Bengali', nativeName: 'বাংলা', badge: 'বাঙালি' },
  { code: 'ta', locale: 'ta-IN', name: 'Tamil', nativeName: 'தமிழ்', badge: 'தமிழ்நாடு' },
  { code: 'te', locale: 'te-IN', name: 'Telugu', nativeName: 'తెలుగు', badge: 'తెలుగు' },
  { code: 'kn', locale: 'kn-IN', name: 'Kannada', nativeName: 'ಕನ್ನಡ', badge: 'ಕರ್ನಾಟಕ' },
];

export function getMedicationVoiceScript(
  language: IndianLanguage,
  medicationName: string,
  strengthText: string = '',
  time: string = 'Morning',
  elderName: string = 'Aai'
): string {
  const fullMed = `${medicationName} ${strengthText}`.trim();

  switch (language) {
    case 'mr':
      return `काळजी होम औषध आठवण: नमस्कार ${elderName}, तुमची ${time} ची औषध घेण्याची वेळ झाली आहे. कृपया ${fullMed} ची १ गोळी जेवणानंतर भरपूर पाण्यासोबत घ्या. तब्येतीची काळजी घ्या.`;
    case 'hi':
      return `कालजी होम दवाई रिमाइंडर: नमस्ते ${elderName}, आपकी ${time} की दवाई लेने का समय हो गया है। कृपया ${fullMed} की एक गोली नाश्ते या खाने के बाद पानी के साथ लें। अपना ख्याल रखें।`;
    case 'gu':
      return `કાળજી હોમ દવા રીમાઇન્ડર: નમસ્તે ${elderName}, તમારી ${time} ની દવા લેવાનો સમય થઈ ગયો છે. કૃપા કરીને ${fullMed} ની એક ગોળી પાણી સાથે લો. તમારું ધ્યાન રાખો.`;
    case 'bn':
      return `কালজি হোম ওষুধ অনুস্মারক: নমস্কার ${elderName}, আপনার ${time} এর ওষুধ খাওয়ার সময় হয়েছে। দয়া করে ${fullMed} এক গ্লাস জল দিয়ে সেবন করুন। নিজের যত্ন নিন।`;
    case 'ta':
      return `கால்ஜி ஹோம் மருந்து நினைவூட்டல்: வணக்கம் ${elderName}, உங்கள் ${time} மருந்து உட்கொள்ளும் நேரம் வந்துவிட்டது. தயவுசெய்து ${fullMed} தண்ணீருடன் எடுத்துக்கொள்ளுங்கள். உடலை கவனித்துக் கொள்ளுங்கள்.`;
    case 'te':
      return `కాల్జీ హోమ్ ఔషధ రిమైండర్: నమస్కారం ${elderName}, మీ ${time} మందు వేసుకునే సమయం అయింది. దయచేసి ${fullMed} నీటితో తీసుకోండి. ఆరోగ్యాన్ని జాగ్రత్తగా చూసుకోండి.`;
    case 'kn':
      return `ಕಾಳ್ಜಿ ಹೋಮ್ ಔಷಧಿ ಜ್ಞಾಪನೆ: ನಮಸ್ಕಾರ ${elderName}, ನಿಮ್ಮ ${time} ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯವಾಗಿದೆ. ದಯವಿಟ್ಟು ${fullMed} ನೀರಿನೊಂದಿಗೆ ಸೇವಿಸಿ. ಆರೋಗ್ಯದ ಬಗ್ಗೆ ಕಾಳಜಿ ವಹಿಸಿ.`;
    case 'en':
    default:
      return `KaljiHome Medicine Reminder: Hello ${elderName}, it is time for your scheduled ${time} medication. Please take ${fullMed} with a glass of water after food. Stay healthy and take care.`;
  }
}

interface AudioReminderPlayerProps {
  medicationName: string;
  strengthText?: string;
  scheduledTime?: string;
  elderName?: string;
  variant?: 'inline' | 'card' | 'compact';
}

export const AudioReminderPlayer: React.FC<AudioReminderPlayerProps> = ({
  medicationName,
  strengthText = '',
  scheduledTime = 'Morning',
  elderName = 'Meera Sharma',
  variant = 'card',
}) => {
  const [selectedLang, setSelectedLang] = useState<IndianLanguage>('mr');
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check SpeechSynthesis support
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSpeechSupported(true);
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      // Load saved language preference
      const saved = localStorage.getItem('kaljihome_audio_language') as IndianLanguage;
      if (saved && SUPPORTED_LANGUAGES.some(l => l.code === saved)) {
        setSelectedLang(saved);
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleLanguageChange = (lang: IndianLanguage) => {
    setSelectedLang(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kaljihome_audio_language', lang);
    }
    if (isPlaying) {
      stopAudio();
    }
  };

  const playAudio = () => {
    if (!speechSupported || typeof window === 'undefined') {
      alert('Speech synthesis is not supported on this device/browser.');
      return;
    }

    window.speechSynthesis.cancel();

    const script = getMedicationVoiceScript(selectedLang, medicationName, strengthText, scheduledTime, elderName);
    const utterance = new SpeechSynthesisUtterance(script);
    utteranceRef.current = utterance;

    const langConfig = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang);
    utterance.lang = langConfig?.locale || 'en-IN';
    
    // Calm, elder-accessible speech rate & pitch
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    // Try finding matching voice
    if (availableVoices.length > 0) {
      const matchedVoice = availableVoices.find(v => 
        v.lang.toLowerCase().startsWith(selectedLang) || 
        v.lang.toLowerCase() === langConfig?.locale.toLowerCase()
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopAudio = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  const currentScript = getMedicationVoiceScript(selectedLang, medicationName, strengthText, scheduledTime, elderName);
  const activeOption = SUPPORTED_LANGUAGES.find(l => l.code === selectedLang) || SUPPORTED_LANGUAGES[0];

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          onClick={isPlaying ? stopAudio : playAudio}
          className={`min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
            isPlaying 
              ? 'bg-rose-600 text-white animate-pulse shadow-md ring-2 ring-rose-400' 
              : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
          }`}
          title={`Listen voice reminder in ${activeOption.nativeName}`}
          aria-label={`Listen voice reminder in ${activeOption.nativeName}`}
        >
          {isPlaying ? <Square className="w-3.5 h-3.5 fill-white" /> : <Volume2 className="w-4 h-4 text-teal-700" />}
          <span>{isPlaying ? 'थांबवा (Stop)' : `ऐका / Listen (${activeOption.nativeName})`}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-orange-50/30 border border-teal-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
      {/* Header with Title and Language Label */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm">
            <Volume2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Elder Voice Reminder</span>
              <span className="text-xs bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                मल्टी-लिंग्वल ऑडिओ
              </span>
            </h3>
            <p className="text-xs text-slate-600">
              Clear, gentle spoken guidance in 8 Indian regional languages
            </p>
          </div>
        </div>

        {/* Selected Language indicator */}
        <div className="flex items-center gap-1 text-xs text-slate-600 bg-white/80 border border-teal-200 px-3 py-1 rounded-lg">
          <Globe className="w-3.5 h-3.5 text-teal-600" />
          <span>Active:</span>
          <strong className="text-teal-800 font-bold">{activeOption.nativeName} ({activeOption.name})</strong>
        </div>
      </div>

      {/* Language Selection Chips (User Options) */}
      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Select Your Preferred Language (भाषा निवडा / भाषा चुनें):
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLang === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`min-h-[44px] px-3 py-2 rounded-xl text-left transition-all border flex items-center justify-between ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-800 shadow-sm ring-2 ring-teal-500'
                    : 'bg-white hover:bg-teal-50/60 text-slate-800 border-slate-200'
                }`}
                aria-pressed={isSelected}
              >
                <div>
                  <div className="text-sm font-bold leading-tight">{lang.nativeName}</div>
                  <div className={`text-[10px] ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                    {lang.name}
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-white flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Spoken Transcript Preview */}
      <div className="bg-white/90 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
        <div className="font-bold text-slate-900 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Spoken Voice Script ({activeOption.nativeName}):</span>
        </div>
        <p className="italic text-slate-800 text-sm leading-relaxed">&ldquo;{currentScript}&rdquo;</p>
      </div>

      {/* Audio Control Action Bar */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          onClick={isPlaying ? stopAudio : playAudio}
          className={`min-h-[48px] px-6 py-3 rounded-xl font-extrabold text-sm sm:text-base flex items-center gap-2.5 transition-all shadow ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-200'
              : 'bg-teal-700 hover:bg-teal-800 text-white shadow-teal-700/20'
          }`}
          aria-label={isPlaying ? 'Stop Audio Reminder' : 'Play Voice Reminder'}
        >
          {isPlaying ? (
            <>
              <Square className="w-5 h-5 fill-white" />
              <span>थांबवा (Stop Audio)</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" />
              <span>मोठ्याने ऐका / Speak Reminder ({activeOption.nativeName})</span>
            </>
          )}
        </button>

        {isPlaying && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold animate-pulse">
            <span className="w-2.5 h-2.5 bg-rose-600 rounded-full animate-ping" />
            <span>Speaking now at gentle pace (88% speed)...</span>
          </div>
        )}
      </div>
    </div>
  );
};
