import React, { useState, useEffect } from 'react';
import { Camera, Image, Video, Layers, X } from 'lucide-react';
import { fetchGalleryItems, fetchGalleryCategories } from "../publicApi";

const GalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic stats calculated from gallery data
  const [galleryStats, setGalleryStats] = useState({
    totalItems: 0,
    totalCategories: 0,
    imageCount: 0,
    videoCount: 0
  });

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await fetchGalleryCategories();
        if (categoriesResponse.success) {
          setCategories([
            { id: 'all', label: 'All' },
            ...categoriesResponse.data.map(category => ({
              id: category.id.toString(),
              label: category.name
            }))
          ]);
        } else {
          throw new Error(categoriesResponse.message);
        }

        // Fetch gallery items
        const itemsResponse = await fetchGalleryItems();
        if (itemsResponse.success) {
          const imagesItems = itemsResponse.data.filter(item => item.media_type === 'image');
          setGalleryItems(imagesItems);

          // Calculate dynamic stats
          const totalItems = itemsResponse.data.length;
          const imageCount = itemsResponse.data.filter(item => item.media_type === 'image').length;
          const videoCount = itemsResponse.data.filter(item => item.media_type === 'video').length;
          const totalCategories = categoriesResponse.success ? categoriesResponse.data.length : 0;

          setGalleryStats({
            totalItems: totalItems,
            totalCategories: totalCategories,
            imageCount: imageCount,
            videoCount: videoCount
          });

        } else {
          throw new Error(itemsResponse.message);
        }
      } catch (err) {
        setError(err.message || 'Error fetching gallery data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter gallery items based on selected category
  const filteredItems = activeFilter === 'all'
    ? galleryItems
    : galleryItems.filter(item =>
      item.categories.some(category => category.id.toString() === activeFilter)
    );

  // Modal handlers
  const openModal = (item) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'auto';
  };

  // Helper function to get appropriate media element
  const renderMedia = (item, isModal = false) => {
    if (item.media_type === 'image') {
      return (
        <img
          src={item.image}
          alt={item.title}
          className={isModal ? "w-full h-[400px] object-cover rounded-lg mb-4" : "w-full h-64 object-cover"}
        />
      );
    } else if (item.media_type === 'video') {
      return (
        <div className={isModal ? "w-full h-[400px] mb-4" : "w-full h-64"}>
          {item.is_uploaded_video ? (
            <video
              src={item.media_url}
              controls
              className="w-full h-full rounded-lg bg-black"
            />
          ) : (
            <iframe
              src={item.video_url}
              title={item.title}
              className="w-full h-full rounded-lg"
              allowFullScreen
            />
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen mt-28 md:mt-32 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen mt-28 md:mt-32 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-28 md:mt-32 bg-white">
      {/* Hero Section */}
      <div className="bg-gray-200 py-8 md:py-10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-700 text-xs font-semibold uppercase tracking-wide mb-4">
            <Camera className="w-3.5 h-3.5" />
            Visual Stories
          </span>
          <h1 className="font-display text-2xl md:text-4xl font-semibold text-gray-900 leading-tight mb-2">
            Moments from the field
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Trainings, savings-group meetings, and the people behind them — in their own words and images.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === category.id
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300'
                }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg border border-gray-100"
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  renderMedia(item)
                )}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <h3 className="text-white text-xl font-semibold mb-2">{item.title}</h3>
                    {item.categories && item.categories.length > 0 && (
                      <span className="inline-block px-4 py-1 bg-white bg-opacity-25 rounded-full text-white text-sm capitalize mb-3">
                        {item.categories[0].name}
                      </span>
                    )}
                    <button
                      onClick={() => openModal(item)}
                      className="mt-2 px-4 py-2 bg-white text-gray-800 rounded-full text-sm hover:bg-gray-100 transition-colors"
                    >
                      See More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found in this category.</p>
          </div>
        )}

        {/* Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <div className="p-6">
                {renderMedia(selectedItem, true)}
                <h2 className="text-2xl font-bold mb-2">{selectedItem.title}</h2>
                {selectedItem.categories && selectedItem.categories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedItem.categories.map(category => (
                      <span
                        key={category.id}
                        className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                      >
                        {category.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-gray-600 leading-relaxed">
                  {selectedItem.description || "No description available."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="border-t border-gray-100 py-16 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-6 border border-gray-100 rounded-lg">
              <Image className="w-6 h-6 text-orange-600 mx-auto mb-3" />
              <h4 className="font-display text-3xl font-semibold text-gray-900 mb-1">{galleryStats.totalItems}+</h4>
              <p className="text-gray-600 text-sm">Total Items</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-lg">
              <Camera className="w-6 h-6 text-orange-600 mx-auto mb-3" />
              <h4 className="font-display text-3xl font-semibold text-gray-900 mb-1">{galleryStats.imageCount}+</h4>
              <p className="text-gray-600 text-sm">Photos</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-lg">
              <Video className="w-6 h-6 text-green-600 mx-auto mb-3" />
              <h4 className="font-display text-3xl font-semibold text-gray-900 mb-1">{galleryStats.videoCount}+</h4>
              <p className="text-gray-600 text-sm">Videos</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-lg">
              <Layers className="w-6 h-6 text-green-600 mx-auto mb-3" />
              <h4 className="font-display text-3xl font-semibold text-gray-900 mb-1">{galleryStats.totalCategories}+</h4>
              <p className="text-gray-600 text-sm">Categories</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;