// frontend/src/pages/BookingPage.js

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { BiSolidBusSchool } from "react-icons/bi";
import jsPDF from "jspdf";
import QRCode from "qrcode";

const API_BUSES =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/buses";
const API_ROUTES =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/routes";
const API_BOOKINGS =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/bookings"; // booking endpoint

export default function BookingPage() {
  const { id } = useParams(); // bus id from /book/:id
  const navigate = useNavigate();

  const [bus, setBus] = useState(null);
  const [route, setRoute] = useState(null);
  const [passengerName, setPassengerName] = useState("");
  const [phone, setPhone] = useState("");
  const [seats, setSeats] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // default today's date
  const [isLoading, setIsLoading] = useState(true);

  // popup bill state
  const [showBill, setShowBill] = useState(false);
  const [billData, setBillData] = useState(null);
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    fetchBus();
  }, [id]);

  const fetchBus = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BUSES}/${id}`);
      setBus(res.data);

      if (res.data.route) {
        try {
          const allRoutes = await axios.get(API_ROUTES);
          const found = allRoutes.data.find(
            (r) => r._id === res.data.route || r.route_name === res.data.route,
          );
          if (found) setRoute(found);
          else toast.error("Route not found for this bus");
        } catch {
          toast.error("Failed to fetch route details");
        }
      }
    } catch {
      toast.error("Bus not found");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Handle booking (show popup instead of direct download)
  const handleBooking = async (e) => {
    e.preventDefault();
    try {
      const booking = {
        busId: bus._id,
        passengerName,
        phone,
        seats,
        date: new Date(date).toISOString().split("T")[0], // use selected date
      };
      await axios.post(API_BOOKINGS, booking);

      toast.success("Booking successful!");

      // prepare bill data
      const bill = {
        passengerName,
        phone,
        bus,
        route,
        seats,
        date,
        total: route.price * seats,
      };

      // generate QR for bill
      const qrData = `
        ${bus.bus_number} (${bus.bus_type})
        ${route.start_location} → ${route.end_location}
        Seats: ${seats}
        ${date}
        
      `;
      const qrImageUrl = await QRCode.toDataURL(qrData);

      setBillData(bill);
      setQrUrl(qrImageUrl);
      setShowBill(true); // open popup
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking failed");
    }
  };

  // ✅ Download bill as PDF
  const downloadBill = () => {
    if (!billData) return;

    const doc = new jsPDF();

    doc.setFontSize(25);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(245, 158, 11); // amber-500 (yellow tone)
    doc.text("UTPMS", 105, 25, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("E-TICKET", 105, 32, { align: "center" });

    doc.setLineWidth(0.5);
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.line(14, 40, 196, 43);

    doc.setFontSize(12);
    doc.text(`Name: ${billData.passengerName}`, 20, 45);
    doc.text(`Phone: ${billData.phone}`, 20, 55);
    doc.text(
      `Bus: ${billData.bus.bus_number} (${billData.bus.bus_type})`,
      20,
      65,
    );
    doc.text(
      `${billData.route.start_location} - ${billData.route.end_location}`,
      20,
      75,
    );
    doc.text(`${new Date(billData.date).toLocaleDateString()}`, 20, 85);
    doc.text(`Seats: ${billData.seats}`, 20, 95);
    doc.text(`Fare per Seat: Rs ${billData.route.price}`, 20, 105);
    doc.text(`Total Amount: Rs ${billData.total}`, 20, 115);

    // add qr
    doc.addImage(qrUrl, "PNG", 140, 40, 40, 50);

    doc.setFontSize(10);
    doc.text("Thank you for booking with UTPMS!", 20, 140);

    doc.save(`E-Bill-${billData.bus.bus_number}-${Date.now()}.pdf`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-yellow-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-green-700 font-medium">
            Loading bus details...
          </p>
        </div>
      </div>
    );
  }

  if (!bus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md w-full mx-4">
          <div className="text-green-500 text-6xl mb-4">🚌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Bus Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The bus you're looking for doesn't exist or is no longer available.
          </p>
          <button
            onClick={() => navigate("/")}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header Section */}
        <div className="bg-green-500 text-white p-6">
          <h1 className="text-3xl font-bold mb-2">Book Your Journey</h1>
          <p className="opacity-90">Reserve your seats in just a few clicks</p>
        </div>

        {/* Bus Information Card */}
        <div className="p-6 border-b border-green-100">
          <div className="flex items-center mb-4">
            <div className="bg-green-100 p-3 rounded-full mr-4">
              <span className="text-2xl">
                <BiSolidBusSchool />
              </span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Bus {bus.bus_number}
              </h2>
              <p className="text-gray-600">{bus.bus_type}</p>
            </div>
          </div>

          {route && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 p-4 bg-yellow-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Route</h3>
                <p className="text-gray-900">
                  {route.start_location} → {route.end_location}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">Fare</h3>
                <p className="text-green-700 font-bold">
                  {" "}
                  LKR {route.price} per seat
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">
                  Available Seats
                </h3>
                <p className="text-gray-900">{bus.available_seats}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">
                  Journey Date
                </h3>
                <p className="text-gray-900">
                  {new Date(date).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Booking Form */}
        <form onSubmit={handleBooking} className="p-6 space-y-5">
          <h3 className="text-xl font-semibold text-gray-800">
            Passenger Details
          </h3>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Full Name
            </label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={passengerName}
              onChange={(e) => {
                const value = e.target.value;
                if (/^[a-zA-Z\s]*$/.test(value)) {
                  setPassengerName(value);
                }
              }}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-2 font-medium">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="Enter your phone number"
              value={phone}
              onChange={(e) => {
                const value = e.target.value;
                // Only digits & limit length to 10
                if (/^[0-9]*$/.test(value) && value.length <= 10) {
                  setPhone(value);
                }
              }}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
              required
            />
            {/* Show error if not exactly 10 digits */}
            {phone.length > 0 && phone.length < 10 && (
              <p className="text-red-500 text-sm mt-1">
                Phone number must be 10 digits
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Number of Seats
              </label>
              <input
                type="number"
                value={seats}
                onChange={(e) => setSeats(e.target.value)}
                min="1"
                max={bus.available_seats}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                Max: {bus.available_seats} seats available
              </p>
            </div>

            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Journey Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 outline-none transition"
                required
              />
            </div>
          </div>

          {route && seats > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Total Amount:</span>
                <span className="text-2xl font-bold text-green-700">
                  LKR {route.price * seats}.00
                </span>
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={seats > bus.available_seats}
              className={`w-full py-3 px-4 rounded-lg font-bold text-white transition duration-200 ${
                seats > bus.available_seats
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {seats > bus.available_seats
                ? "Not enough seats available"
                : "Confirm Booking"}
            </button>
          </div>
        </form>
      </div>

      {/* Popup Bill */}
      {showBill && billData && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full relative">
            {/* Header with decorative elements */}
            <div className="bg-green-500 text-white p-4 relative overflow-hidden">
              <div className="absolute -top-3 -right-3 w-16 h-16 bg-green-600 rounded-full"></div>
              <div className="absolute -bottom-4 -left-4 w-14 h-14 bg-green-400 rounded-full"></div>

              <div className="relative z-10 flex flex-col items-center">
                <h1 className="text-xl font-bold italic text-white drop-shadow-md">
                  UTPMS
                </h1>
                <p className="text-green-100 text-sm mt-1">
                  Your Journey, Our Priority
                </p>
              </div>
            </div>

            {/* Bill Content */}
            <div className="p-4">
              <h2 className="text-lg font-bold text-center mb-3 text-gray-800 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                E-Ticket Preview
              </h2>

              {/* Compact information grid using flex */}
              <div className="grid grid-cols-12 gap-2 mb-4 text-sm">
                {/* Passenger */}
                <div className="col-span-2 flex justify-center items-start pt-1">
                  <div className="bg-green-100 p-1 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="col-span-10">
                  <p className="text-xs text-gray-500">Passenger</p>
                  <p className="font-medium text-sm">
                    {billData.passengerName}
                  </p>
                </div>

                {/* Phone */}
                <div className="col-span-2 flex justify-center items-start pt-1">
                  <div className="bg-green-100 p-1 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="col-span-10">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium text-sm">{billData.phone}</p>
                </div>

                {/* Date and Seats in one row */}
                <div className="col-span-2 flex justify-center items-start pt-1">
                  <div className="bg-green-100 p-1 rounded mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="col-span-10">
                  <p className="text-xs text-gray-500">Date</p>
                  <p className="font-medium text-sm">
                    {new Date(billData.date).toLocaleDateString()}
                  </p>
                </div>

                <div className="col-span-2 flex justify-center items-start pt-1">
                  <div className="bg-green-100 p-1 rounded mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905a3.61 3.61 0 01-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                      />
                    </svg>
                  </div>
                </div>
                <div className="col-span-10">
                  <p className="text-xs text-gray-500">Seats</p>
                  <p className="font-medium text-sm">{billData.seats}</p>
                </div>

                {/* Route */}
                <div className="col-span-2 flex justify-center items-start pt-1">
                  <div className="bg-green-100 p-1 rounded">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="col-span-10">
                  <p className="text-xs text-gray-500">Route</p>
                  <p className="font-medium text-sm">
                    {billData.route.start_location} →{" "}
                    {billData.route.end_location}
                  </p>
                </div>

                {/* Total Amount */}
                <div className="col-span-12 mt-2 pt-2 border-t border-green-100 flex items-center">
                  <div className="bg-green-100 p-1 rounded mr-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total Amount</p>
                    <p className="font-bold text-2xl text-green-700">
                      Rs {billData.total}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code and action buttons in a compact row */}
              <div className="flex items-start gap-3">
                {/* QR Code Section */}
                {qrUrl && (
                  <div className="border-2 border-dashed border-green-200 rounded-lg p-2 flex flex-col items-center flex-shrink-0">
                    <img
                      src={qrUrl}
                      alt="QR Code"
                      className="w-20 h-20 border-2 border-green-100 rounded"
                    />
                    <p className="text-sm text-gray-500 mt-1">Scan QR</p>
                  </div>
                )}

                {/* Action Buttons in a column */}
                <div className="flex flex-col gap-2 flex-grow">
                  <button
                    onClick={downloadBill}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm shadow-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setShowBill(false);
                      navigate("/bookings");
                    }}
                    className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

            {/* Decorative footer */}
            <div className="bg-green-50 py-2 text-center">
              <p className="text-xs text-green-700">
                Thank you for choosing UTPMS!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}