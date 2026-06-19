// frontend/src/pages/BookingViewPage.js
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { LuBookmarkCheck } from "react-icons/lu";
import {
  MdDelete,
  MdDirectionsBus,
  MdPerson,
  MdPhone,
  MdCalendarToday,
  MdSearch,
  MdFileDownload,
} from "react-icons/md";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_BOOKINGS =
  process.env.REACT_APP_API_URL || "http://localhost:8000/api/bookings";

export default function BookingViewPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await axios.put(`${API_BOOKINGS}/${id}/status`, {
        status: newStatus,
      });
      setBookings(bookings.map((b) => (b._id === id ? res.data : b)));
      toast.success("Booking status updated");
    } catch {
      toast.error("Failed to update status");
    }
  };

  

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_BOOKINGS);
      setBookings(res.data);
      setLoading(false);
    } catch (err) {
      toast.error("Failed to fetch bookings");
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this booking?"))
      return;

    try {
      await axios.delete(`${API_BOOKINGS}/${id}`);
      toast.success("Booking deleted successfully");
      setBookings(bookings.filter((b) => b._id !== id));
    } catch {
      toast.error("Failed to delete booking");
    }
  };

  const filteredBookings = bookings.filter(
    (booking) =>
      booking.passengerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.phone.includes(searchTerm) ||
      (booking.busId?.bus_number &&
        booking.busId.bus_number
          .toLowerCase()
          .includes(searchTerm.toLowerCase()))
  );

  const downloadPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    // Header
    doc.setFontSize(25);
    doc.setFont("helvetica", "bolditalic");
    doc.setTextColor(245, 158, 11); // amber-500 (yellow tone)
    doc.text("UTPMS", 105, 25, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text("University Transport & Parking System", 105, 32, { align: "center" });
    doc.text(`Booking Report`, 105, 37, { align: "center" });

    doc.setLineWidth(0.5);
    doc.setDrawColor(245, 158, 11); // amber-500
    doc.line(14, 43, 196, 43);

    // Summary Section
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("BOOKINGS", 105, 60, { align: "center" });

    const tableColumn = [
      "Passenger",
      "Phone",
      "Bus Number",
      "Bus Type",
      "Date",
      "Route",
      "Seats",
    ];
    const tableRows = [];

    filteredBookings.forEach((booking) => {
      const bookingData = [
        booking.passengerName,
        booking.phone,
        booking.busId?.bus_number || "N/A",
        booking.busId?.bus_type || "",
        new Date(booking.date).toLocaleDateString(),
        booking.routeId
          ? `${booking.routeId.start_location} → ${booking.routeId.end_location}`
          : "",
        booking.seats,
      ];
      tableRows.push(bookingData);
    });

    doc.setFontSize(10);
    doc.setFont("helvetica");

    doc.text(`Report Generated: ${currentDate}`, 14, 55);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 66,
      styles: { fontSize: 10 },
    });

    // Get final Y position of table
    let finalY = doc.lastAutoTable.finalY || 66;

    // Signature / Approval Section
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(".................................", 14, finalY + 30);
    doc.text("Authorized Signature", 14, finalY + 40);

    doc.text(".................................", 140, finalY + 30);
    doc.text("Checked By", 148, finalY + 40);

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text("System Generated Report – UTPMS", 105, 290, {
      align: "center",
    });

    doc.save("bookings_report.pdf");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-green-700 font-medium">
            Loading bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-green-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center mb-4 md:mb-0 justify-between">
            <div className="flex items-center">
              <LuBookmarkCheck className="text-3xl text-blue-600 mr-2" />
              <h2 className="text-2xl mb-4 md:text-3xl font-bold text-gray-800">
                {" "}
                Shuttle Booking Management
              </h2>
            </div>
            <button
              onClick={downloadPDF}
              className="flex items-center bg-blue-200 text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-green-600 hover:text-white transition duration-200"
            >
              <MdFileDownload className="mr-2" /> Download PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-green-600 text-3xl font-bold">
                {bookings.length}
              </div>
              <p className="text-green-800">Total Bookings</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-green-600 text-3xl font-bold">
                {bookings.reduce((total, booking) => total + booking.seats, 0)}
              </div>
              <p className="text-green-800">Total Seats Booked</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-green-600 text-3xl font-bold">
                {new Set(bookings.map((b) => b.busId?._id)).size}
              </div>
              <p className="text-green-800">Buses Booked</p>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 mt-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <div className="relative w-full md:w-1/3 mb-4 md:mb-0">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MdSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by name, phone, or bus number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg">
              <span className="font-semibold">{filteredBookings.length}</span>{" "}
              bookings found
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                {searchTerm
                  ? "No matching bookings found"
                  : "No bookings available"}
              </h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "All bookings will appear here"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-green-100 text-green-900">
                    <th className="px-4 py-3 text-left font-semibold rounded-tl-xl">
                      Passenger
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Bus Details
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">
                      Journey
                    </th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>

                    <th className="px-4 py-3 text-center font-semibold rounded-tr-xl">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <tr
                      key={booking._id}
                      className={`border-b border-yellow-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-yellow-50"
                      }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <MdPerson className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {booking.passengerName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.seats} seat(s)
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <MdPhone className="text-green-600" />
                          </div>
                          <span className="text-gray-700">{booking.phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <MdDirectionsBus className="text-green-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {booking.busId?.bus_number || "N/A"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.busId?.bus_type || ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="bg-green-100 p-2 rounded-lg mr-3">
                            <MdCalendarToday className="text-green-600" />
                          </div>
                          <div>
                            <p className="text-gray-700">
                              {new Date(booking.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-500">
                              {booking.routeId
                                ? `${booking.routeId.start_location} → ${booking.routeId.end_location}`
                                : ""}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={booking.status}
                          onChange={(e) =>
                            handleStatusChange(booking._id, e.target.value)
                          }
                          className="border border-gray-300 rounded px-2 py-1"
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                        </select>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex justify-center">
                          <button
                            onClick={() => handleDelete(booking._id)}
                            className="p-2 text-red-500 flex items-center bg-red-50 rounded-lg hover:bg-red-100 transition duration-200"
                            title="Delete booking"
                          >
                            <MdDelete size={20} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
