import React, { useState } from "react";
import Logo from "../assest/logo.png";
//import { IoMdSearch } from "react-icons/io";
import { FaRegUserCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import SummaryApi from "../common";
import { toast } from "react-toastify";
import { setUserdetails } from "../store/userSlice";
import ROLE from "../common/role";
import Profile from "../component/Profile";
import NotificationBell from "../component/incident/NotificationBell";

const Header = () => {

const [openProfile, setOpenProfile] = useState(false);

  const user = useSelector((state) => state?.user?.user);
    // Backend role values can vary in casing; normalize to avoid hiding menu items.
  const userRole = (user?.role ?? "").toString().trim().toUpperCase();
  const dispatch = useDispatch();

  const [menuDisplay, setMenuDisplay] = useState(false);

  const handleLogout = async () => {
    const fetchData = await fetch(SummaryApi.logout.url, {
      method: SummaryApi.logout.method,
      credentials: "include",
    });

    const data = await fetchData.json();

    if (data.success) {
      toast.success(data.message);
      dispatch(setUserdetails(null));
    } else {
      toast.error(data.message);
    }
  };
  return ( <>
    <header className="h-16 shadow-md bg-white fixed w-full z-20">
      <div className="h-full container max-w-full   flex items-center  justify-between">
        <div className="ml-5">
          <img src={Logo} alt="Logo" className="h-30 w-60 ml-5 mt-4" />
        </div>
        <div>
          <nav className="row">
            <Link to={"/"} className="px-5 py-3 text-xl hover:text-green-600">
              Home
            </Link>
            <Link
              to={"aboutus"}
              className="px-5 py-3 text-xl hover:text-green-600"
            >
              About Us
            </Link>
            <Link
              to={"parking-user"}
              className="px-5 py-3  text-xl hover:text-green-600"
            >
              Parking
            </Link>
            <Link
              to={"bookings"}
              className="px-5 py-3  text-xl hover:text-green-600"
            >
              Shuttle
            </Link>
            {/* <Link to={""}className='px-5 py-3 text-xl hover:text-green-600'></Link> */}
            <Link
              to={"contactus"}
              className="px-5 py-3  text-xl hover:text-green-600"
            >
              Contact Us
            </Link>
            {userRole === ROLE.GENERAL && (
              <>
                <Link
                  to={"report-incident"}
                  className="px-3 py-2 text-lg hover:text-green-600 whitespace-nowrap"
                >
                  Report incident
                </Link>
                <Link
                  to={"my-incidents"}
                  className="px-3 py-2 text-lg hover:text-green-600 whitespace-nowrap"
                >
                  My incidents
                </Link>
                <Link
                  to={"notifications"}
                  className="px-3 py-2 text-lg hover:text-green-600 whitespace-nowrap"
                >
                  Notifications
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-4 self-start pt-1">
          {user?._id && <NotificationBell />}
          <div className="reletive group flex justify-center">
            <div
              className=" text-4xl cursor-pointer"
              onClick={() => setMenuDisplay((preve) => !preve)}
            >
              {user ? (
                <span className="text-lg font-semibold text-gray-800 text-center flex">
                  {user.name}
                </span>
              ) : (
                <FaRegUserCircle />
              )}
              {menuDisplay && (
                <div className="absolute bg-white bottom-0 top-11 h-fit p-2 text-lg shadow-lg rounded-md ">
                  <nav>
                    {user?.role === ROLE.ADMIN && (
                      <Link to={"admin-panel"}>Admin panel</Link>
                    )}

                    {user?.role === ROLE.GENERAL && (
  <div
    onClick={() => {
      setOpenProfile(true);
      setMenuDisplay(false);
    }}
    className="cursor-pointer hover:text-green-600"
  >
    Profile
  </div>
)}
                  </nav>
                </div>
              )}
            </div>
          </div>
          <div className="mr-6">
            {user?._id ? (
              <button
                onClick={handleLogout}
                className="px-3 py-1 font-semibold rounded-full text-black bg-green-400 hover:bg-green-600 hover:text-white"
              >
                Logout
              </button>
            ) : (
              <Link
                to={"/login"}
                className="px-3 py-1 font-semibold rounded-full text-black bg-green-400 hover:bg-green-600 hover:text-white "
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
    {openProfile && (
      <Profile 
        user={user}
        onClose={() => setOpenProfile(false)} 
        callFunc={() => setMenuDisplay(false)}
      />
    )}
  </>
);
};

export default Header;