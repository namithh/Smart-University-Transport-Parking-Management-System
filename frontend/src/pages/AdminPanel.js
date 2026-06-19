import React, { useEffect, useState } from 'react'
import { FaSteeringWheel , FaBars, FaTimes, FaBus, FaUsers, FaMoneyCheckAlt, FaRoute, FaTicketAlt, FaBook, FaChartLine ,FaParking, FaExclamationTriangle, FaBell  } from 'react-icons/fa'
import { PiSeatbeltFill } from "react-icons/pi";
import { useSelector } from 'react-redux'
import loginIcons from '../assest/profile.png'
import { Link, Outlet, useNavigate , useLocation } from 'react-router-dom'

import ROLE from '../common/role'

const AdminPanel = () => {
    const user = useSelector(state => state?.user?.user)
    const navigate = useNavigate()
    const location = useLocation()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
    const [activeTab, setActiveTab] = useState("")

    useEffect(() => {
      if(user?.role !== ROLE.ADMIN){
        navigate("/")
      }

      // Set active tab based on current URL
      const path = location.pathname
      if (path.includes("all-users")) setActiveTab("all-users")
      else if (path.includes("analytics")) setActiveTab("analytics")
      else if (path.includes("booking")) setActiveTab("booking")
      else if (path.includes("attendance")) setActiveTab("attendance")
      else if (path.includes("buses")) setActiveTab("buses")
      else if (path.includes("finance")) setActiveTab("finance")
      else if (path.includes("routes")) setActiveTab("routes")
      else if (path.includes("driver")) setActiveTab("driver")
      else if (path.includes("parking")) setActiveTab("parking")
      else if (path.includes("incidents")) setActiveTab("incidents")
      else if (path.includes("/admin-panel/notifications")) setActiveTab("notifications")
      else setActiveTab("")
      
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768)
        if (window.innerWidth < 768) {
          setIsSidebarOpen(false)
        } else {
          setIsSidebarOpen(true)
        }
      }
      
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [user, location])
    
    const toggleSidebar = () => {
      setIsSidebarOpen(!isSidebarOpen)
    }

    const navItems = [
      { to: "all-users", label: "User Management", icon: <FaUsers className="mr-3" /> },
      { to: "analytics", label: "Analytics", icon: <FaChartLine className="mr-3" /> },
      { to: "booking", label: "Booking Management", icon: <FaBook className="mr-3" /> },
      //{ to: "attendance", label: "Ticket Scanner", icon: <FaTicketAlt className="mr-3" /> },
      { to: "buses", label: "Shuttle Management", icon: <FaBus className="mr-3" /> },
      { to: "routes", label: "Bus Route Management", icon: <FaRoute className="mr-3" /> },
      { to: "driver", label: "Driver Management", icon: <PiSeatbeltFill className="mr-3" /> },
      { to: "parking", label: "Parking Management", icon: <FaParking  className="mr-3" /> },
      { to: "finance", label: "Finance Management", icon: <FaMoneyCheckAlt className="mr-3" /> },
      { to: "incidents", label: "Incident Management", icon: <FaExclamationTriangle className="mr-3" /> },
      { to: "notifications", label: "Notification Management", icon: <FaBell className="mr-3" /> },
      
    ]

    const closeSidebarOnMobile = () => {
      if (isMobile) {
        setIsSidebarOpen(false)
      }
    }
    
    return (
      <div className='min-h-screen flex bg-gray-50'>
        {/* Sidebar Toggle Button for Mobile */}
        <button 
          onClick={toggleSidebar}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-blue-600 text-white shadow-lg"
        >
          {isSidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>

        {/* Overlay for mobile when sidebar is open */}
        {isSidebarOpen && isMobile && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
        )}
        
        {/* Sidebar */}
        <aside className={`bg-white text-white min-h-full w-72 fixed md:relative  transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 shadow-xl`}>
          {/* Admin Profile Section */}
          <div className='p-5 flex flex-col items-center border-b bg-green-400'>
            <div className='w-20 h-20 mx-auto mb-3 rounded-full bg-white p-1'>
              <img src={loginIcons} alt='admin profile' className='w-full h-full object-contain rounded-full' />
            </div>
            <div className='text-center'>
              <h2 className="text-lg font-semibold">{user?.name || 'Admin User'}</h2>
              <p className='text-sm font-semibold text-red-600 mt-1'>{user?.role || 'Administrator'}</p>
            </div>
          </div>

          {/* Navigation */}
          <div className='py-4'>
            <nav className='space-y-1 px-3'>
              {navItems.map((item, index) => (
                <Link 
                  key={index}
                  to={item.to}
                  onClick={closeSidebarOnMobile}
                  className={`flex items-center text-lg font-medium px-4 py-4 rounded-lg transition-all duration-200 group${
            activeTab === item.to 
              ? ' shadow-lg hover:bg-green-400 bg-green-400 ' 
              : ' hover:bg-green-400 hover:text-white text-slate-600'
          }`}
        >
                  {item.icon}
                  <span className="group-hover:translate-x-1 transition-transform duration-200">{item.label}</span>
                </Link>
              ))}
            </nav>
          </div>

          
        </aside>
        
        {/* Main Content */}
        <main className='flex-1 p-4 md:p-6 lg:p-8 overflow-auto'>
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 min-h-full">
            <Outlet/>
          </div>
        </main>
      </div>
    )
}

export default AdminPanel