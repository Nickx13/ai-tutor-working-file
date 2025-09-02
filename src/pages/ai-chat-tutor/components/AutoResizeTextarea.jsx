// In AutoResizeTextarea.jsx - Keep it unchanged from your original version
import React, { useEffect, useRef } from 'react';

const AutoResizeTextarea = ({ 
  value, 
  onChange, 
  onKeyPress, 
  placeholder, 
  maxRows = 8,
  className = '',
  ...props 
}) => {
  const textareaRef = useRef(null);
  const baseHeight = useRef(0);

  useEffect(() => {
    if (textareaRef.current) {
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
      onKeyPress={onKeyPress}
      placeholder={placeholder}
      className={`w-full min-h-[44px] px-4 py-3 bg-muted rounded-2xl 
        ring-0 
        focus:outline-none 
        focus-visible:ring-2 
        focus-visible:ring-blue-400 
        focus-visible:ring-offset-2 
        focus-visible:ring-offset-background 
        focus-visible:transition-shadow 
        focus-visible:duration-200 
        focus-visible:ease-out 
        resize-none 
        ${className}`}
      style={{
        transition: 'height 0.1s ease-out',
        minHeight: '44px',
        WebkitOverflowScrolling: 'touch'
      }}
      {...props}
    />
  );
};

export default AutoResizeTextarea;