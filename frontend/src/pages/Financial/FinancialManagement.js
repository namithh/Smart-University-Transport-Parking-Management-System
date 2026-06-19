import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  MdOutlineDelete,
  MdSearch,
  MdDownload,
  MdEdit,
  MdAdd,
  MdArrowUpward,
  MdArrowDownward,
} from "react-icons/md";
import { motion } from "framer-motion";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import SummaryApi from "../../common/";

const FinancialManagement = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [newRecord, setNewRecord] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "Income",
    category: "",
    description: "",
    amount: "",
    paymentMethod: "Cash",
  });
  const [editRecord, setEditRecord] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);

  const types = ["Income", "Outcome"];
  const categories = {
    Income: [
      "Ticket Sales",
      "Online Bookings",
      "Package Delivery",
      "Other Income",
    ],
    Outcome: [
      "Maintenance",
      "Fuel",
      "Staff Salaries",
      "Administrative Expenses",
      "Insurance",
      "Taxes",
      "Other Expenses",
    ],
  };
  const paymentMethods = [
    "Cash",
    "Bank Transfer",
    "Card Payment",
    "Digital Wallet",
  ];

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i
  );

  const fetchRecords = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        `${SummaryApi.getFinancialRecords.url}?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: SummaryApi.getFinancialRecords.method,
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
        setFilteredRecords(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching financial records");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch(
        `${SummaryApi.getFinancialSummary.url}?month=${selectedMonth}&year=${selectedYear}`,
        {
          method: SummaryApi.getFinancialSummary.method,
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setSummary(data.data);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error fetching financial summary");
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchSummary();
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredRecords(records);
    } else {
      const filtered = records.filter(
        (record) =>
          record.description
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          record.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.paymentMethod.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [searchQuery, records]);

  const generateFinancialReport = () => {
    if (filteredRecords.length === 0) {
      toast.error("No financial records available to generate report");
      return;
    }

    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Header Section with yellow color palette
      doc.setFontSize(25);
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(245, 158, 11); // amber-500 (yellow tone)
      doc.text("UTPMS", 105, 25, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text("University Transport & Parking System", 105, 32, {
        align: "center",
      });
      doc.text(
        `Financial Report for ${months[selectedMonth - 1]} ${selectedYear}`,
        105,
        37,
        { align: "center" }
      );

      doc.setLineWidth(0.5);
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.line(14, 43, 196, 43);

      // Summary Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("FINANCIAL SUMMARY", 105, 55, { align: "center" });

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      doc.text(`Report Generated: ${currentDate}`, 14, 65);
      doc.text(`Total Records: ${filteredRecords.length}`, 160, 65, {
        align: "right",
      });

      // Financial Summary
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Financial Overview", 14, 75);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Total Income: Rs. ${summary?.totalIncome?.toFixed(2) || "0.00"}`,
        14,
        85
      );
      doc.text(
        `Total Expenses: Rs. ${summary?.totalOutcome?.toFixed(2) || "0.00"}`,
        14,
        90
      );
      doc.text(
        `Net Profit: Rs. ${summary?.netProfit?.toFixed(2) || "0.00"}`,
        14,
        95
      );

      let yPos = 110;
      if (summary?.categoryBreakdown) {
        doc.setFont("helvetica", "bold");
        doc.text("Category Breakdown:", 14, yPos);
        yPos += 7;

        doc.setFont("helvetica", "normal");
        Object.entries(summary.categoryBreakdown).forEach(
          ([category, data]) => {
            if (data.income > 0) {
              doc.text(
                `${category}: Rs. ${data.income.toFixed(2)} (Income)`,
                20,
                yPos
              );
              yPos += 7;
            }
            if (data.outcome > 0) {
              doc.text(
                `${category}: Rs. ${data.outcome.toFixed(2)} (Expense)`,
                20,
                yPos
              );
              yPos += 7;
            }
          }
        );
      }

      // Financial Records Table
      yPos += 10;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("DETAILED FINANCIAL RECORDS", 14, yPos);
      yPos += 10;

      const tableColumns = [
        "Date",
        "Type",
        "Category",
        "Description",
        "Amount",
        "Payment Method",
      ];
      const tableRows = filteredRecords.map((record) => [
        new Date(record.date).toLocaleDateString(),
        record.type,
        record.category,
        record.description.length > 30
          ? record.description.substring(0, 30) + "..."
          : record.description,
        `Rs. ${record.amount.toFixed(2)}`,
        record.paymentMethod,
      ]);

      autoTable(doc, {
        head: [tableColumns],
        body: tableRows,
        startY: yPos,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: {
          fillColor: [245, 158, 11], // amber-500 (yellow tone)
          textColor: [0, 0, 0], // black text for better contrast
          fontStyle: "bold",
        },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 20 },
          2: { cellWidth: 25 },
          3: { cellWidth: 45 },
          4: { cellWidth: 20, halign: "right" },
          5: { cellWidth: 25 },
        },
        alternateRowStyles: { fillColor: [254, 243, 199] }, // amber-100 (light yellow)
        margin: { left: 14 },
      });

      // Footer
      const finalY = doc.lastAutoTable.finalY + 15;
      // Signature / Approval Section
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");
      doc.text(".................................", 14, finalY + 30);
      doc.text("Authorized Signature", 14, finalY + 40);

      doc.text(".................................", 140, finalY + 30);
      doc.text("Checked By", 148, finalY + 40);

      // Page number
      doc.setFontSize(9);
      doc.text(`Page 1 of 1`, 180, 280);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 280);

      // Save the PDF
      doc.save(
        `Financial_Report_${
          months[selectedMonth - 1]
        }_${selectedYear}.pdf`
      );
      toast.success("Financial report downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate report. Please try again.");
    }
  };

  const handleAddRecord = async () => {
    if (
      !newRecord.date ||
      !newRecord.category ||
      !newRecord.description ||
      !newRecord.amount
    ) {
      return toast.error("Please fill in all required fields!");
    }

    try {
      const response = await fetch(SummaryApi.addFinancialRecord.url, {
        method: SummaryApi.addFinancialRecord.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRecord),
      });

      const data = await response.json();
      if (data.success) {
        toast.success("Financial record added successfully!");
        fetchRecords();
        fetchSummary();
        setNewRecord({
          date: new Date().toISOString().split("T")[0],
          type: "Income",
          category: "",
          description: "",
          amount: "",
          paymentMethod: "Cash",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error adding financial record");
    }
  };

  const handleUpdateRecord = async () => {
    if (
      !editRecord.date ||
      !editRecord.category ||
      !editRecord.description ||
      !editRecord.amount
    ) {
      return toast.error("Please fill in all required fields!");
    }

    try {
      const response = await fetch(
        SummaryApi.updateFinancialRecord.url(editRecord._id),
        {
          method: SummaryApi.updateFinancialRecord.method,
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editRecord),
        }
      );

      const data = await response.json();
      if (data.success) {
        toast.success("Financial record updated successfully!");
        fetchRecords();
        fetchSummary();
        setEditRecord(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Error updating financial record");
    }
  };

  const handleDeleteRecord = async (id) => {
    toast.info(
      <div className="p-4">
        <p className="text-gray-800 font-medium text-lg mb-3">
          Are you sure you want to delete this financial record?
        </p>
        <p className="text-gray-600 text-sm mb-4">
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-4 mt-4">
          <button
            onClick={async () => {
              try {
                const response = await fetch(
                  SummaryApi.deleteFinancialRecord.url(id),
                  {
                    method: SummaryApi.deleteFinancialRecord.method,
                    credentials: "include",
                  }
                );
                const data = await response.json();
                if (data.success) {
                  toast.success("Financial record deleted successfully!");
                  fetchRecords();
                  fetchSummary();
                } else {
                  toast.error(data.message);
                }
              } catch (error) {
                toast.error("Error deleting financial record");
              }
              toast.dismiss();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Delete
          </button>
          <button
            onClick={() => {
              toast.dismiss();
              toast.info("Deletion canceled");
            }}
            className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-xl transition-colors shadow-md hover:shadow-lg"
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        className: "shadow-xl rounded-xl",
      }
    );
  };

  const openEditModal = (record) => {
    setEditRecord({ ...record });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-3xl min-h-screen">
      <div className="bg-white py-5 px-6 flex flex-col md:flex-row justify-between items-center rounded-3xl shadow-lg">
        <h2 className="font-bold text-2xl text-gray-800 mb-4 md:mb-0">
          Financial Management
        </h2>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded-xl bg-white px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {months.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>

            <select
              className="border border-gray-300 rounded-xl bg-white px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MdSearch className="text-gray-400 text-xl" />
            </div>
            <input
              type="text"
              placeholder="Search records by description, category, payment method..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <motion.button
            onClick={generateFinancialReport}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg whitespace-nowrap"
            disabled={isLoading || filteredRecords.length === 0}
          >
            <MdDownload className="text-white text-xl" />
            <span className="hidden sm:inline">Generate Report</span>
          </motion.button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Income
              </h3>
              <MdArrowUpward className="text-green-500 text-2xl" />
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">
              {formatCurrency(summary.totalIncome)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                Total Expenses
              </h3>
              <MdArrowDownward className="text-red-500 text-2xl" />
            </div>
            <p className="text-2xl font-bold text-red-600 mt-2">
              {formatCurrency(summary.totalOutcome)}
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">
                Net Profit
              </h3>
              <span
                className={`text-2xl ${
                  summary.netProfit >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {summary.netProfit >= 0 ? "↑" : "↓"}
              </span>
            </div>
            <p
              className={`text-2xl font-bold mt-2 ${
                summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(summary.netProfit)}
            </p>
          </div>
        </div>
      )}

      <div className="mt-6 bg-white p-5 rounded-3xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          Add New Financial Record
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={newRecord.date}
              onChange={(e) =>
                setNewRecord({ ...newRecord, date: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={newRecord.type}
              onChange={(e) =>
                setNewRecord({
                  ...newRecord,
                  type: e.target.value,
                  category: "",
                })
              }
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={newRecord.category}
              onChange={(e) =>
                setNewRecord({ ...newRecord, category: e.target.value })
              }
            >
              <option value="" disabled>
                Select Category
              </option>
              {categories[newRecord.type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <input
              type="text"
              placeholder="Enter description"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={newRecord.description}
              onChange={(e) =>
                setNewRecord({ ...newRecord, description: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (Rs.) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="Enter amount"
              className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={newRecord.amount}
              onChange={(e) =>
                setNewRecord({ ...newRecord, amount: e.target.value })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Payment Method *
            </label>
            <select
              className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
              value={newRecord.paymentMethod}
              onChange={(e) =>
                setNewRecord({ ...newRecord, paymentMethod: e.target.value })
              }
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <motion.button
              className="w-full bg-green-500 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
              onClick={handleAddRecord}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={
                !newRecord.date ||
                !newRecord.category ||
                !newRecord.description ||
                !newRecord.amount ||
                isLoading
              }
            >
              <MdAdd className="text-white text-xl" />
              <span>Add Record</span>
            </motion.button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8 bg-white rounded-3xl shadow-lg p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="mt-8 bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-yellow-100">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"
                  >
                    Category
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-left text-xs font-medium text-slate-600 uppercase tracking-wider"
                  >
                    Payment Method
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-4 text-right text-xs font-medium text-slate-600 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecords.length > 0 ? (
                  filteredRecords.map((record) => (
                    <tr
                      key={record._id}
                      className="hover:bg-amber-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            record.type === "Income"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {record.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {record.category}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-xs truncate">
                        {record.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span
                          className={
                            record.type === "Income"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {formatCurrency(record.amount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {record.paymentMethod}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-amber-600 hover:text-amber-800 p-2 rounded-full hover:bg-amber-100 transition-colors"
                            onClick={() => openEditModal(record)}
                            title="Edit Record"
                          >
                            <MdEdit className="text-xl" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                            onClick={() => handleDeleteRecord(record._id)}
                            title="Delete Record"
                          >
                            <MdOutlineDelete className="text-xl" />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-4 text-center text-sm text-gray-500"
                    >
                      {searchQuery
                        ? "No financial records match your search."
                        : "No financial records available for the selected period."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {editRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Edit Financial Record
              </h3>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={new Date(editRecord.date).toISOString().split("T")[0]}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={editRecord.type}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      type: e.target.value,
                      category: "",
                    })
                  }
                >
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={editRecord.category}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, category: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories[editRecord.type].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={editRecord.description}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (Rs.) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border p-3 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={editRecord.amount}
                  onChange={(e) =>
                    setEditRecord({ ...editRecord, amount: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  className="w-full border p-3 rounded-xl bg-white focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all"
                  value={editRecord.paymentMethod}
                  onChange={(e) =>
                    setEditRecord({
                      ...editRecord,
                      paymentMethod: e.target.value,
                    })
                  }
                >
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>
                      {method}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={() => setEditRecord(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRecord}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors shadow-md hover:shadow-lg"
                disabled={
                  !editRecord.date ||
                  !editRecord.category ||
                  !editRecord.description ||
                  !editRecord.amount
                }
              >
                Update Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;
