import React, { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ImageUpload = ({ isOpen, onClose, onTextExtracted, currentLanguage }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const [step, setStep] = useState('upload');
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const labels = {
    en: {
      title: "Upload Image",
      subtitle: "Take a photo or select from gallery",
      camera: "Camera",
      gallery: "Gallery",
      processing: "Processing image...",
      extractedText: "Extracted text:",
      confirm: "Insert Text",
      cancel: "Cancel",
      retake: "Retake",
      noText: "No text detected",
      error: "Processing failed",
      cameraError: "Camera access denied",
      fileError: "Invalid image file"
    },
    // ... other language translations
  };

  const currentLabels = labels[currentLanguage] || labels.en;

  const processImage = async (imageUrl) => {
    setIsProcessing(true);
    setError(null);
    setStep('processing');

    try {
      if (!imageUrl.startsWith('data:image/')) {
        throw new Error(currentLabels.fileError);
      }

      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      const { data: { text } } = await worker.recognize(imageUrl);
      
      setSelectedImage(imageUrl);
      setExtractedText(text || currentLabels.noText);
      setStep('confirm');

      await worker.terminate();
    } catch (err) {
      console.error('OCR Error:', err);
      setError(`${currentLabels.error}: ${err.message}`);
      setStep('upload');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleCameraClick = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      setStep('camera');
      
      // Wait for video element to be available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 0);
    } catch (err) {
      console.error('Camera Error:', err);
      setError(currentLabels.cameraError);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    // Stop the stream
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    await processImage(canvas.toDataURL('image/jpeg'));
  };

  const cancelCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setStep('upload');
  };


  const handleGalleryClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(currentLabels.fileError);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => processImage(event.target.result);
    reader.onerror = () => setError(currentLabels.fileError);
    reader.readAsDataURL(file);
  };

  const handleConfirm = () => {
    if (!extractedText) {
      setError(currentLabels.noText);
      return;
    }

    onTextExtracted(extractedText);
    handleClose();
  };

  const handleClose = () => {
    setSelectedImage(null);
    setExtractedText('');
    setIsProcessing(false);
    setError(null);
    setStep('upload');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-200 p-4">
      <div className="bg-card rounded-2xl w-full max-w-md mx-auto overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              {currentLabels.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {currentLabels.subtitle}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors duration-150"
          >
            <Icon name="X" size={16} className="text-muted-foreground" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        <div className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          {step === 'upload' && (
            <div className="space-y-4">
              <button
                onClick={handleCameraClick}
                disabled={isProcessing}
                className="w-full flex items-center space-x-3 p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors duration-150 disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Camera" size={20} className="text-primary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-card-foreground">{currentLabels.camera}</p>
                  <p className="text-sm text-muted-foreground">Take a new photo</p>
                </div>
              </button>

              <button
                onClick={handleGalleryClick}
                disabled={isProcessing}
                className="w-full flex items-center space-x-3 p-4 bg-muted hover:bg-muted/80 rounded-lg transition-colors duration-150 disabled:opacity-50"
              >
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <Icon name="Image" size={20} className="text-secondary-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-card-foreground">{currentLabels.gallery}</p>
                  <p className="text-sm text-muted-foreground">Choose from gallery</p>
                </div>
              </button>
            </div>
          )}


          {step === 'camera' && (
            <div className="space-y-4">
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  ref={videoRef}
                  className="w-full h-64 object-cover"
                  autoPlay
                  playsInline
                  muted
                />
               
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={cancelCamera}
                  className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg"
                >
                  {currentLabels.cancel}
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
                >
                  Take Photo
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Loader2" size={24} className="text-primary animate-spin" />
              </div>
              <p className="text-lg font-medium text-card-foreground mb-2">
                {currentLabels.processing}
              </p>
              <p className="text-sm text-muted-foreground">
                Extracting text from image...
              </p>
            </div>
          )}

          {step === 'confirm' && (
  <div className="space-y-4">
    <div className="rounded-lg overflow-hidden">
      <Image 
        src={selectedImage} 
        alt="Selected" 
        className="w-full h-48 object-cover"
      />
    </div>

    {/* Updated text container with scroll */}
    <div className="bg-muted rounded-lg p-3 max-h-[200px] overflow-y-auto">
      <p className="text-sm font-medium text-card-foreground mb-2">
        {currentLabels.extractedText}
      </p>
      <p className="text-sm text-foreground whitespace-pre-line">
        {extractedText}
      </p>
    </div>

    {/* Fixed buttons container */}
    <div className="flex space-x-3 pt-2">
      <button
        onClick={() => setStep('upload')}
        className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg"
      >
        {currentLabels.retake}
      </button>
      <button
        onClick={handleConfirm}
        className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg"
        disabled={!extractedText}
      >
        {currentLabels.confirm}
      </button>
    </div>
  </div>
)}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;