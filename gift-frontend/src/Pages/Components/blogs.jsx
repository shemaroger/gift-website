import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchblogs } from "../../publicApi";
import { Calendar, ArrowRight } from "lucide-react";

const BlogCard = ({ uuid, featured_image, category_details, title, content, created_at }) => (
  <Link to={`/BlogDetail/${uuid}`} className="block group">
    <div className="rounded-lg overflow-hidden mb-4">
      <img
        src={featured_image}
        alt={title}
        className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
    </div>

    <h3 className="font-display text-lg font-semibold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
      {title}
    </h3>

    <div className="text-gray-500 text-xs uppercase tracking-wide mb-2">
      {created_at && (
        <span>
          {new Date(created_at).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          })}
        </span>
      )}
      {category_details?.name && (
        <>
          <span className="mx-1.5">&bull;</span>
          <span>{category_details.name}</span>
        </>
      )}
    </div>

    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
      {content}
    </p>
    <span className="inline-flex items-center gap-1 text-orange-600 font-semibold text-xs uppercase tracking-wide">
      Read More <ArrowRight className="w-3.5 h-3.5" />
    </span>
  </Link>
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
          .slice(0, 3); // One full row at lg:grid-cols-3

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, index) => (
            <BlogCard key={blog.id || index} {...blog} />
          ))}
        </div>
      )}

    </section>
  );
};

export default Blogs;