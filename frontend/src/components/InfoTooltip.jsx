import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const iconRef = useRef(null);

  const handleMouseEnter = () => {
    if (!iconRef.current) return;
    const rect = iconRef.current.getBoundingClientRect();
    setCoords({
      left: rect.left + rect.width / 2,
      top: rect.top - 8
    });
    setShow(true);
  };

  useEffect(() => {
    if (show) {
      const handleScroll = () => setShow(false);
      window.addEventListener('scroll', handleScroll, true);
      return () => window.removeEventListener('scroll', handleScroll, true);
    }
  }, [show]);

  return (
    <div 
      className="inline-flex items-center justify-center ml-2"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setShow(false)}
      ref={iconRef}
    >
      <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center text-xs font-bold cursor-help border border-indigo-200 hover:bg-indigo-500 hover:text-white transition-colors">
        i
      </div>
      {show && createPortal(
        <div 
          className="fixed z-[99999] w-72 p-3 bg-slate-800 text-white text-xs rounded-xl shadow-2xl pointer-events-none text-center leading-relaxed whitespace-normal break-words animate-in fade-in duration-200"
          style={{
            left: coords.left,
            top: coords.top,
            transform: 'translate(-50%, -100%)'
          }}
        >
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
        </div>,
        document.body
      )}
    </div>
  );
}
