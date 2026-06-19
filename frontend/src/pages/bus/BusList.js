import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { GrAdd } from "react-icons/gr";
import { MdEdit, MdDirectionsBus, MdFileDownload } from "react-icons/md";
import { AiFillDelete, AiOutlineSearch } from "react-icons/ai";
import { FaUserTie } from "react-icons/fa";
import { IoTime, IoLocation, IoPeople } from "react-icons/io5";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api/buses";

const BusList = () => {
  const [buses, setBuses] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch all buses
  useEffect(() => {
    setLoading(true);
    axios
      .get(API_URL)
      .then((res) => {
        setBuses(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching buses:", err);
        setLoading(false);
        toast.error("Failed to load buses");
      });
  }, []);

  // Filter buses based on search term
  const filteredBuses = buses.filter(bus => 
    bus.bus_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bus.bus_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Delete a bus
  const handleDelete = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this bus?");
    if (isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setBuses(buses.filter((bus) => bus._id !== id));
        toast.success("Bus deleted successfully!");
      } catch (err) {
        console.error("Error deleting bus:", err);
        toast.error("Error deleting bus!");
      }
    } else {
      toast.info("Bus deletion canceled.");
    }
  };

  // Format time for better display
  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };


    //-------------------------- Generate PDF Report
  const generateReport = () => {
    const doc = new jsPDF();
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

  //Header

  doc.setFontSize(25);
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(245, 158, 11); // amber-500 (yellow tone)
      doc.text("UTPMS", 105, 25, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text("University Transport & Parking System", 105, 32, { align: "center" });
      doc.text(`Shuttle Report`, 105, 37, { align: "center" });

      doc.setLineWidth(0.5);
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.line(14, 43, 196, 43);

      // Summary Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("BUS DETAILS", 105, 60, { align: "center" });


    const tableColumn = ["Bus Number", "Route", "Type", "Driver", "Seats", "Departure", "Arrival"];
    const tableRows = [];

    filteredBuses.forEach((bus) => {
      tableRows.push([
        bus.bus_number,
        bus.route || "N/A",
        bus.bus_type,
        bus.driver || "N/A",
        bus.total_seats,
        formatTime(bus.departure_time),
        formatTime(bus.arrival_time),
      ]);
    });

      doc.setFontSize(10);
      doc.setFont("helvetica");
      doc.text(`Report Generated: ${currentDate}`, 14, 55);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 66,
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
doc.text("System Generated Report – UTPMS", 105, 290, { align: "center" });

    doc.save("bus_report.pdf");
  };

  //----------------------

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <MdDirectionsBus className="text-3xl text-blue-600 mr-2" />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Shuttle Management</h2>
        </div>

        <div className="flex gap-3">
          <Link to="/admin-panel/buses/add">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-md">
            <GrAdd className="text-lg" /> Add New Bus
          </button>
        </Link>
          {/* Add Report Button */}
          <button
            onClick={generateReport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors shadow-md"
          >
            <MdFileDownload className="text-lg" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <AiOutlineSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by bus number, route, or type..."
          className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredBuses.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <MdDirectionsBus className="text-5xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            {searchTerm ? "No buses match your search" : "No buses available"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? "Try a different search term" : "Get started by adding a new bus"}
          </p>
          {!searchTerm && (
            <Link to="/admin-panel/buses/add">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-flex items-center gap-2">
                <GrAdd /> Add Your First Bus
              </button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBuses.map((bus) => (
            <div key={bus._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">Bus {bus.bus_number}</h3>
                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">
                      {bus.bus_type}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <MdDirectionsBus className="text-blue-600 text-xl" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center text-gray-600">
                    <FaUserTie className="text-blue-600 text-xl mr-2" />
                    <span>{bus.driver || "No Driver"}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <IoLocation className="text-blue-500 text-xl mr-2" />
                    <span className="truncate">{bus.route || "Route not specified"}</span>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <IoPeople className="text-green-500 text-xl mr-2" />
                    <span>{bus.total_seats} seats</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <IoTime className="mr-1 text-purple-500 text-xl" />
                      <span>{formatTime(bus.departure_time)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <IoTime className="mr-1 text-purple-500 text-xl" />
                      <span>{formatTime(bus.arrival_time)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-5 pt-4 border-t border-gray-100 flex justify-between">
                  <Link to={`/admin-panel/buses/edit/${bus._id}`} className="flex-1 mr-2">
                    <button className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-colors">
                      <MdEdit /> Edit
                    </button>
                  </Link>
                  <button
                    onClick={() => handleDelete(bus._id)}
                    className="flex-1 ml-2 bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-colors"
                  >
                    <AiFillDelete /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BusList;