import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { createDonation } from '../../publicApi';

const DONATION_TYPES = [
  { value: 'one_time', label: 'One-time Donation' },
  { value: 'monthly', label: 'Monthly Donation' },
  { value: 'yearly', label: 'Yearly Donation' },
  { value: 'project_based', label: 'Project-based Donation' },
  { value: 'general', label: 'General Support' },
];

const PREDEFINED_AMOUNTS = ['Under $100', '$100-250', '$250-500', '$500-1000', '$1000+'];

const DonationForm = () => {
  const [donationType, setDonationType] = useState('one_time');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    organization: '',
    estimatedAmount: '',
    message: '',
    preferredContactMethod: 'email',
    bestContactTime: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const donationData = {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        organization: formData.organization,
        donation_type: donationType,
        estimated_amount: formData.estimatedAmount,
        message: formData.message,
        preferred_contact_method: formData.preferredContactMethod,
        best_contact_time: formData.bestContactTime,
      };

      await createDonation(donationData);

      toast.success("Thank you for your interest! We'll be in touch soon.");
      setSubmitted(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        organization: '',
        estimatedAmount: '',
        message: '',
        preferredContactMethod: 'email',
        bestContactTime: '',
      });
      setDonationType('one_time');
    } catch (error) {
      console.error('Error submitting donation interest:', error);
      toast.error('Failed to submit donation interest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full bg-white border border-gray-100 rounded-lg p-8 sm:p-10 text-center">
        <h3 className="font-display text-2xl font-semibold text-gray-900 mb-2">Thank you</h3>
        <p className="text-gray-600 mb-6">
          We've received your donation interest and will reach out using the contact details you provided.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-orange-600 font-medium hover:text-orange-700 transition-colors"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-white border border-gray-100 rounded-lg p-6 sm:p-10"
      noValidate
    >
      <div className="space-y-8">
        {/* Donation Type Selection */}
        <div>
          <label className="block font-semibold text-gray-900 mb-3">Select Donation Type</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DONATION_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setDonationType(type.value)}
                aria-pressed={donationType === type.value}
                className={`p-3 rounded-lg border text-sm text-left transition-colors ${
                  donationType === type.value
                    ? 'border-green-600 bg-orange-50 text-green-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-green-200'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            id="fullName"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              required
            />
          </div>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="+1234567890"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-1">
            Organization (Optional)
          </label>
          <input
            id="organization"
            type="text"
            name="organization"
            value={formData.organization}
            onChange={handleInputChange}
            placeholder="Company or organization name"
            className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Estimated Amount Selection */}
        <div>
          <label className="block font-semibold text-gray-900 mb-3">Estimated Amount Range</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            {PREDEFINED_AMOUNTS.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, estimatedAmount: amount }))}
                aria-pressed={formData.estimatedAmount === amount}
                className={`p-3 rounded-lg border text-sm transition-colors ${
                  formData.estimatedAmount === amount
                    ? 'border-green-600 bg-orange-50 text-green-700 font-medium'
                    : 'border-gray-200 text-gray-700 hover:border-green-200'
                }`}
              >
                {amount}
              </button>
            ))}
          </div>
          <input
            type="text"
            name="estimatedAmount"
            placeholder="Or specify your own range/amount"
            value={formData.estimatedAmount}
            onChange={handleInputChange}
            className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            placeholder="Tell us about your interest in supporting our cause"
            className="w-full p-3 border border-gray-200 rounded-lg h-28 resize-vertical focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            required
          />
        </div>

        {/* Contact Preferences */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="preferredContactMethod" className="block text-sm font-medium text-gray-700 mb-1">
              Preferred Contact Method
            </label>
            <select
              id="preferredContactMethod"
              name="preferredContactMethod"
              value={formData.preferredContactMethod}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="both">Both</option>
            </select>
          </div>
          <div>
            <label htmlFor="bestContactTime" className="block text-sm font-medium text-gray-700 mb-1">
              Best Time to Contact
            </label>
            <input
              id="bestContactTime"
              type="text"
              name="bestContactTime"
              value={formData.bestContactTime}
              onChange={handleInputChange}
              placeholder="e.g., Weekday mornings"
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3.5 rounded-lg font-semibold transition-colors ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default DonationForm;
