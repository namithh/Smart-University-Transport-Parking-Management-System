import React, { useState, useEffect } from "react";
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock, FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaHeadset, FaBus, FaParking } from "react-icons/fa";

const ContactUs = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex items-center justify-center p-4">
      <div className={`max-w-6xl w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        
        {/* Header Section */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 py-10 px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Contact Smart Campus Transport
          </h1>
          <p className="text-green-100 text-lg max-w-2xl mx-auto">
            Get in touch for university transport and parking services. We ensure safe, efficient, and seamless campus mobility.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
          
          {/* Left Column */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Campus Contact Information
            </h2>
            
            <div className="space-y-6">

              {/* Location */}
              <div className="bg-white p-6 rounded-xl shadow-md flex items-start hover:-translate-y-1 hover:shadow-lg transition">
                <div className="bg-green-100 p-4 rounded-lg mr-5 text-green-600">
                  <FaMapMarkerAlt className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                    Campus Location
                  </h3>
                  <p className="text-gray-600">
                    University Campus, Main Road, Sri Lanka
                  </p>
                </div>
              </div>

              {/* Transport Support */}
              <div className="bg-white p-6 rounded-xl shadow-md flex items-start hover:-translate-y-1 hover:shadow-lg transition">
                <div className="bg-green-100 p-4 rounded-lg mr-5 text-green-600">
                  <FaBus className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                    Transport Support
                  </h3>
                  <p className="text-gray-600">+94 77 123 4567</p>
                  <p className="text-gray-600 mt-1">transport@utpms.lk</p>
                </div>
              </div>

              {/* Parking Support */}
              <div className="bg-white p-6 rounded-xl shadow-md flex items-start hover:-translate-y-1 hover:shadow-lg transition">
                <div className="bg-green-100 p-4 rounded-lg mr-5 text-green-600">
                  <FaParking className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                    Parking Support
                  </h3>
                  <p className="text-gray-600">+94 11 234 5678</p>
                  <p className="text-gray-600 mt-1">parking@utpms.lk</p>
                </div>
              </div>

              {/* General Email */}
              <div className="bg-white p-6 rounded-xl shadow-md flex items-start hover:-translate-y-1 hover:shadow-lg transition">
                <div className="bg-green-100 p-4 rounded-lg mr-5 text-green-600">
                  <FaEnvelope className="text-xl" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-1">
                    General Inquiries
                  </h3>
                  <p className="text-gray-600">info@utpms.lk</p>
                </div>
              </div>

            </div>

            {/* Social Media */}
            <div className="mt-10">
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                Follow Campus Updates
              </h3>
              <div className="flex space-x-4">
                <a href="#" className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition">
                  <FaFacebook />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition">
                  <FaTwitter />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition">
                  <FaInstagram />
                </a>
                <a href="#" className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 hover:bg-green-500 hover:text-white transition">
                  <FaLinkedin />
                </a>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div>
            {/* Map */}
            <div className="h-80 bg-green-100 mb-8 flex items-center justify-center rounded-xl shadow-md">
              <div className="text-center">
                <FaMapMarkerAlt className="text-6xl text-green-400 mb-4 mx-auto animate-pulse" />
                <p className="text-green-700 font-medium">
                  Campus Map Integration (Google Maps)
                </p>
              </div>
            </div>
            
            {/* Business Hours */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-6">
              <h3 className="text-xl font-medium text-gray-800 mb-4 flex items-center">
                <FaClock className="mr-2 text-green-500" /> Service Hours
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekdays</span>
                  <span className="font-medium text-gray-800">7:00 AM - 9:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Saturday</span>
                  <span className="font-medium text-gray-800">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sunday</span>
                  <span className="font-medium text-gray-800">Closed</span>
                </div>
              </div>
            </div>
            
            {/* Emergency */}
            <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded-r-lg">
              <div className="flex">
                <FaHeadset className="text-2xl text-green-500" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    24/7 Campus Emergency Support
                  </h3>
                  <p className="text-sm text-green-700 mt-2">
                    For urgent transport or parking issues:
                  </p>
                  <p className="font-bold mt-1 text-green-800">
                    +94 77 911 1199
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-100 py-5 text-center text-gray-600 text-sm">
          <p>© 2026 Smart University Transport & Parking System</p>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;