"use client";

import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import PrivacyNotice from "@/components/privacy/PrivacyNotice";
import { GuideModal } from "@/components/layout/Modal";

export default function TranslationApp() {
  let timerId: NodeJS.Timeout | null = null;

  const [translatedText, setTranslatedText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false);
  const [sourceLang, setSourceLang] = useState("en-US");
  const [targetLang, setTargetLang] = useState("zh-TW");
  const [translationError, setTranslationError] = useState("");
  const [transcriptionError, setTranscriptionError] = useState("");

  let timer: NodeJS.Timeout | null;

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const handleRecord = () => {
    if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) return;
    setTranscriptionError("");

    if (isRecording) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({
        continuous: true,
        language: sourceLang,
      });
    }
    setIsRecording(!isRecording);
  };

  const handleSpeak = () => {
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang;

    const wasRecording = isRecording;

    // Pause recognition while speaking
    if (isRecording) {
      SpeechRecognition.stopListening();
      setIsRecording(false);
    }

    utterance.onend = () => {
      // Resume recognition after speaking
      if (wasRecording) {
        SpeechRecognition.startListening({
          continuous: true,
          language: sourceLang,
        });
        setIsRecording(true);
      }
    };

    speechSynthesis.speak(utterance);
  };

  //cleaning up asynchronous callback timers
  useEffect(() => {
    return () => {
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [timerId]);

  useEffect(() => {
    if (!browserSupportsSpeechRecognition || !isMicrophoneAvailable) {
      alert("Speech recognition not supported or microphone unavailable.");
    }
  }, [browserSupportsSpeechRecognition, isMicrophoneAvailable]);

  useEffect(() => {
    // Get the native SpeechRecognition object
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();

    // Set up the error listener
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setTranscriptionError(event.error);
    };

    // Cleanup on unmount
    return () => {
      recognition.onerror = null;
    };
  }, []);

  useEffect(() => {
    if (!transcript) return;

    timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: transcript, targetLang, sourceLang }),
        });

        if (!response.ok) {
          const err = await response.json();
          setTranslationError(err.error || "Translation service failed");
          setTranslatedText("");
          return;
        }

        const data = await response.json();
        setTranslatedText(data.translation);
        setTranslationError("");
      } catch (err) {
        setTranslationError(
          "An error occurred while translating. Please try again."
        );
        setTranslatedText("");
      }
    }, 1000);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [transcript, sourceLang, targetLang]);

  useEffect(() => {
    const userGuide = document.querySelector("#guide") as HTMLElement;
    if (userGuide) {
      userGuide.classList.add("animate-[slideDown_0.3s_ease-out_forwards]");
      userGuide.classList.remove("animate-[slideUp_0.3s_ease-out_forwards]");
    }
  }, [isGuideModalOpen]);

  const showGuideModalHandler = () => {
    setIsGuideModalOpen(true);
  };

  const hideModalHandler = (
    setModalState: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    const modal = document.querySelector(`#guide`) as HTMLElement;

    if (modal) {
      modal.classList.remove(`animate-[slideDown_0.3s_ease-out_forwards]`);
      modal.classList.add(`animate-[slideUp_0.3s_ease-out_forwards]`);

      timerId = setTimeout(() => {
        setModalState(false);
      }, 300);
    } else {
      setModalState(false);
    }
  };

  return (
    <>
      <PrivacyNotice />

      <div className="max-w-md mx-auto p-4 space-y-6 md:max-w-lg lg:max-w-2xl">
        <div className="w-full relative">
          <h1 className="text-xl font-bold text-center">
            Healthcare Translator
          </h1>
          <button
            onClick={showGuideModalHandler}
            className="group top-[5px] cursor-pointer right-0 absolute"
          >
            <i className="fa-solid fa-circle-info text-2xl text-yellow-500"></i>
            <span className="sr-only">Open User Guide</span>

            {/* Tooltip */}
            <div className="absolute top-10 right-1/2 translate-x-1/2 scale-0 group-hover:scale-100 transition transform bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
              Open User Guide
            </div>
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <div className="flex flex-col gap-y-1 items-start w-full">
            <label htmlFor="native">Choose Native Language</label>
            <select
              id="native"
              className="border rounded px-2 py-1 w-full"
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              <option value="en-US">English (US)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
              <option value="zh-TW">Chinese (Traditional)</option>
            </select>
          </div>

          <div className="flex flex-col gap-y-1 items-start w-full">
            <label htmlFor="native">Translated Language</label>
            <select
              className="border rounded px-2 py-1 w-full"
              value={targetLang}
              onChange={(e) => setTargetLang(e.target.value)}
            >
              <option value="zh-TW">Chinese (Traditional)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Spanish</option>
              <option value="fr-FR">French</option>
              <option value="de-DE">German</option>
            </select>
          </div>
        </div>

        <Button onClick={handleRecord} className="w-full">
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">
              Original Transcript
            </label>
            <Textarea
              value={transcript}
              readOnly
              placeholder="Listening..."
              className="h-40"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">
              Translated Transcript
            </label>
            <Textarea
              value={translatedText}
              readOnly
              placeholder="Translation..."
              className="h-40"
            />
          </div>
        </div>

        {translationError && (
          <div className="text-red-600 text-sm font-medium">
            {translationError}
          </div>
        )}
        {transcriptionError && (
          <div className="text-red-600 text-sm font-medium mt-1">
            Transcription error: {transcriptionError}
          </div>
        )}

        <Button
          onClick={handleSpeak}
          className="w-full"
          disabled={!translatedText}
        >
          Speak Translation
        </Button>
      </div>
      {isGuideModalOpen && (
        <GuideModal onClose={() => hideModalHandler(setIsGuideModalOpen)}>
          <h2 className="text-lg font-semibold mb-4">
            Healthcare Translator – User Guide
          </h2>
          <div className="space-y-4 text-sm text-gray-700">
            <div>
              <strong>📝 How to Use</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Select input and translated languages.</li>
                <li>Click “Start Recording” and speak clearly.</li>
                <li>Transcripts appear in real-time.</li>
                <li>Click “Speak Translation” to hear it aloud.</li>
              </ul>
            </div>
            <div>
              <strong>🔒 Privacy & Security</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Microphone is only active while recording.</li>
                <li>Data is not stored or shared.</li>
                <li>App uses secure HTTPS and SameSite cookies.</li>
              </ul>
            </div>
            <div>
              <strong>❗ Troubleshooting</strong>
              <ul className="list-disc ml-5 mt-1 space-y-1">
                <li>Ensure browser mic permissions are enabled.</li>
                <li>Use a supported browser like Chrome.</li>
                <li>If translation fails, try again shortly.</li>
              </ul>
            </div>
          </div>
        </GuideModal>
      )}
    </>
  );
}
