import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchblogs } from "../../publicApi";
import { Calendar, ArrowRight } from "lucide-react";

const EventCard = ({ id, featured_image, category_details, title, content, created_at }) => (
  <div className="bg-white border border-gray-100 rounded-lg overflow-hidden flex flex-col h-full">
    <img
      src={featured_image}
      alt={title}
      className="w-full h-48 object-cover"
    />
    <div className="p-6 flex flex-col flex-1">
      <p className="text-orange-600 text-xs font-semibold uppercase tracking-wide mb-2">
        {category_details?.name || 'Uncategorized'}
      </p>
      <h3 className="font-display text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4 flex-1">
        {content.length > 120
          ? `${content.substring(0, 120)}...`
          : content
        }
      </p>
      {created_at && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
          })}
        </div>
      )}
      <Link
        to={`/BlogDetail/${id}`}
        className="inline-flex items-center gap-1 text-orange-600 font-medium text-sm hover:text-orange-700 transition-colors"
      >
        Read More <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  </div>
);

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadBlogs = async () => {
      try {
        setLoading(true);
        const blogsResponse = await fetchblogs();

        // Handle different response structures
        let blogsData;
        if (Array.isArray(blogsResponse)) {
          blogsData = blogsResponse;
        } else if (blogsResponse && Array.isArray(blogsResponse.data)) {
          blogsData = blogsResponse.data;
        } else if (blogsResponse && Array.isArray(blogsResponse.results)) {
          blogsData = blogsResponse.results;
        } else {
          throw new Error('Invalid response format: expected an array');
        }

        // Filter and sort blogs by created_at date
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Set to end of today for comparison

        const filteredBlogs = blogsData
          .filter(blog => {
            if (!blog.created_at) return false;
            const blogCreatedDate = new Date(blog.created_at);
            return blogCreatedDate <= today; // Blogs created today or earlier
          })
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)) // Sort by created_at descending (newest first)
          .slice(0, 4); // Get only the first 4 blogs

        setBlogs(filteredBlogs);
        setError(null);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs');
        setBlogs([]); // Ensure blogs is always an array
      } finally {
        setLoading(false);
      }
    };

    loadBlogs();
  }, []);

  if (loading) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading blogs...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-64">
          <div className="text-red-600">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 py-16">
      <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">From the field</p>
      <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-900 mb-8">Stories from the communities we work with</h2>

      {blogs.length === 0 ? (
        <div className="text-center text-gray-600">
          No blogs available at the moment.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {blogs.map((blog, index) => (
            <EventCard key={blog.id || index} {...blog} />
          ))}
        </div>
      )}

    </section>
  );
};

export default Blogs;