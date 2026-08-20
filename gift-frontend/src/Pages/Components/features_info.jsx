import React from 'react';
import { Target, BarChart2 } from 'lucide-react';

export default function FeatureShowcasePage() {
    const features = [
        {
            icon: "photos/saving.jpg",
            label: "Saving Groups",
            title: "Community Savings Groups",
            description: "Each group consists of 15-30 members identified from the community's poorest citizens with similar economic status. These groups are aimed at improving economic conditions through collective saving and loan business activities.",
            benefits: [
                "Meet regularly",
                "Save together",
                "Give loans to members",
                "Support each other"
            ],
            outcomes: [
                "Improved income",
                "Better money management",
                "Stronger community",
                "Reduced poverty"
            ],
            color: "green",
            id: "saving-groups"
        },
        {
            icon: "photos/tratining.jpg",
            label: "Training",
            title: "Comprehensive Training Programs",
            description: "We provide three essential training modules: VSLA (Village Saving Loan Association) methodology, Entrepreneurship development, and GALS (Gender Action Learning System) to build capacity and empower community members.",
            benefits: [
                "VSLA training",
                "Business & entrepreneurship",
                "GALS (gender equality)",
                "Financial management",
                "Better farming practices"
            ],
            outcomes: [
                "Better group management",
                "More successful businesses",
                "Empowered women",
                "Stronger leaders",
                "Better crop yields"
            ],
            color: "blue",
            id: "training"
        },
        {
            icon: "photos/seedmoney.png",
            label: "Financial Empowerment",
            title: "Seed Money for Growth",
            description: "We provide saving groups with seed money that helps them access loans easily while their savings are still low. This initial capital injection accelerates their financial growth and business development opportunities.",
            benefits: [
                "Provide seed money",
                "Easy access to loans",
                "Build group capital",
                "Support early growth"
            ],
            outcomes: [
                "Faster capital growth",
                "More business investment",
                "Linkages to bigger loans",
                "Financial independence"
            ],
            color: "orange",
            id: "financial-empowerment",
            iconAsset: true
        },
        {
            icon: "photos/support.webp",
            label: "Support",
            title: "Weekly Volunteer Support",
            description: "Our dedicated volunteers provide weekly follow-up support to every saving group, focusing on conflict resolution, monitoring progress, and comprehensive reporting to ensure group success and sustainability.",
            benefits: [
                "Weekly visits",
                "Solve problems",
                "Monitor progress",
                "Share reports"
            ],
            outcomes: [
                "Fewer conflicts",
                "Higher participation",
                "Better performance",
                "Sustainable success"
            ],
            color: "purple",
            id: "support",
            iconAsset: true
        }
    ];

    const ACCENT = {
        green: { solid: "bg-green-600", border: "border-green-600", text: "text-green-600", dot: "bg-green-600" },
        blue: { solid: "bg-blue-600", border: "border-blue-600", text: "text-blue-600", dot: "bg-blue-600" },
        orange: { solid: "bg-orange-600", border: "border-orange-600", text: "text-orange-600", dot: "bg-orange-600" },
        purple: { solid: "bg-purple-600", border: "border-purple-600", text: "text-purple-600", dot: "bg-purple-600" },
    };

    return (
        <div className="bg-white">
            {/* Intro */}
            <div className="container mx-auto px-4 pt-16 pb-8 md:pt-24 md:pb-12">
                <div className="max-w-2xl">
                    <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-3">How the model works</p>
                    <h1 className="font-display text-3xl md:text-5xl font-semibold text-gray-900 leading-tight mb-4">
                        Four pillars, one path out of poverty
                    </h1>
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                        A savings group is formed, trained, seeded with starting capital, and followed up on weekly — every pillar below feeds the next.
                    </p>
                </div>
            </div>

            {/* Feature Sections */}
            <div className="container mx-auto px-4 pb-16 md:pb-24">
                <div className="space-y-16 md:space-y-24">
                    {features.map((feature, index) => {
                        const accent = ACCENT[feature.color];
                        return (
                            <div key={feature.id} id={feature.id} className="scroll-mt-8">
                                <div className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-start gap-8 md:gap-12`}>
                                    {/* Content Side */}
                                    <div className="flex-1 space-y-6 w-full">
                                        <div className="flex items-center gap-4">
                                            <span className={`text-xs font-semibold uppercase tracking-wide ${accent.text}`}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>
                                            <div className={`h-px flex-1 ${accent.border} border-t opacity-30`}></div>
                                        </div>

                                        <h2 className="font-display text-2xl md:text-3xl font-semibold text-gray-900">
                                            {feature.title}
                                        </h2>

                                        <p className="text-base text-gray-600 leading-relaxed">
                                            {feature.description}
                                        </p>

                                        <div className="border border-gray-100 rounded-lg p-5">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <Target className={`w-4 h-4 ${accent.text}`} />
                                                Key Components
                                            </h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {feature.benefits.map((benefit, i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${accent.dot} mt-2 flex-shrink-0`}></div>
                                                        <span className="text-sm text-gray-700">{benefit}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="border border-gray-100 rounded-lg p-5">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                <BarChart2 className={`w-4 h-4 ${accent.text}`} />
                                                Expected Outcomes
                                            </h3>
                                            <div className="grid grid-cols-1 gap-2">
                                                {feature.outcomes.map((outcome, i) => (
                                                    <div key={i} className="flex items-start gap-3">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${accent.dot} mt-2 flex-shrink-0`}></div>
                                                        <span className="text-sm text-gray-700">{outcome}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual Side */}
                                    <div className="flex-1 w-full lg:sticky lg:top-24">
                                        {feature.iconAsset ? (
                                            <div className="w-full aspect-[4/3] rounded-lg bg-white border border-gray-100 flex items-center justify-center p-4">
                                                <img
                                                    src={feature.icon}
                                                    alt={feature.label}
                                                    className="max-w-full max-h-full object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-full aspect-[4/3] rounded-lg overflow-hidden relative">
                                                <img
                                                    src={feature.icon}
                                                    alt={feature.label}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-x-0 bottom-0 h-24 bg-black/50"></div>
                                                <div className="absolute bottom-4 left-4 right-4 text-white">
                                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-2 ${accent.solid}`}>
                                                        Pillar {index + 1}
                                                    </span>
                                                    <h3 className="font-display text-xl md:text-2xl font-semibold">
                                                        {feature.label}
                                                    </h3>
                                                </div>
                                            </div>
                                        )}
                                        {feature.iconAsset && (
                                            <div className="mt-3 flex items-center gap-2">
                                                <span className={`inline-block px-2 py-1 rounded text-xs font-semibold text-white ${accent.solid}`}>
                                                    Pillar {index + 1}
                                                </span>
                                                <h3 className="font-display text-lg font-semibold text-gray-900">
                                                    {feature.label}
                                                </h3>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
