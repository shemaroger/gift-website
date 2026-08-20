import React from "react";
import { Shield, Eye, Heart, Users, Handshake, Bird, Globe } from 'lucide-react';
import "@fortawesome/fontawesome-free/css/all.min.css";
import Events from "../Pages/Components/Events";
import Blogs from "../Pages/Components/blogs";
import Feature from "../Pages/Components/Feature";
import ScrollToTop from '../Pages/Components/ScrollToTop';
import ImageSlider from '../Pages/Components/ImageSlider';
import Features_info from "../Pages/Components/features_info";
import { Link } from 'react-router-dom';

export default function HomePage() {

  const StatCard = ({ icon: Icon, number, label }) => (
    <div className="p-6 text-center border border-gray-100 rounded-lg">
      <div className="flex justify-center mb-4">
        <div className="w-14 h-14 bg-orange-50 rounded-lg flex items-center justify-center">
          <Icon className="text-orange-600" size={28} />
        </div>
      </div>
      <h3 className="font-display text-3xl font-semibold text-gray-900 mb-1">{number}</h3>
      <p className="text-gray-600 text-sm">{label}</p>
    </div>
  );

  const stats = [
    { icon: Users, number: "459+", label: "People reached through our programs" },
    { icon: Handshake, number: "14+", label: "Active volunteers on the ground" },
    { icon: Bird, number: "647+", label: "Households supported out of poverty" },
    { icon: Globe, number: "1", label: "Country: Rwanda, and growing" }
  ];

  const objectives = [
    "Creating sustainable income opportunities",
    "Building a supportive savings community",
    "Fostering resilience and independence",
    "Advancing gender equality in entrepreneurship",
    "Financial education for long-term growth"
  ];

  const progressData = [
    { label: "Donations", percentage: 75 },
    { label: "Trainings", percentage: 90 }
  ];

  return (
    <div>
      <div className="relative w-full">
        <div className="w-full">
          <ImageSlider />
        </div>

        {/* Hero overlay: bottom-left card instead of a dead-centered block */}
        <div className="absolute inset-0 flex items-end sm:items-center">
          <div className="bg-green-900/85 text-white p-6 sm:p-10 md:p-12 w-full sm:w-[26rem] md:w-[30rem] flex flex-col justify-center gap-4 sm:mb-0 sm:ml-8 md:ml-16">
            <p className="uppercase tracking-widest text-xs font-semibold text-orange-300">Kicukiro, Rwanda</p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
              Fair wages for artisans, real futures for families
            </h1>
            <p className="text-sm sm:text-base text-green-50">
              GIfT trains and funds entrepreneurs in Kanombe Sector so a purchase here turns into savings, a business, and independence back home.
            </p>
            <div className="mt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to="/donate"
                className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors text-center font-medium"
              >
                Donate Now
              </Link>
              <Link
                to="/Aboutus"
                className="bg-transparent text-white px-6 py-3 rounded-lg border border-white/40 hover:border-white transition-colors text-center font-medium"
              >
                Know About Us
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content — ordered so the page tells a story: who we are,
            what we believe, how we work, proof of impact, then how to
            get involved. */}
        <div className="bg-white relative">
          {/* Who we are */}
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
              {/* Images Section */}
              <div className="relative w-full lg:w-5/12">
                <div className="mb-4 lg:absolute lg:top-0 lg:right-0 lg:w-3/4">
                  {/* Source photo has a name-tag graphic baked into the bottom ~15% —
                      cropped out here via a fixed aspect ratio + object-top. */}
                  <div className="aspect-[1080/605] overflow-hidden">
                    <img
                      src="/images/image1.jpg"
                      alt="Hands joined together"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
                <div className="lg:absolute lg:bottom-0 lg:left-0 lg:w-3/4 lg:mt-40">
                  <div className="aspect-[1080/605] overflow-hidden">
                    <img
                      src="/images/image3.jpg"
                      alt="Community member smiling"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                </div>
              </div>

              {/* Content Section */}
              <div className="w-full lg:w-7/12">
                <div className="space-y-6">
                  <div>
                    <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">About Us</p>
                    <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                      Registered, community-owned, and built to last.
                    </h2>
                  </div>

                  <p className="text-gray-600 leading-relaxed">
                    GIfT is a Community Benefit Company registered by the Rwanda Development Board in 2024, based in Kicukiro District's Kanombe Sector. Every trading profit is reinvested into savings groups, entrepreneurship training, and seed funding for the artisans and families we work with.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* What we believe */}
          <section className="py-16 md:py-24 bg-gray-50">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
                {/* Circular photo */}
                <div className="w-full lg:w-5/12 flex justify-center">
                  <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full overflow-hidden border-8 border-white flex-shrink-0">
                    <img
                      src="/images/mission.png"
                      alt="A trainer reviewing materials with participants"
                      className="w-full h-full object-cover object-left"
                    />
                  </div>
                </div>

                {/* Heading + list */}
                <div className="w-full lg:w-7/12">
                  <h2 className="font-display text-3xl md:text-5xl font-semibold text-gray-900 mb-3">
                    Our Mission &amp; Vision
                  </h2>
                  <div className="w-16 h-1 bg-orange-600 mb-10" />

                  <div className="space-y-8">
                    <div id="mission" className="scroll-mt-28 flex items-start gap-4">
                      <span className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5 text-orange-600" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">Mission</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Lift people out of poverty through training on savings and loans, entrepreneurship, gender equality, and direct provision of seed money.
                        </p>
                      </div>
                    </div>

                    <div id="vision" className="scroll-mt-28 flex items-start gap-4">
                      <span className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center flex-shrink-0">
                        <Eye className="w-5 h-5 text-green-600" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">Vision</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Sustainable socio-economic development, ensuring that even the most underprivileged members of our community have access to opportunities that foster better health, resilience, and independence.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <span className="w-12 h-12 rounded-full bg-orange-50 border border-orange-100 flex items-center justify-center flex-shrink-0">
                        <Heart className="w-5 h-5 text-orange-600" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-semibold text-gray-900 mb-1">Values</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          Transparency and community ownership guide every decision — trading profits are reinvested locally, not extracted.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* How we work */}
          <Features_info />

          {/* Four pillars — full summary graphic */}
          <section className="container mx-auto px-4 pb-4 md:pb-6">
            <div className="max-w-2xl mx-auto text-center mb-8">
              <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">At a glance</p>
              <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900">
                The four pillars, summarized
              </h2>
            </div>
            <img
              src="/images/pramid.png"
              alt="Four pillars of the GIfT program: Community Savings Groups, Comprehensive Training Programs, Seed Money for Growth, and Weekly Volunteer Support, with key activities and outcomes for each"
              className="w-full max-w-3xl mx-auto"
            />
          </section>

          {/* Proof of impact */}
          <section className="container mx-auto px-4 pt-8 md:pt-12 pb-16 md:pb-24">
            <div className="mb-16">
              <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">By the numbers</p>
              <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-900 mb-8 max-w-xl">
                Progress we can point to, not just promise
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                  <StatCard key={index} {...stat} />
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-80 md:h-96 rounded-lg overflow-hidden">
                <img
                  src="images/image2.jpg"
                  alt="Donation banner"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/55 flex flex-col items-center justify-center text-center px-4">
                  <h2 className="font-display text-2xl md:text-4xl font-semibold text-white mb-6 max-w-2xl">
                    A RWF 10,000 gift covers a full week of business training for one entrepreneur
                  </h2>
                  <Link to="/donate" className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors font-medium">
                    Donate
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Where the money goes */}
          <div className="bg-gray-50 py-16 md:py-24">
            <div className="container mx-auto px-4">
              <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="w-full lg:w-1/2">
                  <h3 className="font-display text-2xl lg:text-3xl font-semibold text-gray-900 mb-6 leading-tight">
                    Where the progress actually goes
                  </h3>
                  <div className="space-y-4">
                    {progressData.map((item, index) => (
                      <div key={index}>
                        <div className="flex justify-between mb-2 text-sm">
                          <span className="font-medium text-gray-700">{item.label}</span>
                          <span className="text-orange-600 font-semibold">{item.percentage}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div
                            className="h-full bg-orange-600 rounded-full transition-all duration-500"
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="w-full lg:w-1/2 relative">
                  <div className="p-4 w-full sm:w-[90%] md:w-[85%] lg:w-[80%] rounded-lg bg-white ml-auto">
                    <img
                      src="/images/image4.jpg"
                      alt="People working together"
                      className="w-full h-48 sm:h-56 md:h-72 lg:h-80 xl:h-96 rounded-lg object-cover"
                    />
                  </div>
                  <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md absolute -bottom-4 sm:-bottom-6 md:-bottom-8 right-0 sm:right-2 md:right-4 lg:right-8 w-[90%] sm:w-auto max-w-xs sm:max-w-sm">
                    <ul className="space-y-2 sm:space-y-3">
                      {objectives.map((objective, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0"></span>
                          <span className="text-xs sm:text-sm text-gray-700">{objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Get involved: upcoming + recent events grouped together */}
          <Events />
          <Feature />

          {/* Read more */}
          <Blogs />

          <ScrollToTop />
        </div>
      </div>
    </div >
  );
}
