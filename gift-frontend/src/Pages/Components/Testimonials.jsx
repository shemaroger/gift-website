import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Quote, Film } from 'lucide-react';
import { fetchTestimonials } from '../../publicApi';

const MAX_ON_HOME = 3;

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await fetchTestimonials();
      if (result.success) {
        setTestimonials((Array.isArray(result.data) ? result.data : []).slice(0, MAX_ON_HOME));
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-4">
          <div>
            <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">Voices of impact</p>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-900">
              What our community says
            </h2>
          </div>
          <Link
            to="/Testimonials"
            className="text-orange-600 hover:text-orange-700 font-medium text-sm whitespace-nowrap"
          >
            Read more stories &rarr;
          </Link>
        </div>

        {testimonials.length === 1 ? (
          <FeaturedTestimonial testimonial={testimonials[0]} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white border border-gray-100 rounded-lg overflow-hidden flex flex-col">
                {t.gallery_item && (
                  <div className="w-full h-40 bg-gray-900">
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
                        <Film size={24} className="text-white/70" />
                      </div>
                    )}
                  </div>
                )}
                <div className="p-6 flex-1 flex flex-col border-l-4 border-orange-600">
                  <Quote size={18} className="text-orange-600 mb-3" />
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
  );
}

function FeaturedTestimonial({ testimonial: t }) {
  const hasMedia = Boolean(t.gallery_item);

  return (
    <div className="bg-white border border-gray-100 rounded-lg overflow-hidden">
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
