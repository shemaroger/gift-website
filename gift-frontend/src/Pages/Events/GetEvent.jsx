import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Search,
  Filter,
  X,
  Clock,
  User,
  Tag,
  Award,
  CheckCircle,
  ToggleRight,
  ToggleLeft,
  Edit,
  Calendar as CalendarIcon,
  FileText,
  Globe,
  MapPin as MapIcon,
  Mail,
  Share2,
  ExternalLink,
  Info,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { fetchEvents, updateEvent, deleteEvent } from "../../api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EventsDisplay = () => {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStatusUpdateModalOpen, setIsStatusUpdateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);
  const [filters, setFilters] = useState({
    eventType: "all",
    isActive: "all",
    dateRange: "all",
  });
  const [selectedTab, setSelectedTab] = useState("details");

  const ITEMS_PER_PAGE = 6; // Set to 6 rows per page

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchEvents();
      if (response.success) {
        const sortedData = [...response.data.results].sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at);
        });
        setAllEvents(sortedData);
        applyFiltersAndSearch(sortedData);
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError("Error fetching events: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Apply filtering and search whenever search term or filters change
  useEffect(() => {
    applyFiltersAndSearch(allEvents);
  }, [searchTerm, filters, currentPage]);

  const applyFiltersAndSearch = (eventsList) => {
    if (!eventsList.length) return;

    let filteredEvents = [...eventsList];

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.title.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term) ||
          (event.location && event.location.toLowerCase().includes(term))
      );
    }

    // Apply type filter
    if (filters.eventType !== "all") {
      filteredEvents = filteredEvents.filter(
        (event) => event.event_type === filters.eventType
      );
    }

    // Apply active filter
    if (filters.isActive !== "all") {
      const isActive = filters.isActive === "active";
      filteredEvents = filteredEvents.filter(
        (event) => event.is_active === isActive
      );
    }

    // Apply date filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      filteredEvents = filteredEvents.filter((event) => {
        const eventDate = new Date(event.start_date);
        switch (filters.dateRange) {
          case "today":
            return eventDate >= today && eventDate < tomorrow;
          case "thisWeek":
            return eventDate >= today && eventDate < nextWeek;
          case "thisMonth":
            return eventDate >= today && eventDate < nextMonth;
          default:
            return true;
        }
      });
    }

    // Calculate total pages based on ITEMS_PER_PAGE
    setTotalPages(Math.max(1, Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)));

    // Ensure current page is valid
    if (
      currentPage > Math.ceil(filteredEvents.length / ITEMS_PER_PAGE) &&
      filteredEvents.length > 0
    ) {
      setCurrentPage(1);
    }

    // Paginate results - showing ITEMS_PER_PAGE items per page
    const indexOfLastEvent = currentPage * ITEMS_PER_PAGE;
    const indexOfFirstEvent = indexOfLastEvent - ITEMS_PER_PAGE;
    const paginatedEvents = filteredEvents.slice(
      indexOfFirstEvent,
      indexOfLastEvent
    );

    setEvents(paginatedEvents);
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateShort = (dateString) => {
    const options = { month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getEventTypeLabel = (type) => {
    const EVENT_TYPE_CHOICES = [
      { value: "offline", label: "In-Person Event" },
      { value: "online", label: "Online Event" },
      { value: "hybrid", label: "Hybrid Event" },
    ];
    const option = EVENT_TYPE_CHOICES.find((choice) => choice.value === type);
    return option ? option.label : type;
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "online":
        return "bg-blue-100 text-blue-800";
      case "offline":
        return "bg-green-100 text-green-800";
      case "hybrid":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
    setCurrentPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setFilters({
      eventType: "all",
      isActive: "all",
      dateRange: "all",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // Modal handlers
  const openEventModal = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
    setSelectedTab("details"); // Reset to details tab
    document.body.style.overflow = "hidden";
  };

  const closeEventModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
    document.body.style.overflow = "auto";
  };

  const openStatusUpdateModal = (event, e) => {
    if (e) e.stopPropagation();
    setSelectedEvent(event);
    setIsStatusUpdateModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const closeStatusUpdateModal = () => {
    setIsStatusUpdateModalOpen(false);
    setSelectedEvent(null);
    document.body.style.overflow = "auto";
  };

  const handleStatusUpdate = async (id, eventData) => {
    setUpdateLoading(true);
    try {
      const result = await updateEvent(id, eventData);
      if (result.success) {
        toast.success("Event status updated successfully!");
        fetchData();
        closeStatusUpdateModal();
      } else {
        toast.error(result.message || "Failed to update event status");
      }
      return result;
    } catch (error) {
      toast.error("Error updating event status: " + error.message);
      console.log(error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event? This cannot be undone.")) {
      return;
    }
    try {
      const result = await deleteEvent(id);
      if (result.success) {
        toast.success(result.message);
        if (selectedEvent?.id === id) {
          closeEventModal();
        }
        fetchData();
      } else {
        toast.error(result.message || "Failed to delete event");
      }
    } catch (error) {
      toast.error("Error deleting event: " + error.message);
    }
  };

  // Calculate remaining spots for an event
  const getRemainingSpots = (event) => {
    if (!event) return 0;
    const capacity = event.capacity || 100;
    const registered = event.registrations?.length || 0;
    return Math.max(0, capacity - registered);
  };

  // Calculate if event is past
  const isEventPast = (event) => {
    if (!event) return false;
    return new Date(event.end_date) < new Date();
  };

  const copyEventLink = (event) => {
    if (!event.event_link) return;
    navigator.clipboard.writeText(event.event_link);
    toast.success("Event link copied to clipboard!");
  };

  const getEventStatus = (event) => {
    if (!event.is_active)
      return {
        text: "Inactive",
        color: "text-gray-600",
        bgColor: "bg-gray-100",
        icon: <ToggleLeft className="h-4 w-4 mr-1" />,
      };

    const now = new Date();
    const startDate = new Date(event.start_date);
    const endDate = new Date(event.end_date);

    if (now < startDate)
      return {
        text: "Upcoming",
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        icon: <Clock className="h-4 w-4 mr-1" />,
      };

    if (now >= startDate && now <= endDate)
      return {
        text: "In Progress",
        color: "text-green-600",
        bgColor: "bg-green-100",
        icon: <CheckCircle className="h-4 w-4 mr-1" />,
      };

    return {
      text: "Completed",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      icon: <Award className="h-4 w-4 mr-1" />,
    };
  };

  // Enhanced Pagination Component
  const PaginationComponent = () => {
    const getVisiblePages = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];

      for (
        let i = Math.max(2, currentPage - delta);
        i <= Math.min(totalPages - 1, currentPage + delta);
        i++
      ) {
        range.push(i);
      }

      if (currentPage - delta > 2) {
        rangeWithDots.push(1, '...');
      } else {
        rangeWithDots.push(1);
      }

      rangeWithDots.push(...range);

      if (currentPage + delta < totalPages - 1) {
        rangeWithDots.push('...', totalPages);
      } else if (totalPages > 1) {
        rangeWithDots.push(totalPages);
      }

      return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
      <div className="mt-8 flex justify-center">
        <nav className="flex items-center space-x-1">
          {/* Previous Button */}
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === 1
              ? "text-gray-400 cursor-not-allowed bg-gray-100"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-orange-300"
              }`}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </button>

          {/* Page Numbers */}
          <div className="hidden sm:flex space-x-1">
            {getVisiblePages().map((page, index) => {
              if (page === '...') {
                return (
                  <span
                    key={`dots-${index}`}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700"
                  >
                    ...
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${currentPage === page
                    ? "bg-orange-600 text-white transform scale-105"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600"
                    }`}
                >
                  {page}
                </button>
              );
            })}
          </div>

          {/* Mobile: Show current page info */}
          <div className="sm:hidden">
            <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
              {currentPage} of {totalPages}
            </span>
          </div>

          {/* Next Button */}
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${currentPage === totalPages
              ? "text-gray-400 cursor-not-allowed bg-gray-100"
              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-orange-300"
              }`}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </nav>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="mb-6 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold font-display">Manage Events</h1>
          <div className="flex space-x-2">
            <Link
              to="/dashboard/addevent"
              className="px-4 py-2 text-md rounded-lg bg-orange-600 hover:bg-orange-700 text-white flex items-center"
            >
              <Plus size={16} className="mr-1" /> Add Event
            </Link>
          </div>
        </div>
        <p className="mt-2 text-gray-600">
          Discover and manage all your events
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="container mx-auto max-w-7xl px-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-4 space-y-4 lg:space-y-0">
            {/* Search Input */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Event Type Filter */}
            <div className="min-w-[150px]">
              <select
                value={filters.eventType}
                onChange={(e) =>
                  handleFilterChange("eventType", e.target.value)
                }
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Types</option>
                <option value="online">Online</option>
                <option value="offline">In-Person</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {/* Active Status Filter */}
            <div className="min-w-[150px]">
              <select
                value={filters.isActive}
                onChange={(e) => handleFilterChange("isActive", e.target.value)}
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="min-w-[150px]">
              <select
                value={filters.dateRange}
                onChange={(e) =>
                  handleFilterChange("dateRange", e.target.value)
                }
                className="block w-full border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>

            {/* Filter Indicator */}
            <div className="flex items-center px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
              <Filter size={16} className="mr-2" />
              Filters
              {(filters.eventType !== "all" ||
                filters.isActive !== "all" ||
                filters.dateRange !== "all") && (
                  <span className="ml-2 bg-orange-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                    {(filters.eventType !== "all" ? 1 : 0) +
                      (filters.isActive !== "all" ? 1 : 0) +
                      (filters.dateRange !== "all" ? 1 : 0)}
                  </span>
                )}
            </div>

            {/* Clear Filters Button */}
            {(filters.eventType !== "all" ||
              filters.isActive !== "all" ||
              filters.dateRange !== "all" ||
              searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-orange-600 hover:text-orange-800 whitespace-nowrap"
                >
                  Clear all filters
                </button>
              )}
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="container mx-auto max-w-7xl px-4 mb-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {events.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, allEvents.length)} of{" "}
            {allEvents.length} events
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
      </div>

      {/* Table Display */}
      <div className="container mx-auto max-w-7xl px-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <div className="text-red-500 mb-4">
              <p>Error: {error}</p>
            </div>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-8 text-center">
            <h3 className="text-xl font-medium font-display text-gray-800 mb-1">
              No events found
            </h3>
            <p className="text-gray-500">
              {searchTerm ||
                filters.eventType !== "all" ||
                filters.isActive !== "all" ||
                filters.dateRange !== "all"
                ? "Try adjusting your search or filters"
                : "There are no events to display"}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Event
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Type
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Date
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Registrations
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 mr-3">
                            {event.image ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={event.image}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-orange-500" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {event.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {event.description
                                ? event.description.length > 50
                                  ? `${event.description.slice(0, 20)}...`
                                  : event.description
                                : "No description available"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 inline-flex text-xs rounded-full font-medium ${getEventTypeColor(
                            event.event_type
                          )}`}
                        >
                          {getEventTypeLabel(event.event_type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(event.start_date)}
                        </div>
                        <div className="text-xs text-gray-500">
                          to {formatDate(event.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {event.event_type === "online"
                            ? "Online"
                            : event.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-600">
                                {event.registrations?.length || 0} /{" "}
                                {event.capacity || 100}
                              </span>
                              <span className="text-xs text-orange-600 font-medium">
                                {Math.round(
                                  ((event.registrations?.length || 0) /
                                    (event.capacity || 100)) *
                                  100
                                )}
                                %
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div
                                className="bg-orange-600 h-1.5 rounded-full"
                                style={{
                                  width: `${((event.registrations?.length || 0) /
                                    (event.capacity || 100)) *
                                    100
                                    }%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {event.is_active ? (
                            <>
                              <ToggleRight
                                size={16}
                                className="text-green-500 mr-1"
                              />
                              <span className="text-sm text-green-600">
                                Active
                              </span>
                            </>
                          ) : (
                            <>
                              <ToggleLeft
                                size={16}
                                className="text-gray-500 mr-1"
                              />
                              <span className="text-sm text-gray-600">
                                Inactive
                              </span>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex justify-end items-center space-x-4">
                          <button
                            onClick={() => openEventModal(event)}
                            className="flex items-center text-orange-600 hover:text-orange-800"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                          </button>
                          <button
                            onClick={(e) => openStatusUpdateModal(event, e)}
                            className="flex items-center text-orange-600 hover:text-orange-800"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Update
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteEvent(event.id);
                            }}
                            className="flex items-center text-orange-600 hover:text-orange-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Enhanced Pagination */}
        <PaginationComponent />
      </div>

      {/* Redesigned Event Detail Modal */}
      {isModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Modal Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-60 transition-opacity"
            onClick={closeEventModal}
          ></div>

          {/* Modal Content */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header with Image Banner */}
              <div className="relative h-48 bg-orange-600">
                {selectedEvent.image ? (
                  <img
                    src={selectedEvent.image}
                    alt={selectedEvent.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-20 w-20 text-white opacity-30" />
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-black/30"></div>

                {/* Close Button */}
                <button
                  onClick={closeEventModal}
                  className="absolute top-4 right-4 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 transition-all"
                >
                  <X className="h-5 w-5" />
                </button>

                {/* Event Type Badge */}
                <div className="absolute bottom-4 left-4">
                  <span
                    className={`px-3 py-1 inline-flex text-xs rounded-full font-medium ${getEventTypeColor(
                      selectedEvent.event_type
                    )}`}
                  >
                    {getEventTypeLabel(selectedEvent.event_type)}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="absolute bottom-4 right-4">
                  <span
                    className={`px-3 py-1 inline-flex text-xs rounded-full font-medium ${selectedEvent.is_active
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                      }`}
                  >
                    {selectedEvent.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>

              {/* Modal Body - Scrollable area */}
              <div className="overflow-y-auto max-h-[calc(90vh-12rem)] p-6">
                {/* Event Title */}
                <h2 className="text-2xl font-bold font-display text-gray-900 mb-2">
                  {selectedEvent.title}
                </h2>

                {/* Event Quick Info */}
                <div className="flex flex-wrap gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {formatDate(selectedEvent.start_date)} -{" "}
                      {formatDate(selectedEvent.end_date)}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {selectedEvent.event_type === "online"
                        ? "Online Event"
                        : selectedEvent.location}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Users className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {selectedEvent.registrations?.length || 0} Registered (
                      {getRemainingSpots(selectedEvent)} spots left)
                    </span>
                  </div>
                </div>

                {/* Event Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold font-display mb-2 text-gray-900">
                    About This Event
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {selectedEvent.description}
                  </p>
                </div>

                {/* Event Additional Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div>
                    {/* Event Details */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold font-display mb-2 text-gray-900">
                        Event Details
                      </h3>
                      <ul className="space-y-3">
                        {selectedEvent.online_link && (
                          <li className="flex items-start">
                            <Link className="h-5 w-5 text-orange-600 mt-0.5 mr-2 flex-shrink-0" />
                            <div>
                              <p className="text-sm font-medium text-gray-700">
                                Event Link
                              </p>
                              <a
                                href={selectedEvent.online_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-orange-600 hover:underline"
                              >
                                Join Event Online
                              </a>
                            </div>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold font-display mb-2 text-gray-900">
                      Created At
                    </h3>
                    <p className="text-gray-700 whitespace-pre-line">
                      {formatDate(selectedEvent.created_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                <div></div>

                <div className="flex space-x-3">
                  <button
                    onClick={closeEventModal}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>

                  <button
                    onClick={(e) => openStatusUpdateModal(selectedEvent, e)}
                    className="flex px-4 py-2 items-center bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Update Status
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="flex px-4 py-2 items-center bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {isStatusUpdateModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-50 transition-opacity"
            onClick={closeStatusUpdateModal}
          ></div>
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="relative bg-white rounded-xl border border-gray-200 max-w-md w-full p-6">
              <h2 className="text-xl font-bold font-display text-gray-900 mb-4">
                Update Event Status
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Status
                </label>
                <select
                  value={selectedEvent.is_active}
                  onChange={(e) =>
                    setSelectedEvent({
                      ...selectedEvent,
                      is_active: e.target.value === "true",
                    })
                  }
                  className="block w-full border border-gray-300 rounded-lg py-2 px-3 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeStatusUpdateModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                  disabled={updateLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleStatusUpdate(selectedEvent.id, {
                      is_active: selectedEvent.is_active,
                    })
                  }
                  disabled={updateLoading}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateLoading ? "Updating..." : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsDisplay;