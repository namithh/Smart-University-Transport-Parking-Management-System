import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from "html5-qrcode";
import { ToastContainer, toast } from 'react-toastify';
import { IoQrCodeSharp } from "react-icons/io5";
//import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from 'recharts';

function Scanner() {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [passengerRecords, setPassengerRecords] = useState([]);
    const [scanResults, setScanResults] = useState(new Set());
    const [chartData, setChartData] = useState([]);
    const [scanning, setScanning] = useState(true);

    // Fetch passenger records based on selected date
    async function fetchPassengerRecords() {
        try {
            const response = await fetch(`http://localhost:8000/api/attendance/records/${selectedDate}`);
            const data = await response.json();
            if (response.ok) {
                setPassengerRecords(data);
            } else {
                toast.error("Failed to fetch booking records");
            }
        } catch (error) {
            toast.error("Server error. Try again!");
        }
    }

    // Fetch chart data for the past 30 days
    async function fetchChartData() {
        try {
            const days = 30;
            const chartTemp = [];

            for (let i = 0; i < days; i++) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                const formattedDate = date.toISOString().split('T')[0];

                const res = await fetch(`http://localhost:8000/api/attendance/records/${formattedDate}`);
                const data = await res.json();

                chartTemp.push({
                    date: formattedDate,
                    count: res.ok ? data.length : 0,
                });
            }

            setChartData(chartTemp.reverse());
        } catch (error) {
            console.error("Error fetching chart data:", error);
        }
    }

    useEffect(() => {
        fetchPassengerRecords();
        fetchChartData();
    }, [selectedDate]);

    useEffect(() => {
        let scanner;
        
        if (scanning) {
            scanner = new Html5QrcodeScanner('reader', {
                qrbox: { width: 300, height: 300 },
                fps: 5,
            });

            scanner.render(success, error);

            async function success(result) {
                const scanTime = new Date().toLocaleString();

                if (!scanResults.has(result)) {
                    scanResults.add(result);
                    setScanResults(new Set(scanResults));

                    try {
                        const response = await fetch('http://localhost:8000/api/attendance/mark', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ memberId: result }),
                        });

                        const data = await response.json();
                        if (response.ok) {
                            toast.success(`Passenger marked for ${result}`, {
                                position: "top-right",
                                autoClose: 3000
                            });
                            const beepSound = new Audio('/beep.wav');
                            beepSound.play();
                        } else {
                            toast.error(data.message || "Error marking Passenger");
                        }

                        fetchPassengerRecords();
                        fetchChartData();
                    } catch (error) {
                        toast.error("Server error. Try again!");
                    }
                }
            }

            function error(err) {
                // Don't show error messages when just not scanning
                if (err !== "NotFoundException: No MultiFormat Readers were able to detect the code.") {
                    console.warn(err);
                }
            }
        }

        return () => {
            if (scanner) {
                scanner.clear();
            }
        };
    }, [scanning]);

    const toggleScanning = () => {
        setScanning(!scanning);
    };

    const downloadReport = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text("UTPMS", 14, 15);
        doc.setFontSize(14);
        doc.text(`Daily Passenger Report - ${selectedDate}`, 14, 25);

        const tableColumn = ["No.", "Ticket ID", "Scan Time"];
        const tableRows = passengerRecords.map((entry, index) => [
            index + 1,
            entry.memberId,
            new Date(entry.scanTime).toLocaleString()
        ]);

        autoTable(doc, { startY: 35, head: [tableColumn], body: tableRows });
        doc.save(`Booking_Report_${selectedDate}.pdf`);
    };

    return (
        <div className="flex flex-col items-center p-4 bg-yellow-50 min-h-screen">
            {/* Header */}

            <div className="flex items-center justify-center mb-4 gap-4">
                <IoQrCodeSharp className="text-3xl text-blue-600 mr-2" />
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">Ticket Scanner</h2>
            </div>
            

            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-2xl mb-8">
                <h2 className="text-2xl font-semibold mb-4 text-yellow-800 text-center">QR Code Scanner</h2>
                
                <div className="flex justify-center mb-4">
                    <button 
                        onClick={toggleScanning}
                        className={`px-4 py-2 rounded-lg font-semibold ${scanning ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} text-white transition-colors`}
                    >
                        {scanning ? 'Stop Scanning' : 'Start Scanning'}
                    </button>
                </div>

                {scanning && (
                    <div id="reader" className="mb-6 mx-auto w-80 h-80 border-4 border-yellow-400 shadow-lg rounded-lg overflow-hidden"></div>
                )}
                
                {!scanning && (
                    <div className="mb-6 mx-auto w-80 h-80 border-4 border-yellow-400 border-dashed shadow-inner rounded-lg flex items-center justify-center bg-yellow-100">
                        <p className="text-yellow-700 text-center font-medium">Scanner paused<br />Click "Start Scanning" to resume</p>
                    </div>
                )}

                <div className="flex flex-col items-center mt-4">
                    <label htmlFor="date-select" className="text-yellow-700 font-medium mb-2">Select Date:</label>
                    <input
                        id="date-select"
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="mb-4 p-2 border border-yellow-300 rounded-lg shadow-sm bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl mb-8">
                <h3 className="text-xl font-semibold mb-4 text-yellow-800 text-center">Passengers for {selectedDate}</h3>
                
                {passengerRecords.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No passenger records for this date.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-yellow-100">
                                    <th className="border border-yellow-200 p-3 text-yellow-800">No.</th>
                                    <th className="border border-yellow-200 p-3 text-yellow-800">Ticket ID</th>
                                    <th className="border border-yellow-200 p-3 text-yellow-800">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {passengerRecords.map((entry, index) => (
                                    <tr key={index} className={index % 2 === 0 ? 'bg-yellow-50' : 'bg-white'}>
                                        <td className="border border-yellow-200 p-3 text-center">{index + 1}</td>
                                        <td className="border border-yellow-200 p-3 text-center">{entry.memberId}</td>
                                        <td className="border border-yellow-200 p-3 text-center">{new Date(entry.scanTime).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="flex justify-center mt-6">
                    <button
                        onClick={downloadReport}
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg shadow-md transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Report
                    </button>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-4xl mb-8">
                <h3 className="text-xl font-semibold mb-6 text-yellow-800 text-center">Passenger Overview (Last 30 Days)</h3>
                <div className="w-full h-72">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#fde68a" />
                            <XAxis dataKey="date" stroke="#b45309" />
                            <YAxis allowDecimals={false} stroke="#b45309" />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: '#fef3c7', 
                                    borderColor: '#f59e0b', 
                                    borderRadius: '8px',
                                    color: '#78350f'
                                }} 
                                itemStyle={{ color: '#78350f' }}
                            />
                            <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                toastStyle={{ backgroundColor: '#fef3c7', color: '#78350f' }}
            />
        </div>
    );
}

export default Scanner;