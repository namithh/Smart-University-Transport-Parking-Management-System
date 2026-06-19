import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter, FaYoutube, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa';
import { BiSolidBusSchool } from "react-icons/bi";

const Footer = () => {
  return (
    <footer className='bg-gradient-to-b from-green-600 to-green-700 text-white'>
      <div className='container mx-auto px-4 py-8'>
        
        {/* Main Footer Content */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8'>
          
          {/* Company Information */}
          <div className='space-y-4'>
            <h3 className='text-xl font-bold mb-4 flex items-center italic'>
              <span className='bg-green-500 p-2 rounded-lg mr-2 text-2xl'>
                <BiSolidBusSchool />
              </span>
              UTPMS
            </h3>
            <p className='text-green-100 leading-relaxed'>
              Your trusted partner for smart, reliable, and efficient university transport and parking management. Experience seamless campus mobility.
            </p>
            <div className='flex space-x-4 pt-2'>
              <a href='#' className='bg-green-500 p-2 rounded-full hover:bg-green-400 transition-all duration-300 transform hover:scale-110'>
                <FaFacebook size={18} />
              </a>
              <a href='#' className='bg-green-500 p-2 rounded-full hover:bg-green-400 transition-all duration-300 transform hover:scale-110'>
                <FaInstagram size={18} />
              </a>
              <a href='#' className='bg-green-500 p-2 rounded-full hover:bg-green-400 transition-all duration-300 transform hover:scale-110'>
                <FaTwitter size={18} />
              </a>
              <a href='#' className='bg-green-500 p-2 rounded-full hover:bg-green-400 transition-all duration-300 transform hover:scale-110'>
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>

          </div>

          {/* Services */}
          <div className='space-y-4'>
            
            <ul className='space-y-2'>

            </ul>
          </div>

          {/* Contact Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-semibold border-b-2 border-green-400 pb-2'>Contact Info</h3>
            <div className='space-y-3'>
              <div className='flex items-start'>
                <FaMapMarkerAlt className='text-green-300 mt-1 mr-3 flex-shrink-0' />
                <span className='text-green-100'>Malabe, Sri Lanka</span>
              </div>
              <div className='flex items-center'>
                <FaPhone className='text-green-300 mr-3' />
                <span className='text-green-100'>+94 11 234 5678</span>
              </div>
              <div className='flex items-center'>
                <FaEnvelope className='text-green-300 mr-3' />
                <span className='text-green-100'>info@utpms.lk</span>
              </div>
              <div className='flex items-start'>
                <FaClock className='text-green-300 mt-1 mr-3 flex-shrink-0' />
                <span className='text-green-100'>24/7 Customer Support</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className='border-t border-green-500 pt-6'>
          <div className='flex flex-col md:flex-row justify-between items-center'>
            <p className='text-green-200 text-sm mb-4 md:mb-0'>
              © 2026 UTPMS. All rights reserved.
            </p>
            <div className='flex space-x-6 text-sm'>
              <a href='#' className='text-green-200 hover:text-white transition-colors'>Privacy Policy</a>
              <a href='#' className='text-green-200 hover:text-white transition-colors'>Terms of Service</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;