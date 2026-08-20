import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';

const ScrollButtons = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    setIsVisible(window.pageYOffset > 300);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-8 right-8 flex flex-col gap-3 z-50">
          <button
            onClick={scrollToTop}
            className="p-4 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out"
            aria-label="Scroll to top"
          >
            <ArrowUp size={24} className="stroke-2" />
          </button>

          <button
            onClick={scrollToBottom}
            className="p-4 bg-orange-600 text-white rounded-full shadow-lg hover:bg-orange-700 hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-out"
            aria-label="Scroll to bottom"
          >
            <ArrowDown size={24} className="stroke-2" />
          </button>
        </div>
      )}
    </>
  );
};

export default ScrollButtons;