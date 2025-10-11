import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const ImageUpload = ({ isOpen, onClose, onImagesSelected }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [stream, setStream] = useState(null);
  const [step, setStep] = useState('upload');
  
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const validImages = files.filter(file => file.type.startsWith('image/'));
    if (validImages.length !== files.length) {
      setError("Please select valid image files");
      return;
    }

    const totalImages = selectedImages.length + validImages.length;
    if (totalImages > 2) {
      setError(`Can only select up to 2 images. You have ${selectedImages.length} selected.`);
      return;
    }

    setSelectedImages([...selectedImages, ...validImages]);
    setError(null);
    e.target.value = '';
  };

  const handleCameraClick = async () => {
    if (selectedImages.length >= 2) {
      setError("Maximum 2 images allowed. Remove an image first.");
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setStep('camera');
      setError(null);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 0);
    } catch (err) {
      console.error('Camera Error:', err);
      setError("Camera access denied. Please allow camera permissions.");
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    if (selectedImages.length >= 2) {
      setError("Maximum 2 images allowed. Remove an image first.");
      cancelCamera();
      return;
    }

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
      const file = new File([blob], `camera-photo-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setSelectedImages([...selectedImages, file]);
      setError(null);
    }, 'image/jpeg');

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setStep('upload');
  };

  const cancelCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setStep('upload');
    setError(null);
  };

  const openGallery = () => {
    fileInputRef.current?.click();
  };

  const handleConfirm = () => {
    if (selectedImages.length === 0) {
      setError("Please select at least one image");
      return;
    }
    onImagesSelected(selectedImages);
    handleClose();
  };

  const handleClose = () => {
    selectedImages.forEach(image => {
      if (typeof image === 'string' && image.startsWith('blob:')) {
        URL.revokeObjectURL(image);
      }
    });
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setSelectedImages([]);
    setError(null);
    setStep('upload');
    onClose();
  };

  const removeImage = (index) => {
    const newImages = [...selectedImages];
    const removedImage = newImages[index];
    if (typeof removedImage === 'string' && removedImage.startsWith('blob:')) {
      URL.revokeObjectURL(removedImage);
    }
    newImages.splice(index, 1);
    setSelectedImages(newImages);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Enhanced Overlay with blur effect */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={handleClose}
      />
      
      {/* Enhanced Modal */}
      <div className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 max-w-lg mx-auto overflow-hidden">
        
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white">
                {step === 'camera' ? '📸 Take Photo' : '🖼️ Select Images'}
              </h3>
              <p className="text-blue-100 text-sm mt-1">
                {step === 'camera'
                  ? 'Position and capture your perfect shot'
                  : `Add up to 2 images • ${selectedImages.length}/2 selected`
                }
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <Icon name="X" size={20} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Camera View */}
          {step === 'camera' && (
            <div className="space-y-6">
              <div className="relative bg-gray-900 rounded-2xl overflow-hidden shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-80 object-cover"
                />
                {/* Camera overlay UI */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-white text-xs font-medium">🔴 Recording</span>
                  </div>
                  {/* Corner guides */}
                  <div className="absolute top-6 left-6 w-6 h-6 border-l-2 border-t-2 border-white/70"></div>
                  <div className="absolute top-6 right-6 w-6 h-6 border-r-2 border-t-2 border-white/70"></div>
                  <div className="absolute bottom-6 left-6 w-6 h-6 border-l-2 border-b-2 border-white/70"></div>
                  <div className="absolute bottom-6 right-6 w-6 h-6 border-r-2 border-b-2 border-white/70"></div>
                </div>
              </div>
              
              <div className="flex gap-4 justify-center">
                <button
                  onClick={cancelCamera}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center gap-3 shadow-lg transform hover:scale-105"
                >
                  <div className="w-8 h-8 border-2 border-white rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                  Capture Photo
                </button>
              </div>
            </div>
          )}

          {/* Upload Options */}
          {step === 'upload' && (
            <>
              {/* Selection Options with enhanced design */}
              <div className="grid grid-cols-2 flex justify-center gap-1 py-1">
          <button
            onClick={handleCameraClick}
            className="flex flex-col items-center justify-center p-3 rounded-xl transition hover:bg-blue-50 active:scale-95"
          >
            <span className="bg-blue-100 rounded-xl p-4 flex items-center justify-center">
              <Icon name="Camera" size={48} className="text-blue-500" />
            </span>
            <span className="mt-3 text-lg font-semibold text-gray-800">Camera</span>
            <span className="text-sm text-gray-500">Take a photo</span>
          </button>
          <button
            onClick={openGallery}
            className="flex flex-col items-center justify-center p-3 rounded-xl transition hover:bg-green-50 active:scale-95"
          >
            <span className="bg-green-100 rounded-xl p-4 flex items-center justify-center">
              <Icon name="Image" size={48} className="text-green-500" />
            </span>
            <span className="mt-3 text-lg font-semibold text-gray-800">Gallery</span>
            <span className="text-sm text-gray-500">Choose files</span>
          </button>
        </div>

              {/* Enhanced Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl animate-pulse">
                  <div className="flex items-center gap-3">
                    <div className="p-1 bg-red-100 rounded-full">
                      <Icon name="AlertCircle" size={16} className="text-red-600" />
                    </div>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Enhanced Image Preview */}
              {selectedImages.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="Check" size={16} className="text-green-600" />
                    <h4 className="text-sm font-bold text-gray-700">Selected Images</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                      {selectedImages.length}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedImages.map((image, index) => (
                      <div key={index} className="group relative">
                        <div className="relative overflow-hidden rounded-2xl shadow-lg">
                          <Image
                            src={URL.createObjectURL(image)}
                            alt={`Selected ${index + 1}`}
                            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-all duration-200 shadow-lg transform hover:scale-110"
                        >
                          <Icon name="X" size={14} />
                        </button>
                        <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                          #{index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 font-medium border border-gray-200 hover:border-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={selectedImages.length === 0}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-xl font-bold hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg transform hover:scale-105 disabled:hover:scale-100 flex items-center justify-center gap-2"
                >
                  <Icon name="Check" size={16} />
                  Confirm ({selectedImages.length})
                </button>
              </div>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>
    </>
  );
};

export default ImageUpload;
