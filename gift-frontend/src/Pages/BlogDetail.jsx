import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchblogById } from "../publicApi";
import { User, Calendar, Tag, FileText, Sparkles, ArrowLeft } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true);
        const blogData = await fetchblogById(id);
        setBlog(blogData.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch blog');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-lg text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20">
        <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-red-500 text-xl font-bold mb-2">Error</div>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 px-4 text-center">
        <h1 className="font-display text-3xl md:text-4xl font-semibold text-white mb-4">
          Blog Not Found
        </h1>
        <p className="text-gray-300 max-w-md mb-8">
          The blog post you're looking for doesn't exist.
        </p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
        >
          Go Back
        </button>
      </div>
    );
  }

  // Format the published date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className='mt-28 md:mt-32'>
      {/* Hero Section */}
      <div className="bg-slate-900 py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-300 text-xs font-semibold uppercase tracking-wide mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Blog Article
          </span>

          <h1 className="font-display text-2xl md:text-4xl font-semibold text-white leading-tight mb-4">
            {blog.title}
          </h1>
          <p className="text-gray-300 text-base leading-relaxed">
            {blog.excerpt || "Explore our insightful articles that inspire change, spark conversations, and empower growth."}
          </p>

          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-8 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blog.author?.first_name ? `${blog.author.first_name} ${blog.author.last_name}` : blog.author?.username || 'Unknown Author'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(blog.published_date || blog.created_at)}</span>
            </div>
            {blog.category && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>{blog.category.name || blog.category}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="capitalize">{blog.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Featured Image */}
        {blog.featured_image && (
          <div className="mb-8">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Article Content */}
        <article className="prose prose-lg max-w-none">
          <div
            className="text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>

        {/* Additional Blog Information */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Published Information</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Created:</strong> {formatDate(blog.created_at)}</p>
                <p><strong>Last Updated:</strong> {formatDate(blog.updated_at)}</p>
                {blog.published_date && (
                  <p><strong>Published:</strong> {formatDate(blog.published_date)}</p>
                )}
              </div>
            </div>

            {blog.is_featured && (
              <div className="bg-orange-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-orange-800 mb-2">Featured Article</h3>
                <p className="text-sm text-orange-600">
                  This article is featured on our blog and represents some of our best content.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;