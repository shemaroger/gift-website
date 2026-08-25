import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Globe, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchEvents } from "../publicApi";
import { format } from "date-fns";

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

const Events = () => {
  const [events, setEvents] = useState([]);
  const [allPastEvents, setAllPastEvents] = useState([]); // All events from today backwards
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 8;

  const navigate = useNavigate();

  const handleReadMore = (id) => {
    navigate(`/EventDetails/${id}`);
  };

  useEffect(() => {
    const getEvents = async () => {
      setLoading(true);
      try {
        const response = await fetchEvents();

        if (response.success) {
          setEvents(response.data);
          const now = new Date();
          now.setHours(23, 59, 59, 999); // Set to end of today for comparison

          // Get all events from today backwards (including today)
          const pastEvents = response.data.results
            .filter((event) => {
              if (!event.start_date) return false;
              const eventStartDate = new Date(event.start_date);
              return eventStartDate <= now; // Events that started today or earlier
            })
            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date)); // Sort by start_date descending (newest first)

          setAllPastEvents(pastEvents);

          // Keep upcoming events logic for future events
          const oneMonthLater = new Date();
          oneMonthLater.setMonth(now.getMonth() + 1);
          const upcoming = response.data.results
            .filter((event) => {
              const eventDate = new Date(event.start_date);
              return (
                eventDate > now && eventDate <= oneMonthLater && event.is_active && event.is_public
              );
            })
            .slice(0, 4);

          setUpcomingEvents(upcoming);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError("Failed to fetch events");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getEvents();
  }, []);

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: format(date, "d"),
      month: format(date, "MMM").toUpperCase(),
    };
  };

  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(allPastEvents.length / eventsPerPage);
  const startIndex = (currentPage - 1) * eventsPerPage;
  const endIndex = startIndex + eventsPerPage;
  const currentEvents = allPastEvents.slice(startIndex, endIndex);

  const goToPage = (page) => {
    setCurrentPage(page);
    // Scroll to events section
    document.getElementById('events-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const goToPrevious = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const goToNext = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen ">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 mt-60">
        <h2 className="text-2xl font-bold text-orange-600">
          Oops something went wrong while Loading Events
        </h2>
        <p className="mt-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white mt-28 md:mt-32">
      <div className="bg-gray-200 py-8 md:py-10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-700 text-xs font-semibold uppercase tracking-wide mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Events
          </span>
          <h1 className="font-display text-2xl md:text-4xl font-semibold text-gray-900 leading-tight mb-2">
            Where the community shows up
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Trainings, fundraisers, and gatherings — past and upcoming.
          </p>
        </div>
      </div>

      {/* All Past Events from Today Backwards with Pagination */}
      {allPastEvents.length > 0 && (
        <div id="events-section" className="container px-4 md:px-8 py-16 md:py-24 mx-auto">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-8">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900">
              Past Events
            </h2>
            <div className="text-gray-500 text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, allPastEvents.length)} of {allPastEvents.length}
            </div>
          </div>

          {/* Events Grid - 4 per row, 2 rows = 8 events per page */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-items-center">
            {currentEvents.map((event) => (
              <div key={event.id} className="w-full max-w-sm">
                <div className="bg-white border border-gray-100 rounded-lg p-6 h-full flex flex-col">
                  <img
                    src={event.image || "/images/event-placeholder.jpg"}
                    alt={event.title}
                    className="rounded-lg h-48 w-full object-cover"
                  />
                  <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-bold mt-4 mb-2">{event.title}</h3>
                    <p className="text-gray-600 text-sm mt-2 line-clamp-3 flex-1">
                      {event.description}
                    </p>

                    <div className="mt-auto pt-4">
                      <div className="flex items-center text-sm mb-2">
                        <Calendar className="w-4 h-4 mr-1 text-orange-500" />
                        <span className="text-gray-700">
                          {formatDisplayDate(event.start_date)}
                          {event.end_date && new Date(event.start_date).toDateString() !== new Date(event.end_date).toDateString() && (
                            <span> - {formatDisplayDate(event.end_date)}</span>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center text-sm mb-4">
                        {event.event_type === "online" ? (
                          <Globe className="w-4 h-4 mr-1 text-blue-500" />
                        ) : (
                          <MapPin className="w-4 h-4 mr-1 text-green-500" />
                        )}
                        <span className="text-gray-700">
                          {event.event_type === "online"
                            ? "Online Event"
                            : event.location}
                        </span>
                      </div>

                      <button
                        className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-orange-700 transition-colors"
                        onClick={() => handleReadMore(event.uuid)}
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-12 space-x-2">
              {/* Previous Button */}
              <button
                onClick={goToPrevious}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex space-x-1">
                {[...Array(totalPages)].map((_, index) => {
                  const page = index + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === page
                        ? 'bg-orange-600 text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                        }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next Button */}
              <button
                onClick={goToNext}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage === totalPages
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {totalPages > 1 && (
            <div className="text-center mt-4 text-gray-600 text-sm">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Events Section (Future Events) */}
      {upcomingEvents.length > 0 && (
        <section className="bg-gray-50 px-4 md:px-8 py-16 md:py-24">
          <div className="max-w-6xl mx-auto">
          <h3 className="font-display text-2xl font-semibold text-gray-900 flex items-center gap-3 mb-8">
            <Calendar className="w-6 h-6 text-orange-600" />
            Upcoming Events
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => {
              const { day, month } = formatEventDate(event.start_date);
              return (
                <EventCard
                  key={event.id}
                  id={event.uuid}
                  day={day}
                  month={month}
                  title={event.title}
                  location={event.location}
                  eventType={event.event_type}
                  handleReadMore={handleReadMore}
                />
              );
            })}
          </div>
          </div>
        </section>
      )}

      {allPastEvents.length === 0 && upcomingEvents.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold">No Events Found</h2>
          <p className="mt-4">Check back later for upcoming events.</p>
        </div>
      )}
    </div>
  );
};

export default Events;