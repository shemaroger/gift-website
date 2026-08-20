import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchAds } from "../../publicApi";

const ImageSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      try {
        setLoading(true);
        const response = await fetchAds();

        // Get current date for comparison
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset time to start of day for accurate date comparison

        // Filter ads based on active status and date range
        const filteredAds = response.data.results.filter(ad => {
          // Check if ad is active
          if (!ad.is_active) {
            return false;
          }

          // Parse start_date and end_date
          const startDate = new Date(ad.start_date);
          const endDate = new Date(ad.end_date);

          // Reset time to start of day for accurate comparison
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999); // Set end date to end of day

          // Check if current date is within the range
          const isAfterStartDate = currentDate >= startDate;
          const isBeforeEndDate = currentDate <= endDate;

          return isAfterStartDate && isBeforeEndDate;
        });

        setAds(filteredAds);
        setError(null);

        // Reset current slide if filtered ads length is less than current slide index
        if (filteredAds.length > 0 && currentSlide >= filteredAds.length) {
          setCurrentSlide(0);
        }

      } catch (err) {
        console.error('Error fetching ads:', err);
        setError('Failed to load content');
        setAds([]);
      } finally {
        setLoading(false);
      }
    };

    loadAds();
  }, [currentSlide]); // Added currentSlide as dependency to handle slide reset

  useEffect(() => {
    if (ads.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % ads.length);
      }, 8000); // Change slide every 8 seconds

      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
  };


  // Show error or no ads message
  if (error || ads.length === 0) {
    return (
      <div className="flex justify-center items-center h-96 bg-gray-100 rounded-lg mt-44">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <div className="text-gray-600 text-lg">Loading content...</div>
        </div>
      </div>
    );
  }

  const currentAd = ads[currentSlide];

  return (
    <div className="relative w-full rounded-lg shadow-2xl mt-44 overflow-hidden">
      <div className="relative">
        {/* Image loading overlay */}
        {imageLoading && (
          <div className="absolute inset-0 flex justify-center items-center bg-gray-100 rounded-lg z-10">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <div className="text-gray-600 text-sm">Loading image...</div>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.img
            key={currentSlide}
            src={currentAd.image || "/api/placeholder/1200/800"}
            alt={currentAd.title}
            className="w-full object-cover rounded-lg"
            initial={{ clipPath: "circle(0% at 50% 50%)" }}
            animate={{ clipPath: "circle(100% at 50% 50%)" }}
            exit={{ clipPath: "circle(0% at 50% 50%)" }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            onLoadStart={() => setImageLoading(true)}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg"></div>

        <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3">
          {ads.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${currentSlide === index
                ? "bg-orange-600 scale-125 shadow-lg"
                : "bg-white bg-opacity-60 hover:bg-opacity-80"
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;