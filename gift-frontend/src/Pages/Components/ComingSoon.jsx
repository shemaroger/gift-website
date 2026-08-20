import React, { useState, useEffect } from 'react';

const ComingSoon = () => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    // Set launch date (30 days from now)
    const launchDate = new Date();
    launchDate.setDate(launchDate.getDate() + 30);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = launchDate.getTime() - now;

            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft({ days, hours, minutes, seconds });

            if (distance < 0) {
                clearInterval(timer);
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [launchDate]);

    const handleEmailSubmit = () => {
        if (email) {
            setIsSubscribed(true);
            setEmail('');
            setTimeout(() => setIsSubscribed(false), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="max-w-4xl w-full relative z-10">
                {/* Main Container */}
                <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 text-center border border-white/20 shadow-2xl">
                    {/* Logo Section */}
                    <div className="mb-8">
                        <div className="w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden shadow-2xl border-4 border-white/30 transform hover:scale-105 transition-transform duration-300">
                            <img
                                src="/images/gift.jpg"
                                alt="Ganza-Inema Logo"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="mb-8">
                        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                            Ganza-Inema
                        </h1>
                        <h2 className="text-2xl md:text-3xl font-light text-white/90 mb-4">
                            Fair Trade
                        </h2>
                        <div className="w-24 h-1 bg-orange-400 mx-auto rounded-full"></div>
                    </div>

                    {/* Coming Soon Message */}
                    <div className="mb-12">
                        <p className="text-xl md:text-2xl text-white/90 mb-4 font-medium">
                            Something Amazing is Coming Soon
                        </p>
                        <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
                            We're crafting a beautiful experience that will connect communities through fair trade practices.
                            Get ready for a platform that makes a difference.
                        </p>
                    </div>

                    {/* Email Signup */}
                    <div className="max-w-md mx-auto mb-8">
                        <p className="text-white/80 mb-4 text-lg">Be the first to know when we launch!</p>

                        <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 text-green-200">
                            <p className="font-medium">Thank you! We'll notify you when we launch.</p>
                        </div>

                    </div>


                </div>

                {/* Bottom Text */}
                <div className="text-center mt-8">
                    <p className="text-white/60 text-sm">
                        © 2024 Ganza-Inema Fair Trade. Connecting communities through ethical trade.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;