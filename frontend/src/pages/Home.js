import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import busBanner from "../assest/background.png";
//import appScreenshot from "../assest/bus-banner.jpg";
import { Link } from "react-router-dom";
import { BsBusFront } from "react-icons/bs";
import { BsBookmarkCheckFill } from "react-icons/bs";
import { TbMapRoute } from "react-icons/tb";

const Home = () => {
  // Detect when the section is in view
  const { ref, inView } = useInView({
    threshold: 0.3,
  });

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
        {/* Background Section */}
        <div
          className="absolute inset-0 w-full h-full bg-green-800 min-h-[calc(100vh-120px)] bg-cover bg-center flex items-center justify-center"
          style={{ backgroundImage: `url(${busBanner})` }}
        >
          {/* Diagonal Overlay 12*/}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-y-0 right-0 w-2/3 bg-gradient-to-r from-green-400 to-green-600 clip-diagonal"
          ></motion.div>
        </div>

        {/* Content Section with Scroll Animation */}
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative w-5/12 bg-cover bg-center items-center left-96 text-white"
        >
          {/* Left Side: Text Content with separate animation */}
          <div className="lg:w-1/2 text-center lg:text-left ml-32">
            <motion.h1
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
              className="relative text-5xl font-extrabold text-white leading-tight"
            >
              <span className="text-yellow-300">Smart</span> University Transport & Parking System
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-lg text-white mt-4"
            >
              Manage university transport and parking efficiently with real-time tracking, smart booking, and seamless access control.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, ease: "easeOut" }}
              className="mt-6 flex gap-4"
            >
              {/* Animated Buttons */}
              <Link to="/bookings">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-black hover:bg-slate-800 px-6 py-3 rounded-lg text-lg font-semibold text-white transition shadow-lg"
              >
                Book Now
              </motion.button>
              </Link>
              <Link to="/aboutus">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-black px-6 py-3 rounded-lg text-lg font-semibold text-black hover:bg-green-700 transition"
              >
                Learn More
              </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="relative min-h-[calc(100vh-120px)] bg-cover bg-center flex items-center justify-center text-white bg-gray-100">
        {/* Content */}
        <div className="relative z-10 text-center px-6 py-16">
          <h2 className="text-4xl font-bold text-green-700 uppercase mb-12">Our Services</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-lg shadow-lg text-green-800"
            >
              <div className="text-5xl mb-4 items-center justify-center flex"><BsBusFront /></div>
              <h3 className="text-xl font-bold mb-2">Real-time Tracking</h3>
              <p>Track your bus in real-time and know exactly when it will arrive at your stop.</p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-lg shadow-lg text-green-800"
            >
              <div className="text-5xl mb-4 items-center justify-center flex"><BsBookmarkCheckFill /></div>
              <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
              <p>Book your tickets online with our simple and secure payment system.</p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white p-6 rounded-lg shadow-lg text-green-800"
            >
              <div className="text-5xl mb-4 items-center justify-center flex"><TbMapRoute /></div>
              <h3 className="text-xl font-bold mb-2">Multiple Routes</h3>
              <p>We serve numerous destinations with convenient schedules throughout the day..</p>
            </motion.div>
          </div>
          

        </div>
      </div>

      
        </div>
      
  );
};

export default Home;