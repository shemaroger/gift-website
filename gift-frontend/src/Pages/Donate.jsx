import React from 'react';
import { CreditCard, Landmark, Repeat, Users, BookOpen, LifeBuoy, GraduationCap } from 'lucide-react';
import DonationForm from '../Pages/Donate/AddDonate';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const WAYS_TO_GIVE = [
  {
    icon: CreditCard,
    title: 'Online Donation',
    description: 'Give a one-time gift by card or mobile money — it goes straight into the current savings-group cycle.',
  },
  {
    icon: Landmark,
    title: 'Bank Transfer',
    description: 'Prefer a direct transfer? Contact us for GIfT\'s bank details and we\'ll send a receipt on confirmation.',
  },
  {
    icon: Repeat,
    title: 'Monthly Giving',
    description: 'A recurring gift lets us plan training cohorts ahead of time instead of reacting cycle to cycle.',
  },
];

const HOW_USED = [
  { icon: Users, title: 'Savings Groups Formation', description: 'Helping communities establish and grow collaborative savings groups.' },
  { icon: BookOpen, title: 'Workshops & Seminars', description: 'Providing access to knowledge and tools for entrepreneurship and financial security.' },
  { icon: LifeBuoy, title: 'Emergency Support', description: 'Assisting families in times of crisis to regain stability.' },
  { icon: GraduationCap, title: 'Financial Literacy Training', description: 'Equipping individuals with essential money management skills.' },
];

const DonationPage = () => {
  return (
    <div className="min-h-screen mt-28 md:mt-32 bg-white">
      {/* Hero Section */}
      <section className="bg-orange-600 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="text-sm uppercase font-semibold tracking-wide mb-4 text-orange-100">Donate</div>
            <h1 className="font-display text-3xl md:text-5xl font-semibold mb-4 text-white leading-tight">
              Your gift becomes someone's starting capital
            </h1>
            <p className="text-orange-50 mb-8">
              Every donation funds a savings group's training, seed money, or emergency
              support — 100% goes back into the communities we work with.
            </p>
            <a
              href="#donation-form"
              className="inline-block bg-white text-orange-600 hover:bg-orange-50 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Donate now
            </a>
          </div>
          <div className="relative">
            <img
              src="/images/donate2.jpg"
              alt="Donation box"
              className="rounded-lg h-[50vh] w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Ways to Make a Difference Section */}
      <section className="py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">Get involved</p>
          <h2 className="font-display text-3xl font-semibold text-gray-900 mb-12">Ways You Can Give</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {WAYS_TO_GIVE.map(({ icon: Icon, title, description }) => (
              <div key={title} className="border border-gray-100 p-6 rounded-lg">
                <Icon className="w-6 h-6 text-orange-600 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Donations Are Used Section */}
      <section className="bg-gray-50 py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-green-600 font-semibold text-sm uppercase tracking-wide mb-2">Transparency</p>
          <h2 className="font-display text-3xl font-semibold text-gray-900 mb-12">How Your Donations Are Used</h2>
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
            {HOW_USED.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <Icon className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Donation Interest Form */}
      <section id="donation-form" className="scroll-mt-28 py-16 md:py-24 px-4 md:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-orange-600 font-semibold text-sm uppercase tracking-wide mb-2">Get started</p>
            <h2 className="font-display text-3xl font-semibold text-gray-900 mb-3">Donation Interest Form</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Tell us a bit about what you'd like to support, and our team will follow up with next steps and payment details.
            </p>
          </div>
          <DonationForm />
        </div>
      </section>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="light"
        toastStyle={{
          backgroundColor: '#ffffff',
          color: '#333333',
          borderRadius: '8px',
          border: '1px solid #ddd',
          padding: '16px',
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
          maxWidth: '700px',
          minWidth: '200px',
          fontSize: '16px',
        }}
      />
    </div>
  );
};

export default DonationPage;