import React, { useState } from 'react';
import { Facebook, Twitter, Linkedin, Mail, Phone, MapPin, MessageCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { createContact } from '../publicApi';

const Contactus = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subjectType: 'general',
    subject: '',
    message: ''
  });

  const subjectChoices = [
    { value: 'general', label: 'General Inquiry' },
    { value: 'support', label: 'Support' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'complaint', label: 'Complaint' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare data for API (match Django model field names)
      const contactData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject_type: formData.subjectType,
        subject: formData.subject,
        message: formData.message
      };

      const response = await createContact(contactData);

      toast.success('Thank you for your message! We\'ll get back to you soon.');

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subjectType: 'general',
        subject: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-100 mt-28 md:mt-32">
      {/* Hero Section */}
      <div className="bg-gray-200 py-8 md:py-10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 bg-orange-500/15 border border-orange-500/30 rounded-full text-orange-700 text-xs font-semibold uppercase tracking-wide mb-4">
            <MessageCircle className="w-3.5 h-3.5" />
            Contact Us
          </span>
          <h1 className="font-display text-2xl md:text-4xl font-semibold text-gray-900 leading-tight mb-2">
            Questions, partnerships, or just want to say hello?
          </h1>
          <p className="text-gray-600 text-sm md:text-base leading-relaxed">
            Reach us directly or drop a message below — we read every one.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 max-w-2xl mx-auto">
            <div className="border border-gray-300 bg-white rounded-lg p-4">
              <Phone className="w-5 h-5 text-orange-600 mb-2 mx-auto" />
              <div className="text-sm font-semibold text-gray-900">Call Us</div>
              <div className="text-xs text-gray-500">Quick response</div>
            </div>
            <div className="border border-gray-300 bg-white rounded-lg p-4">
              <Mail className="w-5 h-5 text-green-600 mb-2 mx-auto" />
              <div className="text-sm font-semibold text-gray-900">Email Us</div>
              <div className="text-xs text-gray-500">Detailed discussion</div>
            </div>
            <div className="border border-gray-300 bg-white rounded-lg p-4">
              <MapPin className="w-5 h-5 text-orange-600 mb-2 mx-auto" />
              <div className="text-sm font-semibold text-gray-900">Visit Us</div>
              <div className="text-xs text-gray-500">In-person meeting</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Contact Content */}
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column */}
            <div className="bg-gray-50 p-8 rounded-lg">
              <p className="uppercase tracking-wider mb-4 text-orange-600 font-semibold text-sm">Contact Information</p>
              <h2 className="font-display text-3xl font-semibold mb-6 text-gray-900">We'd love to hear from you</h2>
              <p className="text-gray-600 mb-8">
                Have a question or want to get involved? Reach us through the form or the details below.
              </p>

              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <Phone className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Let's talk!</h3>
                  </div>
                  <p className="text-gray-600 text-sm">+250 781 546 413</p>
                  <p className="text-gray-600 text-sm">haricbuz@gmail.com</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-green-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Head office</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Kgl 123k, Kigali,</p>
                  <p className="text-gray-600 text-sm">Rwanda</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <div className="flex items-center gap-3 mb-2">
                    <MapPin className="w-5 h-5 text-orange-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Branch Office</h3>
                  </div>
                  <p className="text-gray-600 text-sm">Kimihurura, Kabuye, Kanombe</p>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Follow us</h3>
                  <div className="flex gap-3">
                    <a href="#" className="p-2.5 bg-gray-100 hover:bg-orange-100 rounded-full transition-colors">
                      <Facebook className="w-4 h-4 text-gray-700" />
                    </a>
                    <a href="#" className="p-2.5 bg-gray-100 hover:bg-orange-100 rounded-full transition-colors">
                      <Twitter className="w-4 h-4 text-gray-700" />
                    </a>
                    <a href="#" className="p-2.5 bg-gray-100 hover:bg-orange-100 rounded-full transition-colors">
                      <Linkedin className="w-4 h-4 text-gray-700" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="bg-white p-8 rounded-lg border border-gray-100">
              <h2 className="font-display text-2xl font-semibold text-gray-900 mb-8">Send Me A Message</h2>
              <div className="space-y-6">
                {/* Name Field */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Full Name"
                    className="w-full p-4 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full p-4 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1234567890"
                      className="w-full p-4 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Subject Type */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Subject Type</label>
                  <select
                    name="subjectType"
                    value={formData.subjectType}
                    onChange={handleInputChange}
                    className="w-full p-4 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                  >
                    {subjectChoices.map((choice) => (
                      <option key={choice.value} value={choice.value}>
                        {choice.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What is this about?"
                    className="w-full p-4 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none"
                    required
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Type Your Message Here..."
                    rows={6}
                    className="w-full p-4 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all outline-none resize-vertical"
                    required
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full px-8 py-4 rounded-lg font-semibold transition-colors ${isSubmitting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700'
                    }`}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-semibold text-gray-900 mb-4">Find Us</h2>
            <p className="text-gray-600">Visit our office for an in-person consultation</p>
          </div>
          <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5!2d30.1!3d-1.9!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMcKwNTQnMDAuMCJTIDMwwrAwNicwMC4wIkU!5e0!3m2!1sen!2s!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      {/* Toast Container */}
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

export default Contactus;