const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser')
require('dotenv').config()
const connectDB = require('./config/db')
const router = require('./routes')
const parkingRoutes = require("./routes/parkingRoutes");
const { seedParkingSampleData, startParkingExpiryWorker } = require("./services/parking/parkingService");

const statsRoutes =  require("./routes/statsRoutes.js");


//----


const app = express();
app.use(cors({
    origin : process.env.FRONTEND_URL,
    credentials : true,
    
}))

app.use(express.json())

app.use(cookieParser())

app.use(express.json())
app.use("/api",router)
app.use("/api/parking", parkingRoutes)

//-------attendance-------//
const attendanceRoutes = require('./routes/attendanceRoutes');
app.use('/api/attendance', attendanceRoutes);

//----Buses-------//
const busRoutes = require('./routes/busRoutes');
app.use('/api/buses', busRoutes);

// Import Employee Routes

const bus_routesRoutes = require('./routes/bus_routeRoutes');
app.use('/api/routes', bus_routesRoutes);

// Financial //
const financialRoutes = require("./routes/financialRoutes.js");
app.use("/api/financial", financialRoutes);


//--Payment--//
const paymentRoutes = require('./routes/paymentRoutes.js');
app.use("/api/payments", paymentRoutes);

//--Chatbot--//
const chatbotRoutes = require('./routes/chatbotRoutes.js');
app.use("/api/chatbot", chatbotRoutes);

//--Equipment--//

//--dashboard--//
app.use("/api/stats", statsRoutes);


//--store--//

// API routes


//--Bookings--//
const bookingRoutes = require("./routes/bookingRoutes");
app.use("/api/bookings", bookingRoutes);

//--Drivers--//
const driverRoutes = require("./routes/driverRoutes.js");
app.use("/api/drivers", driverRoutes);

const incidentRoutes = require("./routes/incidentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/incidents", incidentRoutes);
app.use("/api/notifications", notificationRoutes);

const PORT = 8000 || process.env.PORT

connectDB().then(()=>{
    if (process.env.PARKING_AUTO_SEED === "true") {
        seedParkingSampleData().catch((error) => {
            console.error("Parking seed failed:", error.message)
        })
    }

    startParkingExpiryWorker()

    app.listen(PORT, ()=>{
        console.log(`connect to DB`)
        console.log(`Server is running`)
    })
})
