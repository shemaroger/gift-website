import React from 'react';
import { Shield, Eye } from 'lucide-react';

const Aboutus = () => {

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
        <div className="mt-28 md:mt-32">
            <div className="bg-green-900 py-16 md:py-20">
                <div className="container mx-auto px-4">
                    <p className="text-orange-300 font-semibold text-sm uppercase tracking-wide mb-3 text-center">Who we are</p>
                    <h1 className="font-display text-3xl md:text-5xl font-semibold text-white text-center mb-4">About GIfT</h1>
                    <p className="text-green-50 text-center max-w-2xl mx-auto">
                        A Kicukiro-based Community Benefit Company turning fair trade sales into savings, training, and seed capital for local entrepreneurs.
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 md:py-24" id="aboutus">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    <div className="relative w-full lg:w-5/12">
                        <div className="bg-orange-50 p-4 rounded-lg mb-4 lg:absolute lg:top-0 lg:right-0 lg:w-3/4">
                            <img
                                src="/images/image2.avif"
                                alt="Hands joined together"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                        <div className="bg-orange-50 p-4 rounded-lg lg:absolute lg:bottom-0 lg:left-0 lg:w-3/4 lg:mt-40">
                            <img
                                src="/images/images.webp"
                                alt="Community member smiling"
                                className="w-full h-auto rounded-lg"
                            />
                        </div>
                    </div>
                    <div className="w-full lg:w-7/12">
                        <div className="space-y-6">
                            <div>
                                <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">How we started</p>
                                <h2 className="font-display text-3xl md:text-4xl font-semibold text-gray-900 mb-6">
                                    Registered, community-owned, and built to last.
                                </h2>
                            </div>

                            <p className="text-gray-600 leading-relaxed">
                                GIfT is a Community Benefit Company registered by the Rwanda Development Board in 2024, based in Kicukiro District's Kanombe Sector. It exists to trade fairly and reinvest the proceeds directly into the community it sources from.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Rather than operate as a traditional charity, GIfT runs as a business first — every sale funds the savings groups, training, and seed capital that make our programs self-sustaining.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                        <div className="w-full lg:w-1/2">
                            <h2 className="font-display text-3xl lg:text-4xl font-semibold text-gray-900 mb-6 leading-tight">
                                Two questions guide every program we run
                            </h2>

                            <div className="space-y-4 mb-8">
                                <div className="bg-white border-l-4 border-orange-600 p-6 rounded-r-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Shield className="text-orange-600" size={22} />
                                        <span className="font-semibold text-gray-900">Our Mission</span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Lift people out of poverty through training on savings and loans, entrepreneurship, gender equality, and direct provision of seed money.
                                    </p>
                                </div>

                                <div className="bg-white border-l-4 border-green-600 p-6 rounded-r-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Eye className="text-green-600" size={22} />
                                        <span className="font-semibold text-gray-900">Our Vision</span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Sustainable socio-economic development that reaches even the most underprivileged members of our community.
                                    </p>
                                </div>
                            </div>

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
                            <div className="bg-white p-4 w-[85%] rounded-lg">
                                <img
                                    src="/images/event2.webp"
                                    alt="People working together"
                                    className="w-full h-72 md:h-96 rounded-lg object-cover"
                                />
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-md absolute -bottom-8 -right-0 max-w-xs">
                                <ul className="space-y-3">
                                    {objectives.map((objective, index) => (
                                        <li key={index} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-orange-600 rounded-full flex-shrink-0"></span>
                                            <span className="text-sm text-gray-700">{objective}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Aboutus;
