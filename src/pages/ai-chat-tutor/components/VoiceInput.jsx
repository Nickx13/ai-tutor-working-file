import React, { useEffect, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import Icon from '../../../components/AppIcon';

export default function VoiceInput({ isActive, onTranscript, onClose }) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    finalTranscript
  } = useSpeechRecognition();

  const [isProcessing, setIsProcessing] = useState(false);
  const [permissionError, setPermissionError] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Handle speech recognition
  useEffect(() => {
    const startRecognition = async () => {
      if (isActive && browserSupportsSpeechRecognition) {
        try {
          setIsRequestingPermission(true);
          // First request microphone permission
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop()); // Clean up immediately
          
          resetTranscript();
          await SpeechRecognition.startListening({ 
            continuous: true,
            language: "en-IN"
          });
          setPermissionError(null);
        } catch (error) {
          console.error("Permission denied:", error);
          setPermissionError(
            error.name === 'NotAllowedError' 
              ? "Please allow microphone permissions in your browser settings"
              : "Microphone access failed"
          );
        } finally {
          setIsRequestingPermission(false);
        }
      }
    };

    startRecognition();

    return () => {
      SpeechRecognition.stopListening();
    };
  }, [isActive, browserSupportsSpeechRecognition]);

  // Auto-send when user stops speaking
  useEffect(() => {
    if (finalTranscript && !listening) {
      handleSend();
    }
  }, [finalTranscript, listening]);

  const handleSend = () => {
    if (transcript.trim()) {
      setIsProcessing(true);
      setTimeout(() => {
        onTranscript(transcript.trim());
        resetTranscript();
        onClose();
        setIsProcessing(false);
      }, 500);
    }
  };

  const toggleListening = async () => {
    try {
      setIsRequestingPermission(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setPermissionError(null);

      if (listening) {
        await SpeechRecognition.stopListening();
      } else {
        resetTranscript();
        await SpeechRecognition.startListening({ 
          continuous: true,
          language: "en-IN"
        });
      }
    } catch (error) {
      console.error("Microphone access error:", error);
      setPermissionError(
        error.name === 'NotAllowedError' 
          ? "Please allow microphone permissions in your browser settings"
          : "Microphone access failed"
      );
    } finally {
      setIsRequestingPermission(false);
    }
  };

  if (!isActive) return null;

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-80">
          <p className="text-red-500 mb-4">
            Your browser doesn't support voice input
          </p>
          <button 
            onClick={onClose}
            className="w-full py-2 bg-primary text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 max-w-[90vw]">
        {/* Error Message */}
        {permissionError && (
          <div className="mb-4 p-2 bg-red-100 text-red-600 rounded text-sm">
            {permissionError}
          </div>
        )}

        {/* Microphone Button */}
        <div className="flex justify-center mb-4">
          <button 
            onClick={toggleListening}
            disabled={isProcessing || isRequestingPermission}
            className={`w-16 h-16 rounded-full flex items-center justify-center
              ${listening ? "bg-red-100 animate-pulse" : "bg-gray-100"}
              ${isProcessing || isRequestingPermission ? "opacity-50" : ""}`}
          >
            {isProcessing || isRequestingPermission ? (
              <div className="animate-spin">
                <Icon name="Loader2" size={24} className="text-gray-600" />
              </div>
            ) : (
              <Icon 
                name="Mic" 
                size={24} 
                className={listening ? "text-red-600" : "text-gray-600"} 
              />
            )}
          </button>
        </div>

        {/* Status Messages */}
        <div className="mb-4 text-center">
          <p className="font-medium">
            {isRequestingPermission ? "Requesting access..." :
             isProcessing ? "Processing..." : 
             listening ? "Listening..." : "Ready to listen"}
          </p>
          <p className="text-sm text-gray-500">
            {isRequestingPermission ? "Checking microphone permissions..." :
             isProcessing ? "Sending your message..." :
             listening ? "Speak now - click mic when done" : 
             "Press the mic button to begin"}
          </p>
        </div>

        {/* Transcript Display */}
        <div className="bg-gray-50 rounded-lg p-3 min-h-12 mb-4">
          {transcript ? (
            <p className="text-gray-800">{transcript}</p>
          ) : (
            <p className="text-gray-400 text-sm">
              {listening ? "Waiting for speech..." : "Your speech will appear here"}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              resetTranscript();
              onClose();
            }}
            className="flex-1 py-2 bg-gray-200 rounded-lg"
            disabled={isProcessing || isRequestingPermission}
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={!transcript.trim() || isProcessing || isRequestingPermission}
            className={`flex-1 py-2 rounded-lg ${
              (!transcript.trim() || isProcessing || isRequestingPermission) 
                ? "bg-gray-300 text-gray-500" 
                : "bg-primary text-white"
            }`}
          >
            {isProcessing ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}