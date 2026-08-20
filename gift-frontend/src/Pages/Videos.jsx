import React, { useState, useEffect } from "react";
import { X, Camera, Image, Youtube, Layers } from "lucide-react";
import { fetchGalleryItems, fetchGalleryCategories } from "../publicApi";

const VideoGalleryPage = () => {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic stats calculated from video data
  const [videoStats, setVideoStats] = useState({
    totalVideos: 0,
    totalCategories: 0,
    youtubeVideos: 0,
    otherVideos: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const categoriesResponse = await fetchGalleryCategories();
        if (!categoriesResponse.success) {
          throw new Error(categoriesResponse.message);
        }
        const categoriesArray = Array.isArray(categoriesResponse.data) ? categoriesResponse.data : [];
        setCategories([{ id: "all", name: "All" }, ...categoriesArray]);

        const galleryItemsResponse = await fetchGalleryItems();
        if (!galleryItemsResponse.success) {
          throw new Error(galleryItemsResponse.message);
        }
        const galleryItemsArray = Array.isArray(galleryItemsResponse.data) ? galleryItemsResponse.data : [];
        const videoItems = galleryItemsArray.filter(item => item.media_type === 'video');
        setVideos(videoItems);

        // Calculate dynamic stats
        const totalVideos = videoItems.length;
        const totalCategories = categoriesArray.length;
        const youtubeVideos = videoItems.filter(video =>
          video.video_url && (video.video_url.includes('youtube.com') || video.video_url.includes('youtu.be'))
        ).length;
        const otherVideos = totalVideos - youtubeVideos;

        setVideoStats({
          totalVideos,
          totalCategories,
          youtubeVideos,
          otherVideos
        });

        setLoading(false);
      } catch (err) {
        setError(err.message || "Failed to fetch gallery data");
        setLoading(false);
        console.error("Error fetching gallery data:", err);
      }
    };

    fetchData();
  }, []);

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const filteredVideos = activeFilter === "all"
    ? videos
    : videos.filter(video =>
      video.categories.some(category => category.id.toString() === activeFilter)
    );

  const openModal = (video) => {
    setSelectedVideo(video);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedVideo(null);
    document.body.style.overflow = "auto";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-700">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="text-red-500 text-5xl mb-4">!</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Gallery</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-28 md:mt-32 bg-white">
      <div className="bg-slate-900 py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-300 text-xs font-semibold uppercase tracking-wide mb-6">
            <Camera className="w-3.5 h-3.5" />
            Video Stories
          </span>
          <h1 className="font-display text-3xl md:text-5xl font-semibold text-white leading-tight mb-4">
            Watch the work in motion
          </h1>
          <p className="text-gray-300 text-base md:text-lg leading-relaxed">
            Training sessions, testimonials, and community moments — captured on camera.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${activeFilter === category.id
                ? "bg-orange-600 text-white"
                : "bg-white text-gray-700 border border-gray-200 hover:border-orange-300"
                }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {filteredVideos.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Videos Found</h3>
            <p className="text-gray-500">No videos found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredVideos.map((video) => (
              <div
                key={video.id}
                className="group relative overflow-hidden rounded-lg border border-gray-100"
              >
                <div className="relative">
                  {video.thumbnail ? (
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-64 object-cover"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                      <div className="text-gray-400">No thumbnail</div>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-white bg-opacity-75 rounded-full flex items-center justify-center">
                      <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-orange-600 border-b-8 border-b-transparent ml-1"></div>
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <h3 className="text-white text-xl font-semibold mb-2">
                      {video.title}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-1 mb-3">
                      {video.categories.map(category => (
                        <span
                          key={category.id}
                          className="inline-block px-3 py-1 bg-white bg-opacity-25 rounded-full text-white text-sm capitalize"
                        >
                          {category.name}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => openModal(video)}
                      className="mt-2 px-4 py-2 bg-white text-gray-800 rounded-full text-sm hover:bg-gray-100 transition-colors"
                    >
                      Watch
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
            <div className="relative bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <button
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
              <div className="p-6">
                {isYouTubeUrl(selectedVideo.video_url) ? (
                  <div className="relative pt-[56.25%] w-full mb-4">
                    <iframe
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      src={`https://www.youtube.com/embed/${getYouTubeVideoId(selectedVideo.video_url)}`}
                      title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                ) : (
                  <video
                    src={selectedVideo.video_url}
                    controls
                    autoPlay
                    className="w-full h-[400px] object-cover rounded-lg mb-4"
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                <h2 className="text-2xl font-bold mb-2">{selectedVideo.title}</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedVideo.categories.map(category => (
                    <span
                      key={category.id}
                      className="inline-block px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-sm"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
                {selectedVideo.description && (
                  <p className="text-gray-700 mt-4">{selectedVideo.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Stats Section */}
        <div className="border-t border-gray-100 py-16 mt-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-6 border border-gray-100 rounded-lg">
              <Camera className="w-6 h-6 text-orange-600 mx-auto mb-3" />
              <h4 className="font-display text-3xl font-semibold text-gray-900 mb-1">{videoStats.totalVideos}+</h4>
              <p className="text-gray-600 text-sm">Total Videos</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-lg">
              <Layers className="w-6 h-6 text-green-600 mx-auto mb-3" />
              <h4 className="font-display text-3xl font-semibold text-gray-900 mb-1">{videoStats.totalCategories}+</h4>
              <p className="text-gray-600 text-sm">Categories</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-lg">
              <Youtube className="w-6 h-6 text-orange-600 mx-auto mb-3" />
              <h4 className="font-display text-3xl font-semibold text-gray-900 mb-1">{videoStats.youtubeVideos}+</h4>
              <p className="text-gray-600 text-sm">YouTube Videos</p>
            </div>
            <div className="p-6 border border-gray-100 rounded-lg">
              <Image className="w-6 h-6 text-green-600 mx-auto mb-3" />
              <h4 className="font-display text-3xl font-semibold text-gray-900 mb-1">{videoStats.otherVideos}+</h4>
              <p className="text-gray-600 text-sm">Other Videos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoGalleryPage;