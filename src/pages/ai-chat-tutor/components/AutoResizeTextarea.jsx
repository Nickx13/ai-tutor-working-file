import React, { useEffect, useRef } from 'react';

const AutoResizeTextarea = ({ 
  value, 
  onChange, 
  maxRows = 6,
  className = '',
  ...props 
}) => {
  const textareaRef = useRef(null);
  const baseHeight = useRef(0);

  useEffect(() => {
    if (textareaRef.current) {
      // Calculate single row height on first render
      if (baseHeight.current === 0) {
        textareaRef.current.style.height = 'auto';
        baseHeight.current = textareaRef.current.scrollHeight;
      }
      
      const maxHeight = baseHeight.current * maxRows;
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      
      textareaRef.current.style.height = `${newHeight}px`;
      textareaRef.current.style.overflowY = newHeight >= maxHeight ? 'auto' : 'hidden';
    }
  }, [value, maxRows]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      onChange={onChange}
      className={`w-full min-h-[44px] px-4 py-3 bg-muted rounded-2xl focus:outline-none resize-none ${className}`}
      style={{
        transition: 'height 0.1s ease-out',
        minHeight: '44px',
        WebkitOverflowScrolling: 'touch' // Smooth scrolling on iOS
      }}
      {...props}
    />
  );
};

export default AutoResizeTextarea;