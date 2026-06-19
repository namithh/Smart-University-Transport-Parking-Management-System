import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus, FaSave, FaSearch, FaSync } from "react-icons/fa";
import {MdFileDownload} from "react-icons/md";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const Driver = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
    status: "Active",
  });
  const [error, setError] = useState("");
  const tableRef = useRef(null);

  // Fetch drivers
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:8000/api/drivers");
      setDrivers(res.data);
    } catch (err) {
      console.error(err);
      setError("Unable to fetch drivers. Please check backend server.");
      toast.error("Failed to fetch drivers");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input
// Handle form input with validations
const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "name") {
    // Allow only letters and spaces
    if (/^[A-Za-z\s]*$/.test(value)) {
      setForm({ ...form, [name]: value });
    }
  } else if (name === "phone") {
    // Allow only numbers and max 10 digits
    if (/^\d{0,10}$/.test(value)) {
      setForm({ ...form, [name]: value });
    }
  } else if (name === "licenseNumber") {
    // Allow only letters and numbers
    if (/^[0-9]{0,12}$/.test(value)) {
      setForm({ ...form, [name]: value });
    }
  } else {
    setForm({ ...form, [name]: value });
  }
};
 


  // Open modal to add driver
  const handleAdd = () => {
    setEditingDriver(null);
    setForm({
      name: "",
      email: "",
      phone: "",
      licenseNumber: "",
      status: "Active",
    });
    setShowModal(true);
  };

  // Open modal to edit driver
  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setForm(driver);
    setShowModal(true);
  };

  // Submit form (Add/Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await axios.put(`http://localhost:8000/api/drivers/${editingDriver._id}`, form);
        toast.success("Driver updated successfully");
      } else {
        await axios.post("http://localhost:8000/api/drivers", form);
        toast.success("Driver added successfully");
      }
      setShowModal(false);
      fetchDrivers();
    } catch (err) {
      console.error(err);
      toast.error("Error saving driver");
    }
  };

  // Delete driver
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this driver?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/drivers/${id}`);
      toast.success("Driver deleted successfully");
      setDrivers(drivers.filter((d) => d._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Error deleting driver");
    }
  };

  // Generate PDF report
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Title
      doc.setFontSize(25);
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(245, 158, 11); // amber-500 (yellow tone)
      doc.text("UTPMS", 105, 25, { align: "center" });

            doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text("University Transport & Parking System", 105, 32, { align: "center" });
      doc.text(`Driver Report`, 105, 37, { align: "center" });

      doc.setLineWidth(0.5);
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.line(14, 43, 196, 43);

            // Summary Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("DRIVERS", 105, 60, { align: "center" });
    
    
    // Table data
    const tableData = filteredDrivers.map(driver => [
      driver.name,
      driver.email,
      driver.phone,
      driver.licenseNumber,
      driver.status
    ]);

    // AutoTable
    autoTable(doc, {
      head: [['Name', 'Email', 'Phone', 'License Number', 'Status']],
      body: tableData,
      startY: 66,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: 30 }
    });

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      //doc.text(`Page ${i} of ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: "center" });
    }

    let finalY = doc.lastAutoTable.finalY || 66;
doc.setTextColor(0, 0, 0);
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

    doc.save(`drivers-report-${new Date().toISOString().split('T')[0]}.pdf`);
    toast.success("PDF report generated successfully!");
  };

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen  p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-800">Bus Drivers Management</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:from-blue-600 hover:to-blue-700"
              onClick={handleAdd}
            >
              <FaPlus className="text-sm" /> Add Driver
            </button>
            <button
              className="bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:from-green-500 hover:to-green-600"
              onClick={generatePDF}
            >
              <MdFileDownload className="text-sm" /> Generate PDF
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="relative w-full lg:w-96">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search drivers by name, email or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />
          </div>
          <div className="flex gap-4 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
              Total: {drivers.length}
            </span>
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-medium">
              Active: {drivers.filter(d => d.status === 'Active').length}
            </span>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
              Inactive: {drivers.filter(d => d.status === 'Inactive').length}
            </span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-2">⚠️ {error}</div>
            <button 
              onClick={fetchDrivers}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              {searchTerm ? "No drivers match your search" : "No drivers found"}
            </div>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full" ref={tableRef}>
              <thead className="bg-gradient-to-r from-yellow-100 to-yellow-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Driver
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    License
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrivers.map((driver) => (
                  <tr key={driver._id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{driver.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{driver.email}</div>
                      <div className="text-sm text-gray-500">{driver.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-mono text-gray-700">{driver.licenseNumber}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        driver.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {driver.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-3">
                        <button
                          className="text-blue-600 hover:text-blue-900 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                          onClick={() => handleEdit(driver)}
                          title="Edit driver"
                        >
                          <FaEdit className="text-lg" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors duration-200 p-2 rounded-lg hover:bg-red-50"
                          onClick={() => handleDelete(driver._id)}
                          title="Delete driver"
                        >
                          <FaTrash className="text-lg" />
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-800">
                {editingDriver ? "Edit Driver" : "Add New Driver"}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Enter phone number"
                  value={form.phone}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">License Number</label>
                <input
                  type="text"
                  name="licenseNumber"
                  placeholder="Enter license number"
                  value={form.licenseNumber}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:from-green-600 hover:to-green-700"
                >
                  <FaSave className="text-sm" /> {editingDriver ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Driver;