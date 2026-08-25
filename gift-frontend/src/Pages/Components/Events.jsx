import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { fetchEvents } from "../../publicApi";

const EventCard = ({ uuid, start_date, title, location, event_type }) => {
  const navigate = useNavigate();
  const eventDate = new Date(start_date);
  const day = eventDate.getDate().toString().padStart(2, '0');
  const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();

  const handleClick = () => {
    navigate(`/EventDetails/${uuid}`);
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

          {/* Event Meta Information */}
          <div className="flex flex-wrap gap-2 mb-3">
            {location && (
              <span className="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
                {location}
              </span>
            )}
            {event_type && (
              <span className="text-xs text-gray-600 bg-gray-100 rounded px-2 py-1">
                {event_type.charAt(0).toUpperCase() + event_type.slice(1)}
              </span>
            )}
          </div>

          <div className="flex items-center text-orange-500 font-medium group-hover:text-orange-600">
            View details <ChevronRight className="w-4 h-4 ml-1" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const response = await fetchEvents();

        const now = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Set to start of tomorrow

        // Get recent events (past month, up to now)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(now.getMonth() - 1);
        const recent = response.data.results.filter((event) => {
          const eventDate = new Date(event.start_date);
          return (
            eventDate >= oneMonthAgo && eventDate <= now && event.is_active
          );
        });

        setRecentEvents(recent.slice(0, 2));

        // Get upcoming events (starting from tomorrow)
        const oneMonthLater = new Date();
        oneMonthLater.setMonth(tomorrow.getMonth() + 1);
        const upcoming = response.data.results
          .filter((event) => {
            const eventDate = new Date(event.start_date);
            return (
              eventDate >= tomorrow && // Only events from tomorrow onwards
              eventDate <= oneMonthLater &&
              event.is_active &&
              event.is_public
            );
          })
          .slice(0, 4);

        setUpcomingEvents(upcoming);
        setError(null);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-700 text-lg font-medium">Loading events...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600 text-lg font-semibold">{error}</div>
        </div>
      </section>
    );
  }

  // Nothing to show — hide the whole section rather than an empty placeholder.
  if (upcomingEvents.length === 0 && recentEvents.length === 0) {
    return null;
  }

  return (
    <section className="bg-gray-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">Get involved</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-900">Upcoming Events</h2>
          </div>
          {upcomingEvents.length > 0 && (
            <Link
              to="/events"
              className="inline-flex items-center gap-1 text-orange-600 font-medium hover:text-orange-700 transition-colors"
            >
              View all events <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id || index} {...event} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Events;