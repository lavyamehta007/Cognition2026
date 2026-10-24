import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  speed?: number; // ms per character
  onComplete?: () => void;
}

export function useTypewriter(options: UseTypewriterOptions = {}) {
  const { speed = 20, onComplete } = options;
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const targetTextRef = useRef('');
  const currentIndexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback((text: string) => {
    clearTimer();
    targetTextRef.current = text;
    currentIndexRef.current = 0;
    setDisplayedText('');
    setIsTyping(true);

    timerRef.current = window.setInterval(() => {
      currentIndexRef.current += 1;
      const current = targetTextRef.current.slice(0, currentIndexRef.current);
      setDisplayedText(current);

      if (currentIndexRef.current >= targetTextRef.current.length) {
        clearTimer();
        setIsTyping(false);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, speed);
  }, [speed]);

  const skip = useCallback(() => {
    clearTimer();
    setDisplayedText(targetTextRef.current);
    setIsTyping(false);
    if (onCompleteRef.current) {
      onCompleteRef.current();
    }
  }, []);

  const reset = useCallback(() => {
    clearTimer();
    targetTextRef.current = '';
    currentIndexRef.current = 0;
    setDisplayedText('');
    setIsTyping(false);
  }, []);

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return {
    displayedText,
    isTyping,
    start,
    skip,
    reset,
  };
}
