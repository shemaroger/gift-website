import React, { useState, useEffect } from 'react';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { fetchEvents } from "../../publicApi";
import { MapPin, Calendar } from "lucide-react";

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

            <Slider {...settings}>
                {events.map((event, index) => (
                    <div key={event.id || index} className="px-4">
                        <div className="bg-white border border-gray-100 rounded-lg p-6 h-full">
                            {/* Event Image - using a placeholder if no image field */}
                            <img
                                src={event.featured_image || event.image || "/api/placeholder/400/256"}
                                alt={event.title}
                                className="rounded-lg h-64 w-full object-cover"
                            />

                            {/* Event Details */}
                            <div className="mt-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">{event.title}</h3>

                                {/* Event Type and Location */}
                                <div className="flex flex-wrap gap-2 mb-3">
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

                                {/* Event Description */}
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {event.description.length > 120
                                        ? `${event.description.substring(0, 120)}...`
                                        : event.description
                                    }
                                </p>

                                {/* Event Date Range */}
                                {event.start_date && (
                                    <div className="mt-3 text-sm text-gray-500">
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


                            </div>
                        </div>
                    </div>
                ))}
            </Slider>
        </div>
    );
};

export default Feature;