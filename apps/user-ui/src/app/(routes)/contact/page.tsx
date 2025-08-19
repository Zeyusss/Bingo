"use client";
import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import { toast } from 'react-hot-toast';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageCircle, 
  Users, 
  Headphones,
  CheckCircle
} from 'lucide-react';
import { FaFacebookF, FaLinkedinIn, FaInstagram, FaTwitter } from 'react-icons/fa';
import Footer from "../../../shared/components/homepage/Footer";

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  inquiryType: string;
}

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    inquiryType: 'general'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Initialize EmailJS with your public key
      emailjs.init('zaxpFVC-_4KzVZYw9');
      
      // Email to admin (you)
      const adminEmailParams = {
        from_name: formData.name,
        from_email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        inquiry_type: formData.inquiryType,
        to_email: 'dght839@gmail.com'
      };

      // Send email to admin
      const adminResult = await emailjs.send(
        'service_v6o3ffk',
        'template_dr5rtwt',
        adminEmailParams
      );
      
      console.log('Admin email sent successfully:', adminResult);

      // Send confirmation email to user
      const userResult = await emailjs.send(
        'service_v6o3ffk',
        'template_hfzeanw',
        {
          to_name: formData.name,
          message: formData.message,
          to_email: formData.email
        }
      );
      
      console.log('User email sent successfully:', userResult);

      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Show success toast
      toast.success('Message sent successfully! We\'ll get back to you within 24 hours.');
      
      // Reset form after 5 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: '',
          inquiryType: 'general'
        });
      }, 5000);
      
    } catch (error) {
      console.error('Email sending failed:', error);
      setIsSubmitting(false);
      
      // Show error toast with more details
      if (error && typeof error === 'object' && 'text' in error) {
        toast.error(`Failed to send message: ${error.text}`);
      } else {
        toast.error('Failed to send message. Please check your internet connection and try again.');
      }
    }
  };

  const contactInfo = [
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Phone Support",
      details: "(686) 492-1044",
      subtext: "Mon-Fri 9AM-6PM EST",
      color: "bg-blue-50 text-blue-600"
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Email Support",
      details: "support@bingo-awaken.com",
      subtext: "We reply within 24 hours",
      color: "bg-green-50 text-green-600"
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Office Location",
      details: "123 Handmade Street",
      subtext: "Cairo, Egypt 12345",
      color: "bg-orange-50 text-orange-600"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Business Hours",
      details: "Mon-Fri: 9AM-6PM",
      subtext: "Sat-Sun: 10AM-4PM",
      color: "bg-purple-50 text-purple-600"
    }
  ];

  const expertServices = [
    {
      icon: <MessageCircle className="w-8 h-8" />,
      title: "Product Consultation",
      description: "Get personalized recommendations from our handmade experts",
      color: "bg-blue-500"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Seller Support",
      description: "Connect with our team to start your handmade business journey",
      color: "bg-green-500"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "Technical Support",
      description: "Get help with orders, payments, and platform navigation",
      color: "bg-orange-500"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative">
        <div className="bg-[url('/assets/w-our-team-top-opt.jpg')] bg-cover bg-center w-full h-96 rounded-lg shadow-lg mb-8 relative">
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <div className="text-center text-white px-4">
              <h1 className="text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-lg mb-6">Get in touch with our expert team</p>
              <nav className="text-sm">
                <span className="hover:underline opacity-80">Home</span>
                <span className="mx-2 opacity-60">/</span>
                <span className="font-medium">Contact Us</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="text-gray-500 font-semibold mb-4">GET IN TOUCH</p>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            We're Here to <span className="text-red-500">H</span>elp
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about our handmade products or need assistance? Our expert team is ready to help you find exactly what you're looking for.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactInfo.map((info, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow">
              <div className={`w-16 h-16 ${info.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {info.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
              <p className="text-gray-700 font-medium mb-1">{info.details}</p>
              <p className="text-gray-500 text-sm">{info.subtext}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Expert Services Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-gray-500 font-semibold mb-4">EXPERT ASSISTANCE</p>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Connect with an <span className="text-red-500">E</span>xpert
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Our specialized team members are ready to provide personalized assistance for all your handmade needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {expertServices.map((service, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                <div className={`w-16 h-16 ${service.color} text-white rounded-full flex items-center justify-center mx-auto mb-4`}>
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{service.title}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
            
            {isSubmitted ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-gray-900 mb-2">Message Sent Successfully!</h4>
                <p className="text-gray-600">Thank you for contacting us. We'll get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Inquiry Type</label>
                    <select
                      name="inquiryType"
                      value={formData.inquiryType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      <option value="general">General Inquiry</option>
                      <option value="product">Product Question</option>
                      <option value="seller">Become a Seller</option>
                      <option value="technical">Technical Support</option>
                      <option value="partnership">Partnership</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject *</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Brief description of your inquiry"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Please provide details about your inquiry..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-orange-500 text-white py-3 px-6 rounded-lg hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Map & Additional Info */}
          <div className="space-y-8">
            {/* Map Placeholder */}
            <div className="bg-gray-200 rounded-lg h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Interactive Map</p>
                <p className="text-sm text-gray-500">123 Handmade Street, Cairo, Egypt</p>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h4>
              <div className="space-y-4">
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">How quickly do you respond to inquiries?</h5>
                  <p className="text-gray-600 text-sm">We typically respond within 24 hours during business days.</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Can I speak with a product expert?</h5>
                  <p className="text-gray-600 text-sm">Yes! Our experts are available for consultations during business hours.</p>
                </div>
                <div>
                  <h5 className="font-medium text-gray-900 mb-1">Do you offer seller onboarding support?</h5>
                  <p className="text-gray-600 text-sm">Absolutely! We provide comprehensive support for new sellers.</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h4 className="text-xl font-semibold text-gray-900 mb-4">Follow Us</h4>
              <p className="text-gray-600 mb-4">Stay connected for updates, tips, and handmade inspiration.</p>
              <div className="flex gap-3">
                <a
                  href="https://www.facebook.com/bingo-awaken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors"
                  aria-label="Facebook"
                >
                  <FaFacebookF size={18} />
                </a>
                <a
                  href="https://www.linkedin.com/company/bingo-awaken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-blue-700 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedinIn size={18} />
                </a>
                <a
                  href="https://www.instagram.com/bingo-awaken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-pink-600 text-white rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram size={18} />
                </a>
                <a
                  href="https://twitter.com/bingo-awaken"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter size={18} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your <span className="text-red-500">H</span>andmade Journey?
          </h2>
          <p className="text-gray-300 mb-8 text-lg">
            Join thousands of satisfied customers and discover unique, handcrafted products from talented artisans worldwide.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-orange-500 text-white px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors">
              Browse Products
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-gray-900 transition-colors">
              Become a Seller
            </button>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
};

export default ContactPage;
