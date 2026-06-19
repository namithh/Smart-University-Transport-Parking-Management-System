import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FaShieldAlt, 
  FaLeaf, 
  FaLightbulb, 
  FaBus, 
  FaRoute, 
  FaClock, 
  FaMapMarkerAlt,
  FaUsers,
  FaParking
} from 'react-icons/fa';

// Animation
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const Aboutus = () => {
  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-yellow-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Hero */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="max-w-7xl mx-auto text-center mb-16"
      >
        <motion.h1 
          variants={fadeIn}
          className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
        >
          About <span className="text-green-600 italic">UTPMS</span>
        </motion.h1>
        <motion.p 
          variants={fadeIn}
          className="text-xl text-gray-700 max-w-3xl mx-auto"
        >
          Smart University Transport & Parking Management System designed to enhance campus mobility with real-time tracking, smart bookings, and efficient parking solutions.
        </motion.p>
      </motion.section>

      {/* Mission */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-7xl mx-auto mb-20"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={fadeIn}>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-700 text-lg mb-4">
              To provide a smart, safe, and efficient transport and parking system for university students and staff using modern technology.
            </p>
            <p className="text-gray-700 text-lg">
              We aim to improve campus mobility through real-time bus tracking, digital bookings, and intelligent parking management.
            </p>
          </motion.div>

          <motion.div variants={fadeIn} className="relative">
            <div className="bg-green-500 rounded-2xl h-80 w-full overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1500&q=80" 
                alt="Campus Transport" 
                className="h-full w-full object-cover"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-2xl shadow-lg w-3/4 border-t-4 border-green-500">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                <FaBus className="mr-2 text-green-600" /> 50+ Campus Buses
              </h3>
              <p className="text-gray-600">Serving students and staff daily</p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Values */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-7xl mx-auto mb-20"
      >
        <motion.h2 
          variants={fadeIn}
          className="text-3xl font-bold text-center text-gray-900 mb-12"
        >
          Our Values
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Safety & Security",
              description: "Ensuring safe transport and secure parking for all campus users.",
              icon: <FaShieldAlt className="text-4xl text-green-600" />
            },
            {
              title: "Smart Technology",
              description: "Using real-time tracking, QR systems, and automation for efficiency.",
              icon: <FaLightbulb className="text-4xl text-green-600" />
            },
            {
              title: "Sustainability",
              description: "Reducing congestion and promoting eco-friendly campus mobility.",
              icon: <FaLeaf className="text-4xl text-green-600" />
            }
          ].map((value, index) => (
            <motion.div 
              key={index}
              variants={fadeIn}
              whileHover={{ y: -10 }}
              className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition border-t-4 border-green-500"
            >
              <div className="flex justify-center mb-4">{value.icon}</div>
              <h3 className="text-xl font-semibold text-center mb-4">{value.title}</h3>
              <p className="text-gray-600 text-center">{value.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Stats */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
        className="max-w-7xl mx-auto bg-green-500 rounded-3xl p-8 md:p-12 text-white mb-16"
      >
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {[
            { number: "5K+", label: "Students & Staff", icon: <FaUsers className="text-3xl mb-2 mx-auto" /> },
            { number: "30+", label: "Campus Routes", icon: <FaRoute className="text-3xl mb-2 mx-auto" /> },
            { number: "98%", label: "On-time Transport", icon: <FaClock className="text-3xl mb-2 mx-auto" /> },
            { number: "100+", label: "Parking Slots", icon: <FaParking className="text-3xl mb-2 mx-auto" /> }
          ].map((stat, index) => (
            <motion.div key={index} variants={fadeIn}>
              <div>{stat.icon}</div>
              <h3 className="text-4xl font-bold">{stat.number}</h3>
              <p className="text-green-100">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="max-w-4xl mx-auto bg-gradient-to-r from-green-400 to-green-500 rounded-3xl p-10 text-center text-white shadow-lg"
      >
        <h2 className="text-3xl font-bold mb-4">Ready to Use Smart Campus Services?</h2>
        <p className="text-xl mb-6 text-green-100">
          Book your bus, reserve parking, and experience smarter campus mobility today.
        </p>

        <Link to="/bookings">
          <button className="bg-white text-green-700 hover:bg-gray-100 font-semibold py-3 px-8 rounded-full text-lg transition hover:-translate-y-1">
            Get Started
          </button>
        </Link>
      </motion.section>
    </div>
  );
};

export default Aboutus;