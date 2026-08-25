import React, { useState, useEffect } from "react";
import { MessageSquare, Quote, Film, Send, Check, AlertCircle } from "lucide-react";
import { fetchTestimonials, submitTestimonial } from "../publicApi";

const TestimonialsPage = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // { success, message }

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const result = await fetchTestimonials();
      if (result.success) {
        setTestimonials(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.message);
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !quote.trim()) {
      setSubmitResult({ success: false, message: 'Please fill in your name and testimonial.' });
      return;
    }

    setSubmitting(true);
    setSubmitResult(null);
    const result = await submitTestimonial({ name, role, quote });
    setSubmitting(false);
    setSubmitResult(result);

    if (result.success) {
      setName('');
      setRole('');
      setQuote('');
    }
  };

  return (
    <div className="bg-white mt-28 md:mt-32">
      {/* Hero */}
      <div className="bg-gray-200 py-8 md:py-10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="inline-flex items-center px-3 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-700 text-xs font-semibold uppercase tracking-wide mb-4">
            Voices of impact
          </span>
          <h1 className="font-display text-2xl md:text-4xl font-semibold text-gray-900 leading-tight mb-2">
            Testimonials
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Stories from the entrepreneurs, savings-group members, and communities we work with.
          </p>
        </div>
      </div>

      {/* Testimonial list */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="container mx-auto">
          {loading ? (
            <p className="text-center text-gray-500">Loading testimonials...</p>
          ) : error ? (
            <p className="text-center text-red-600">{error}</p>
          ) : testimonials.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <MessageSquare size={36} className="mx-auto mb-3 text-gray-300" />
              <p>No testimonials have been published yet.</p>
            </div>
          ) : testimonials.length === 1 ? (
            <FeaturedTestimonial testimonial={testimonials[0]} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div
                  key={t.id}
                  className="border border-gray-100 rounded-lg overflow-hidden flex flex-col"
                >
                  {t.gallery_item && (
                    <div className="w-full h-44 bg-gray-900">
                      {t.gallery_item.media_type === "image" ? (
                        <img
                          src={t.gallery_item.media_url}
                          alt={t.name}
                          className="w-full h-full object-cover"
                        />
                      ) : t.gallery_item.is_uploaded_video ? (
                        <video
                          src={t.gallery_item.media_url}
                          controls
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film size={28} className="text-white/70" />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col border-l-4 border-orange-600">
                    <Quote size={20} className="text-orange-600 mb-3" />
                    {t.quote && (
                      <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6">{t.quote}</p>
                    )}
                    <div>
                      <p className="font-display font-semibold text-gray-900">{t.name}</p>
                      {t.role && <p className="text-sm text-gray-500">{t.role}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Share your own testimonial */}
      <section className="bg-gray-50 py-16 md:py-24 px-4 md:px-8">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-10">
            <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">
              Share your story
            </p>
            <h2 className="font-display text-3xl font-semibold text-gray-900 mb-3">
              Been part of our programs?
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We'd love to hear from you. Submissions are reviewed by our team before appearing on this page.
            </p>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-6 md:p-8">
            {submitResult?.success ? (
              <div className="bg-green-50 p-4 rounded-lg flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-3 flex-shrink-0">
                  <Check size={16} className="text-green-600" />
                </div>
                <p className="text-green-700 text-sm">{submitResult.message}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitResult && !submitResult.success && (
                  <div className="bg-red-50 p-4 rounded-lg flex items-center">
                    <AlertCircle size={16} className="text-red-600 mr-2 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{submitResult.message}</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="t-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="t-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label htmlFor="t-role" className="block text-sm font-medium text-gray-700 mb-1">
                      Role / Organization
                    </label>
                    <input
                      id="t-role"
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="t-quote" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Story <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="t-quote"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    rows="4"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Tell us about your experience..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 disabled:opacity-60 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Submit Testimonial
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

function FeaturedTestimonial({ testimonial: t }) {
  const hasMedia = Boolean(t.gallery_item);

  return (
    <div className="border border-gray-100 rounded-lg overflow-hidden">
      <div className={`flex flex-col ${hasMedia ? 'lg:flex-row' : ''}`}>
        {hasMedia && (
          <div className="w-full lg:w-1/2 h-64 lg:h-auto bg-gray-900">
            {t.gallery_item.media_type === 'image' ? (
              <img
                src={t.gallery_item.media_url}
                alt={t.name}
                className="w-full h-full object-cover"
              />
            ) : t.gallery_item.is_uploaded_video ? (
              <video src={t.gallery_item.media_url} controls className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Film size={32} className="text-white/70" />
              </div>
            )}
          </div>
        )}
        <div className={`p-8 md:p-12 flex flex-col justify-center border-orange-600 ${hasMedia ? 'lg:w-1/2 border-t-4 lg:border-t-0 lg:border-l-4' : 'border-t-4'}`}>
          <Quote size={28} className="text-orange-600 mb-4" />
          {t.quote && (
            <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-6">{t.quote}</p>
          )}
          <div>
            <p className="font-display font-semibold text-gray-900 text-lg">{t.name}</p>
            {t.role && <p className="text-sm text-gray-500">{t.role}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestimonialsPage;
