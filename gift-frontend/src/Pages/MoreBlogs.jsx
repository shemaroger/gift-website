import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, BookOpen } from 'lucide-react';
import { fetchblogs, fetchCategory } from "../publicApi";

const MoreBlogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [blogsPerPage] = useState(3);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch blogs and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch blogs
        const blogsResponse = await fetchblogs();
        if (blogsResponse.success) {
          setBlogs(blogsResponse.data);
          setTotalPages(Math.ceil(blogsResponse.data.length / blogsPerPage));
        } else {
          setError(blogsResponse.message);
        }

        // Fetch categories
        const categoriesResponse = await fetchCategory();
        if (categoriesResponse.success) {
          setCategories(categoriesResponse.data);
        } else {
          setError(categoriesResponse.message);
        }
      } catch (err) {
        setError("An error occurred while fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [blogsPerPage]);
  const handleReadMore = (id) => {
    navigate(`/BlogDetail/${id}`);
  };

  const indexOfLastBlog = currentPage * blogsPerPage;
  const indexOfFirstBlog = indexOfLastBlog - blogsPerPage;

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);
  const actualTotalPages = Math.ceil(filteredBlogs.length / blogsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const nextPage = () => {
    if (currentPage < actualTotalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getCategoryCounts = () => {
    const counts = {};
    blogs.forEach(blog => {
      const categoryName = blog.category_details?.name;
      if (categoryName) {
        counts[categoryName] = (counts[categoryName] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  };

  const getRecentPosts = () => {
    return blogs
      .sort((a, b) => new Date(b.published_date || b.created_at) - new Date(a.published_date || a.created_at))
      .slice(0, 3)
      .map(blog => ({
        id: blog.id,
        title: blog.title,
        category: typeof blog.category === 'object' ? blog.category.name : blog.category,
        image: blog.featured_image
      }));
  };


  const getTags = () => {
    return Array.from(new Set(categories.map(cat => cat.name))).slice(0, 6);
  };

  if (loading) {
    return (
      <div className="mt-24 flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <div className="text-xl font-medium text-gray-700">Loading blogs...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=" flex justify-center items-center h-64 mt-60">

        <h2 className="text-xl font-bold text-gray-500">
          Oops something went wrong while Loading Blogs
        </h2>
      </div>

    );
  }

  const categoryCounts = getCategoryCounts();
  const recentPosts = getRecentPosts();
  const tags = getTags();

  const pageNumbers = [];
  for (let i = 1; i <= actualTotalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="bg-white mt-28 md:mt-32">
      {/* Hero Section */}
      <div className="bg-gray-200 py-6 md:py-8">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-700 text-xs font-semibold uppercase tracking-wide mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            Our Blog
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-semibold text-gray-900 leading-tight mb-2">
            Stories from the communities we work with
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed mb-4">
            Field notes, program updates, and the people behind the numbers.
          </p>

          <div className="max-w-xl mx-auto">
            <div className="relative">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search articles..."
                className="w-full px-5 py-2.5 pl-12 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-gray-900 placeholder-gray-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-12">
            {currentBlogs.length > 0 ? (
              currentBlogs.map((blog) => (
                <div
                  key={blog.id}
                  className="group flex flex-col md:flex-row md:items-start gap-8 border-b border-gray-100 pb-12"
                >
                  <div className="relative w-full md:w-2/5 aspect-video overflow-hidden rounded-lg">
                    <img
                      src={blog.featured_image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {typeof blog.category === 'object' && blog.category && (
                      <span className="absolute top-4 left-4 bg-black/70 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                        {blog.category.name}
                      </span>
                    )}
                  </div>

                  <div className="w-full md:w-3/5 flex flex-col">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <div className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>
                          {new Date(blog.published_date || blog.created_at).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-2xl font-bold mb-3 text-gray-900 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
                      {blog.title}
                    </h2>

                    <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>

                    <button
                      className="inline-flex items-center text-sm font-semibold text-orange-600 hover:text-orange-800 transition-colors duration-200 mt-auto group/btn"
                      onClick={() => handleReadMore(blog.uuid)}
                    >
                      Read article
                      <svg
                        className="w-5 h-5 ml-1 transform group-hover/btn:translate-x-1 transition-transform duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-gray-50 rounded-lg py-16 text-center">
                <svg className="w-20 h-20 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-2xl text-gray-400 font-light">No blogs found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or check back later for new content</p>
              </div>
            )}

            {/* Pagination */}
            {filteredBlogs.length > 0 && (
              <nav className="flex justify-center mt-16 py-8">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={prevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center justify-center p-2 rounded-lg ${currentPage === 1
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                      } transition-colors duration-200`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {pageNumbers.map(number => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors duration-200 ${currentPage === number
                        ? 'bg-orange-600 text-white font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    onClick={nextPage}
                    disabled={currentPage === actualTotalPages}
                    className={`flex items-center justify-center p-2 rounded-lg ${currentPage === actualTotalPages
                      ? 'text-gray-300 cursor-not-allowed'
                      : 'text-gray-600 hover:bg-gray-100'
                      } transition-colors duration-200`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </nav>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Categories */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Categories
              </h3>
              <div className="space-y-1">
                {categoryCounts.map((category) => (
                  <div key={category.name} className="flex justify-between items-center group hover:bg-white p-3 rounded-xl transition-all duration-200 cursor-pointer">
                    <span className="text-gray-700 group-hover:text-orange-700">{category.name}</span>
                    <span className="bg-orange-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {category.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Posts */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Posts
              </h3>
              <div className="space-y-6">
                {recentPosts.map((post, index) => (
                  <div
                    key={index}
                    className="flex gap-4 group cursor-pointer"
                    onClick={() => handleReadMore(post.uuid)}
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-800 group-hover:text-orange-600 transition-colors duration-200 line-clamp-2">
                        {post.title}
                      </h4>
                      {post.category && (
                        <span className="text-xs text-orange-600 mt-1 inline-block">{post.category}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-6 text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-full text-sm hover:bg-orange-600 hover:text-white hover:border-orange-600 cursor-pointer transition-all duration-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreBlogs;