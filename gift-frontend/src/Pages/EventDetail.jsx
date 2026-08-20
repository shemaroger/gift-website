import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Globe, Share2, Users, Tag, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eventbyid, fetchEvents } from "../publicApi";

const EventCard = ({ id, day, month, title, image }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/EventDetails/${id}`);
    };

    return (
        <div
            className="bg-white border border-gray-100 rounded-lg hover:border-orange-200 transition-colors overflow-hidden cursor-pointer group"
            onClick={handleClick}
        >
            <div className="p-5 flex items-start space-x-4">
                <div className="bg-orange-100 rounded-lg p-3 text-center min-w-16">
                    <div className="text-3xl font-bold text-orange-600">{day}</div>
                    <div className="uppercase text-xs font-semibold text-orange-500">{month}</div>
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{title}</h3>
                    <div className="flex items-center text-orange-500 font-medium group-hover:text-orange-600">
                        View details <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const EventDetails = () => {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [shared, setShared] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchEventDetails = async () => {
            try {
                // Fetch the specific event by id
                if (id) {
                    const eventResponse = await Eventbyid(id);
                    if (eventResponse.success) {
                        setEvent(eventResponse.data);
                    } else {
                        setError(eventResponse.message);
                    }
                }

                // Fetch upcoming events
                const response = await fetchEvents();
                if (response.success) {
                    const now = new Date();
                    const oneMonthLater = new Date();
                    oneMonthLater.setMonth(now.getMonth() + 1);

                    const upcoming = response.data.results
                        .filter((eventItem) => {
                            const eventDate = new Date(eventItem.start_date);
                            return (
                                eventDate >= now &&
                                eventDate <= oneMonthLater &&
                                eventItem.is_active &&
                                eventItem.is_public &&
                                eventItem.id !== id
                            );
                        })
                        .slice(0, 3); // Only take 3 events for display

                    setUpcomingEvents(upcoming);
                } else {
                    console.error("Error fetching upcoming events:", response.message);
                }
            } catch (err) {
                setError("Failed to load event details.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-orange-50">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="w-64 h-6 bg-orange-200 rounded-md mb-4"></div>
                    <div className="w-48 h-4 bg-orange-100 rounded-md"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen bg-orange-50">
                <div className="text-xl text-red-600 p-8 bg-white shadow-lg rounded-xl border-l-4 border-red-600">
                    <h2 className="font-bold mb-2">Error</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    if (!event) {
        return (
            <div className="flex justify-center items-center h-screen bg-orange-50">
                <div className="text-xl p-8 bg-white shadow-lg rounded-xl">
                    <h2 className="font-bold mb-2">Event not found</h2>
                    <p>The event you're looking for doesn't exist or has been removed.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Back to Events
                    </button>
                </div>
            </div>
        );
    }

    // Format dates
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (date) => {
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: 'numeric'
        });
    };

    // Format date for event cards
    const formatEventCardDate = (dateString) => {
        const date = new Date(dateString);
        return {
            day: date.getDate().toString(),
            month: date.toLocaleString('en-US', { month: 'short' }).toUpperCase()
        };
    };

    // Create date/time display string
    let dateTimeDisplay;
    if (startDate.toDateString() === endDate.toDateString()) {
        // Same day event
        dateTimeDisplay = `${formatDate(startDate)}, ${formatTime(startDate)} - ${formatTime(endDate)}`;
    } else {
        // Multi-day event
        dateTimeDisplay = `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`;
    }

    // Images array - could include banner, event image, and potentially others
    const images = [];
    if (event.banner) images.push({ src: event.banner, alt: `${event.title} banner` });
    if (event.image && event.image !== event.banner) images.push({ src: event.image, alt: event.title });

    // Handle image navigation
    const goToNextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const goToPrevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleShare = async () => {
        const shareData = { title: event.title, url: window.location.href };
        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
                // user cancelled the share sheet
            }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            setShared(true);
            setTimeout(() => setShared(false), 2000);
        }
    };

    return (
        <div className="bg-orange-50 mt-28 md:mt-32">
            {/* Hero Section */}
            <div className="bg-slate-900 py-24 relative overflow-hidden text-white">
                <div className="absolute inset-0 opacity-30">
                    <svg className="h-full w-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
                        <path
                            fill="#fff"
                            fillOpacity="0.1"
                            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,117.3C672,107,768,117,864,144C960,171,1056,213,1152,202.7C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                        />
                    </svg>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-2xl mx-auto text-center">
                        <h1 className="font-display text-3xl md:text-5xl font-semibold mb-6 leading-tight">
                            {event.title}
                        </h1>

                        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 mb-8">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                {event.event_type === 'offline' ? (
                                    <>
                                        <MapPin className="w-5 h-5 text-orange-400" />
                                        <span>{event.location || "Location to be announced"}</span>
                                    </>
                                ) : (
                                    <>
                                        <Globe className="w-5 h-5 text-orange-400" />
                                        <span>Online Event</span>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                                <Calendar className="w-5 h-5 text-orange-400" />
                                <span>{dateTimeDisplay}</span>
                            </div>
                        </div>

                        {event.event_type === 'online' && event.online_link && (
                            <a
                                href={event.online_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-orange-500 text-white hover:bg-orange-600 font-medium rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                            >
                                Join Online Event
                            </a>
                        )}

                        <div className="mt-8">
                            <button
                                onClick={() => navigate('/events')}
                                className="flex items-center justify-center text-orange-300 hover:text-white transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Back to Events
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Content Section */}
            <div className="container mx-auto px-4 py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Image Gallery */}
                    {images.length > 0 && (
                        <div className="mb-12 relative overflow-hidden rounded-lg">
                            <div className="aspect-w-16 aspect-h-9 relative">
                                <img
                                    src={images[currentImageIndex].src}
                                    alt={images[currentImageIndex].alt}
                                    className="w-full object-cover "
                                />



                                {/* Image navigation controls */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={goToPrevImage}
                                            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                                            aria-label="Previous image"
                                        >
                                            <ChevronLeft className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={goToNextImage}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-colors"
                                            aria-label="Next image"
                                        >
                                            <ChevronRight className="w-6 h-6" />
                                        </button>

                                        {/* Image indicators */}
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                            {images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setCurrentImageIndex(index)}
                                                    className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                                                        }`}
                                                    aria-label={`Go to image ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="bg-white border border-gray-100 rounded-lg p-6 md:p-8 mb-8">
                                <h2 className="font-display text-2xl font-semibold text-gray-800 mb-6">About This Event</h2>
                                {event.description ? (
                                    <div
                                        className="prose max-w-none text-gray-700"
                                        dangerouslySetInnerHTML={{ __html: event.description }}
                                    />
                                ) : (
                                    <p className="text-gray-500 italic">No description available for this event.</p>
                                )}
                            </div>

                            {/* Additional info sections could go here */}
                        </div>

                        {/* Sidebar */}
                        <div className="md:w-80">
                            <div className="bg-white border border-gray-100 rounded-lg p-6 sticky top-4">
                                <h3 className="font-semibold text-gray-800 mb-4">Event Details</h3>

                                <div className="space-y-4">
                                    <div className="flex items-start">
                                        <Calendar className="w-5 h-5 text-orange-500 mt-1 mr-3" />
                                        <div>
                                            <p className="font-medium text-gray-700">Date & Time</p>
                                            <p className="text-gray-600 text-sm">{dateTimeDisplay}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start">
                                        {event.event_type === 'offline' ? (
                                            <>
                                                <MapPin className="w-5 h-5 text-orange-500 mt-1 mr-3" />
                                                <div>
                                                    <p className="font-medium text-gray-700">Location</p>
                                                    <p className="text-gray-600 text-sm">{event.location || "To be announced"}</p>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <Globe className="w-5 h-5 text-orange-500 mt-1 mr-3" />
                                                <div>
                                                    <p className="font-medium text-gray-700">Online Event</p>
                                                    {event.online_link ? (
                                                        <a
                                                            href={event.online_link}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-orange-500 hover:text-orange-600 text-sm underline"
                                                        >
                                                            Join Link
                                                        </a>
                                                    ) : (
                                                        <p className="text-gray-600 text-sm">Link will be provided soon</p>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {event.category && (
                                        <div className="flex items-start">
                                            <Tag className="w-5 h-5 text-orange-500 mt-1 mr-3" />
                                            <div>
                                                <p className="font-medium text-gray-700">Category</p>
                                                <p className="text-gray-600 text-sm">{event.category}</p>
                                            </div>
                                        </div>
                                    )}

                                    {event.organizer && (
                                        <div className="flex items-start">
                                            <Users className="w-5 h-5 text-orange-500 mt-1 mr-3" />
                                            <div>
                                                <p className="font-medium text-gray-700">Organizer</p>
                                                <p className="text-gray-600 text-sm">{event.organizer}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <button
                                        onClick={handleShare}
                                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        aria-label="Share this event"
                                    >
                                        {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                                        {shared ? 'Link Copied' : 'Share Event'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Events Section */}
            {upcomingEvents.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 py-16 bg-orange-50">
                    <div className="max-w-8xl mx-auto">
                        <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 mb-8">More Upcoming Events</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcomingEvents.map((upcomingEvent) => {
                                const { day, month } = formatEventCardDate(upcomingEvent.start_date);
                                return (
                                    <EventCard
                                        key={upcomingEvent.id}
                                        id={upcomingEvent.id}
                                        day={day}
                                        month={month}
                                        title={upcomingEvent.title}
                                        image={upcomingEvent.image || upcomingEvent.banner}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}


        </div>
    );
};

export default EventDetails;