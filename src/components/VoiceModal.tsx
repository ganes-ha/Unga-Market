import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react';

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (query: string) => void;
}

export const VoiceModal: React.FC<VoiceModalProps> = ({
  isOpen,
  onClose,
  onTranscript
}) => {
  const [listening, setListening] = useState(false);
  const [transcriptText, setTranscriptText] = useState('');
  const [statusMsg, setStatusMsg] = useState('Tap microphone and speak in English or Tamil');

  useEffect(() => {
    if (!isOpen) {
      setListening(false);
      setTranscriptText('');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMsg('Speech recognition is not supported in this browser. Please type in search bar.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onstart = () => {
      setListening(true);
      setStatusMsg('Listening... Speak now (e.g. "Tata Tea Gold 1kg", "Maggi noodles", "Fortune oil")');
    };

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscriptText(transcript);
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      setStatusMsg('Speech error. Please try speaking again.');
    };

    recognition.onend = () => {
      setListening(false);
      if (transcriptText.trim()) {
        setStatusMsg(`Searching for: "${transcriptText}"...`);
        setTimeout(() => {
          onTranscript(transcriptText);
          onClose();
        }, 800);
      } else {
        setStatusMsg('Tap microphone to speak');
      }
    };

    try {
      recognition.start();
    } catch (e) {}

    return () => {
      try {
        recognition.stop();
      } catch (e) {}
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleListen = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    if (listening) {
      setListening(false);
    } else {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.start();
      setListening(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center">
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase">
            Voice Assistant
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <div className="py-4">
          <button
            type="button"
            onClick={toggleListen}
            className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all ${
              listening
                ? 'bg-red-500 text-white animate-pulse shadow-lg ring-8 ring-red-100'
                : 'bg-emerald-600 text-white shadow-md hover:scale-105'
            }`}
          >
            {listening ? <Mic size={36} /> : <MicOff size={36} />}
          </button>
        </div>

        <div className="space-y-1">
          <h4 className="font-extrabold text-sm text-slate-800">
            {transcriptText ? `"${transcriptText}"` : 'Listening for items...'}
          </h4>
          <p className="text-xs text-slate-500">{statusMsg}</p>
        </div>

        {/* Example prompts */}
        <div className="bg-slate-50 p-3 rounded-2xl text-[11px] text-slate-600 font-bold space-y-1">
          <div>💡 Try saying:</div>
          <div className="text-emerald-700 font-extrabold">"Tata Tea Gold 1kg"</div>
          <div className="text-emerald-700 font-extrabold">"Fortune Sunflower Oil 5L"</div>
          <div className="text-emerald-700 font-extrabold">"Maggi 12 pack"</div>
        </div>
      </div>
    </div>
  );
};
