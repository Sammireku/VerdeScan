// T-025: Hands-free Voice Dictation & Text-to-Speech Audio Playback for VerdeScan Field Agronomy
import { useState, useEffect, useCallback, useRef } from 'react';

// Speech-to-Text (Voice Dictation)
export function useVoiceDictation(onTranscript?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      setIsSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = 0; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
          if (onTranscript) {
            onTranscript(currentTranscript);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error !== 'no-speech') {
            setError(`Speech recognition error: ${event.error}`);
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      } catch (err: unknown) {
        setIsSupported(false);
      }
    }
  }, [onTranscript]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setError(null);
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      setIsListening(true);
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {
      // Ignore
    }
    setIsListening(false);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
}

// Text-to-Speech (Audio Playback)
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback((text: string, lang = 'en-US') => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop prior audio

    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = lang;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    stop,
    isSpeaking,
    isSupported,
  };
}
