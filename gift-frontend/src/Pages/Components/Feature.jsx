import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchEvents } from "../../publicApi";
import { MapPin, Calendar, ArrowRight, Globe } from "lucide-react";

const Feature = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadEvents = async () => {
            try {
                setLoading(true);
                const response = await fetchEvents();
                if (response.data && Array.isArray(response.data.results)) {
                    const today = new Date();
                    today.setHours(23, 59, 59, 999); // Set to end of today for comparison

                    // Filter events from today and backwards, then sort by start_date descending
                    const filteredEvents = response.data.results
                        .filter(event => {
                            if (!event.start_date) return false;
                            const eventStartDate = new Date(event.start_date);
                            return eventStartDate <= today; // Events that started today or earlier
                        })
                        .sort((a, b) => new Date(b.start_date) - new Date(a.start_date)) // Sort by start_date descending (newest first)
                        .slice(0, 5); // Get only the first 5 events

                    setEvents(filteredEvents);
                } else {
                    setEvents([]);
                }
                setError(null);
            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Failed to load events');
                setEvents([]);
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, []);

    const settings = {
        dots: true,
        infinite: events.length > 1, // Only infinite if more than 1 event
        speed: 500,
        slidesToShow: Math.min(4, events.length), // Show at most 4 or the number of events available
        slidesToScroll: 1,
        arrows: true,
        responsive: [
            {
                breakpoint: 1024, // Tablets
                settings: {
                    slidesToShow: Math.min(3, events.length),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 768, // Mobile Landscape
                settings: {
                    slidesToShow: Math.min(2, events.length),
                    slidesToScroll: 1,
                },
            },
            {
                breakpoint: 480, // Mobile Portrait
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                },
            },
        ],
    };

    if (loading) {
        return (
            <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-12 bg-gray-100">
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600 text-lg">Loading events...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-12 bg-gray-100">
                <div className="flex justify-center items-center h-64">
                    <div className="text-red-600 text-lg">{error}</div>
                </div>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-12 bg-gray-100">
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-600 text-lg">No events available at the moment.</div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 md:px-8 py-8 sm:py-12 bg-gray-100">
            <div className="max-w-2xl mx-auto sm:mx-0 text-center sm:text-left mb-8">
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-gray-900 mb-2">Recent Events</h2>
                <p className="text-gray-600 text-sm">What's happened on the ground lately</p>
            </div>

            {events.length === 1 ? (
                <FeaturedEvent event={events[0]} />
            ) : (
                <Slider {...settings}>
                    {events.map((event, index) => (
                        <div key={event.id || index} className="px-4">
                            <EventCard event={event} />
                        </div>
                    ))}
                </Slider>
            )}
        </div>
    );
};

function EventCard({ event }) {
    const navigate = useNavigate();

    return (
        <div
            className="cursor-pointer group"
            onClick={() => navigate(`/EventDetails/${event.uuid}`)}
        >
            <div className="rounded-lg overflow-hidden mb-4">
                <img
                    src={event.featured_image || event.image || "/api/placeholder/400/256"}
                    alt={event.title}
                    className="h-56 w-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
            </div>

            <div className="flex items-center gap-3 mb-2">
                <span className="bg-orange-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                    {event.event_type === "online" ? "Online" : event.event_type || "Event"}
                </span>
                {event.start_date && (
                    <span className="text-gray-500 text-xs">
                        {new Date(event.start_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </span>
                )}
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                {event.title}
            </h3>

            {(event.location || event.event_type === 'online') && (
                <div className="flex items-center text-sm text-gray-500">
                    {event.event_type === "online" ? (
                        <Globe className="w-4 h-4 mr-1 flex-shrink-0" />
                    ) : (
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    )}
                    <span className="truncate">
                        {event.event_type === "online" ? "Online Event" : event.location}
                    </span>
                </div>
            )}
        </div>
    );
}

// When there's only one event, filling the section with one large card reads
// better than a carousel with a single, oddly-narrow slide.
function FeaturedEvent({ event }) {
    const navigate = useNavigate();

    return (
        <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
            <div className="w-full h-72 md:h-96 bg-gray-900">
                <img
                    src={event.featured_image || event.image || "/api/placeholder/400/256"}
                    alt={event.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-8 md:p-12 border-t-4 border-orange-600">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-3">{event.title}</h3>

                <div className="flex flex-wrap gap-2 mb-4">
                    {event.event_type && (
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            {event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1)}
                        </span>
                    )}
                    {event.location && (
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            <MapPin className="inline w-3 h-3 mr-1" />{event.location}
                        </span>
                    )}
                </div>

                <p className="text-gray-600 leading-relaxed">{event.description}</p>

                {event.start_date && (
                    <div className="mt-4 text-sm text-gray-500">
                        <Calendar className="inline w-4 h-4 mr-1" />{new Date(event.start_date).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                        {event.end_date && new Date(event.start_date).toDateString() !== new Date(event.end_date).toDateString() && (
                            <span> - {new Date(event.end_date).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                            })}</span>
                        )}
                    </div>
                )}

                <button
                    onClick={() => navigate(`/EventDetails/${event.uuid}`)}
                    className="mt-6 inline-flex items-center self-start px-5 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium"
                >
                    View Event <ArrowRight className="ml-2 w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

export default Feature;