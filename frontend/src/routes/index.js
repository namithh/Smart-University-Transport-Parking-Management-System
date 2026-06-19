import { createBrowserRouter } from "react-router";
import App from "../App";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import AdminPanel from "../pages/AdminPanel";
import AllUsers from "../pages/AllUsers";
import Scanner from "../component/Scanner";
//-----
import BusList from "../pages/bus/BusList";
import AddBus from "../pages/bus/AddBus";
import EditBus from "../pages/bus/EditBus";
//import Services from "../pages/Services"

//---Bus Routes-----
import RouteList from "../pages/Route/RouteList";
import AddRoute from "../pages/Route/AddRoute";
import EditRoute from "../pages/Route/EditRoute";

import Bususer from "../pages/bus/Bususer"

//import Equipmanage from "../pages/equipment/Equipmanage";

import AboutUS from "../pages/Aboutus"
import BookingList from "../pages/Booking/BookingList";
import BookingPage from "../pages/Booking/BookingPage";
import FinancialManagement from "../pages/Financial/FinancialManagement";
import Dashboard from "../pages/Dashboard";
import Driver from "../pages/Driver";
import ContactUs from "../pages/ContactUs";
import Parking from "../pages/Parking/Parking";
import ParkingUser from "../pages/Parking/Parking_user";
import MyParkingReservations from "../pages/Parking/MyParkingReservations";
import ReportIncident from "../pages/incident/ReportIncident";
import MyIncidents from "../pages/incident/MyIncidents";
import IncidentList from "../pages/incident/IncidentList";
import Notifications from "../pages/incident/Notifications";
import NotificationManagement from "../pages/incident/NotificationManagement";
import Analytics from "../pages/Analytics";









const router = createBrowserRouter([
    {
        path: "/",
        element:<App/>,
        children : [
            {
                path : "",
                element : <Home/>
            },
            {
                path : "login",
                element : <Login/>
            },
            {
                path : "sign-up",
                element : <Signup/>
            },
            {
                path : "admin-panel" , 
                element : <AdminPanel/>,
                children : [
                    {
                        index : true,
                        element : <Dashboard/>

                    },
                    {
                        path : "all-users",
                        element : <AllUsers/>
                    },
                    {
                        path : "booking",
                        element : <BookingList/>
                    },
                    {
                        path : "attendance",
                        element : <Scanner/>,
                        
                    },
                    // ------- Buses Module ------- //
                    {
                        path: "buses",
                        element: <BusList />
                    },
                    {
                        path: "buses/add",
                        element: <AddBus />
                    },
                    {
                        path: "buses/edit/:id",
                        element: <EditBus />
                    },
                    // ------- Route Module ------- //
                    {
                        path: "routes",
                        element: <RouteList />
                    },
                    {
                        path: "routes/add",
                        element: <AddRoute />
                    },
                    {
                        path: "routes/edit/:id",
                        element: <EditRoute/>
                    },
                    {
                        path : "finance",
                        element : <FinancialManagement/>
                    },
                    {
                        path : "incidents",
                        element : <IncidentList/>
                    },
                    {
                        path : "notifications",
                        element : <NotificationManagement/>
                    },
                    {
                        path : "driver",
                        element : <Driver/> 
                    },
                    {
                        path : "parking",
                        element : <Parking/> 
                    },
                    { 
                        path : "analytics",   
                        element : <Analytics/>
                    }
                    
                   
                      
                            //{ path: '/', element: <App /> },
                    
                        
                        
                   
                    
                    
                    
                      
                    
                    
                    
                    
                    
                    
                ]
                
            },
           
            {
                path : "aboutus",
                element : <AboutUS/>, 
                
            },

            {
                path : "parking-user",
                element : <ParkingUser/>
            },
            {
                path : "parking-user/my-reservations",
                element : <MyParkingReservations/>
            },
            
            {
                path : "bookings",
                element : <Bususer/>
            },
            {
                path : "book/:id",
                element : <BookingPage/>
            },
            {
                path: "contactus",
                element: <ContactUs />
            },
            {
                path: "report-incident",
                element: <ReportIncident />
            },
            {
                path: "my-incidents",
                element: <MyIncidents />
            },
            {
                path: "notifications",
                element: <Notifications />
            },
            
            
            
            
        ]
    }
])

export default router;
