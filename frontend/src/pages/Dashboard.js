import React, { useEffect, useState } from "react";
import { FaUsers, FaBus, FaRoute, FaTicketAlt, FaMoneyCheckAlt, FaUserTie, FaChartLine, FaArrowUp, FaArrowDown } from "react-icons/fa";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    buses: 0,
    routes: 0,
    bookings: 0,
    drivers: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [previousStats, setPreviousStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Store current stats as previous before fetching new ones
        setPreviousStats(stats);
        
        const res = await axios.get("http://localhost:8000/api/stats");
        setStats(res.data);
        
        // Simulate loading delay for better animation
        setTimeout(() => setLoading(false), 800);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setLoading(false);
      }
    };

    fetchStats();
    // Set up interval to refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calculate percentage changes
  const getPercentageChange = (current, previous, label) => {
    if (previous === 0 || previous === undefined) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change >= 0,
      icon: change >= 0 ? <FaArrowUp className="text-xs" /> : <FaArrowDown className="text-xs" />
    };
  };

  const cards = [
    { 
      label: "Users", 
      value: stats.users, 
      icon: <FaUsers className="text-3xl" />,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600"
    },
    { 
      label: "Shuttles", 
      value: stats.buses, 
      icon: <FaBus className="text-3xl" />,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600"
    },
    { 
      label: "Routes", 
      value: stats.routes, 
      icon: <FaRoute className="text-3xl" />,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600"
    },
    { 
      label: "Bookings", 
      value: stats.bookings, 
      icon: <FaTicketAlt className="text-3xl" />,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600"
    },
    { 
      label: "Drivers", 
      value: stats.drivers, 
      icon: <FaUserTie className="text-3xl" />,
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600"
    },
    { 
      label: "Revenue", 
      value: `Rs. ${stats.revenue.toLocaleString()}`, 
      icon: <FaMoneyCheckAlt className="text-3xl" />,
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600"
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15
      }
    }
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="h-10 bg-gray-200 rounded w-10 float-right"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FaChartLine className="text-indigo-600" />
          Dashboard Overview
        </h1>
        <p className="text-gray-600 mt-2">Real-time statistics and analytics</p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence>
            {cards.map((card, idx) => {
              const percentageChange = getPercentageChange(
                typeof card.value === 'string' ? stats[card.label.toLowerCase()] : card.value,
                previousStats[card.label.toLowerCase()],
                card.label
              );

              return (
                <motion.div
                  key={idx}
                  variants={cardVariants}
                  whileHover="hover"
                  whileTap="tap"
                  className={`relative overflow-hidden rounded-2xl shadow-lg shadow-slate-400 mt-8 ${card.bgColor} cursor-pointer`}
                >
                  {/* Gradient accent bar */}
                  <div className={`absolute top-0 left-0 w-full h-2 opacity-40 bg-gradient-to-r ${card.color}`}></div>
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <motion.h3 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className={`text-sm font-semibold uppercase tracking-wider ${card.textColor} opacity-80`}
                        >
                          {card.label}
                        </motion.h3>
                        
                        <motion.p 
                          key={card.value}
                          variants={numberVariants}
                          initial="hidden"
                          animate="visible"
                          className="text-3xl font-bold text-gray-800 mt-2"
                        >
                          {card.value}
                        </motion.p>
                        
                        {percentageChange && (
                          <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className={`flex items-center gap-1 mt-2 text-sm font-medium ${
                              percentageChange.isPositive ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {percentageChange.icon}
                            <span>{percentageChange.value}%</span>
                            <span className="text-gray-500 ml-1">from last update</span>
                          </motion.div>
                        )}
                      </div>
                      
                      <motion.div
                        whileHover={{ rotate: 5, scale: 1.1 }}
                        className={`p-3 rounded-full ${card.bgColor} bg-opacity-50`}
                      >
                        <div className={card.textColor}>
                          {card.icon}
                        </div>
                      </motion.div>
                    </div>
                    
                    {/* Progress bar indicator */}
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                      className={`h-1 bg-gradient-to-r ${card.color} bg-opacity-30 rounded-full mt-4`}
                    ></motion.div>
                  </div>
                  
                  {/* Animated background elements */}
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 0.1 }}
                    transition={{ delay: 0.8, duration: 1 }}
                    className={`absolute -bottom-8 -right-8 w-24 h-24 rounded-full ${card.bgColor} ${card.textColor}`}
                  ></motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
      
      {/* Refresh indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-8 text-center"
      >
        <p className="text-gray-500 text-sm">Data auto-refreshes every 30 seconds</p>
      </motion.div>
    </div>
  );
};

export default Dashboard;