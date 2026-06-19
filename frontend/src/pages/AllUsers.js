import React, { useEffect, useState } from 'react'
import SummaryApi from '../common'
import { toast } from 'react-toastify'
import { RiEdit2Fill, RiSearchLine } from "react-icons/ri";
import { MdDelete, MdDownload } from "react-icons/md";
import { FiFilter } from "react-icons/fi";
import { FaUserGroup } from "react-icons/fa6";
import ChangeUserRole from '../component/ChangeUserRole';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


const AllUsers = () => {
    const [allUser, setAllUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortBy, setSortBy] = useState("name");

    const [openUpdateRole, setOpenUpdateRole] = useState(false);
    const [updateUserDetails, setUpdateUserDetails] = useState({
        email: "",
        name: "",
        role: "",
        _id: "",
    });

    //

    const updateUserStatus = async (userId, newStatus) => {
    try {
        const response = await fetch(SummaryApi.updateUser.url, {
            method: SummaryApi.updateUser.method,
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                userId,
                status: newStatus,
            }),
        });

        const data = await response.json();

        if (data.success) {
            toast.success("Status updated successfully");
            fetchAllUsers();
        } else {
            toast.error(data.message || "Failed to update status");
        }
    } catch (error) {
        toast.error("Error updating status");
    }
};

    // Skeleton loader
    const UserCardSkeleton = () => (
        <div className="animate-pulse flex items-center space-x-4 py-4 px-6 border-b border-gray-200">
            <div className="rounded-full bg-gray-300 h-10 w-10"></div>
            <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
            <div className="h-6 bg-gray-300 rounded w-16"></div>
        </div>
    );

    // Confirm delete toast
    const confirmToast = (message, onConfirm) => {
        toast(
            ({ closeToast }) => (
                <div className="p-2">
                    <p className="text-gray-800 font-medium">{message}</p>
                    <div className="flex gap-4 mt-4 justify-end">
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                            onClick={() => {
                                onConfirm();
                                closeToast();
                            }}
                        >
                            Yes, Delete
                        </button>
                        <button
                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md"
                            onClick={closeToast}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ),
            {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
                className: 'toast-confirm'
            }
        );
    };

    // Delete user
    const deleteUser = async (userId, userName) => {
        confirmToast(`Are you sure you want to delete ${userName}?`, async () => {
            try {
                const response = await fetch(SummaryApi.deleteUser.url, {
                    method: SummaryApi.deleteUser.method,
                    credentials: "include",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId })
                });
                const data = await response.json();
                if (data.success) {
                    toast.success("User deleted successfully!");
                    fetchAllUsers();
                } else {
                    toast.error("Failed to delete user.");
                }
            } catch (error) {
                toast.error("An error occurred.");
            }
        });
    };

    // Fetch users
    const fetchAllUsers = async () => {
        setLoading(true);
        try {
            const fetchData = await fetch(SummaryApi.allUser.url, {
                method: SummaryApi.allUser.method,
                credentials: 'include'
            });

            const dataResponse = await fetchData.json();
            if (dataResponse.success) {
                setAllUsers(dataResponse.data);
                setFilteredUsers(dataResponse.data);
            } else {
                toast.error(dataResponse.message);
            }
        } catch (error) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    // Generate PDF Report
    const generateReport = () => {
        const doc = new jsPDF();
        const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

        doc.setFontSize(25);
      doc.setFont("helvetica", "bolditalic");
      doc.setTextColor(245, 158, 11); // amber-500 (yellow tone)
      doc.text("UTPMS", 105, 25, { align: "center" });

      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text("University Transport & Parking System", 105, 32, { align: "center" });
      doc.text(`User Report`, 105, 37, { align: "center" });

      doc.setLineWidth(0.5);
      doc.setDrawColor(245, 158, 11); // amber-500
      doc.line(14, 43, 196, 43);

      // Summary Section
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("USER REPORT", 105, 60, { align: "center" });



        const tableColumn = ["Name", "Email", "Role", "Status"];
        const tableRows = [];

        filteredUsers.forEach(user => {
            tableRows.push([
                user.name,
                user.email,
                user.role,
                "Active"
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


        doc.save("user_report.pdf");
    };

    // Filter + Sort
    useEffect(() => {
        let result = [...allUser];
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(user =>
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query)
            );
        }
        if (roleFilter !== "all") {
            result = result.filter(user => user.role === roleFilter);
        }
        if (statusFilter !== "all") {
            result = result.filter(user => user.status === statusFilter);
        }
        result.sort((a, b) => {
            if (sortBy === "name") return a.name.localeCompare(b.name);
            if (sortBy === "email") return a.email.localeCompare(b.email);
            if (sortBy === "role") return a.role.localeCompare(b.role);
            return 0;
        });
        setFilteredUsers(result);
    }, [allUser, searchQuery, roleFilter, statusFilter, sortBy]);

    useEffect(() => {
        fetchAllUsers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8 flex items-center gap-2">
                    <FaUserGroup className='text-3xl text-blue-500' />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2"> User Management</h1>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-md">
                            <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search users by name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                                <FiFilter className="text-gray-500" />
                                <select
                                    className="bg-transparent outline-none text-gray-700"
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                >
                                    <option value="all">All Roles</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="GENERAL">General</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                                <FiFilter className="text-gray-500" />
                                <select
                                    className="bg-transparent outline-none text-gray-700"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Suspended">Suspended</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
                                <span className="text-gray-700">Sort by:</span>
                                <select
                                    className="bg-transparent outline-none text-gray-700"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option value="name">Name</option>
                                    <option value="email">Email</option>
                                    <option value="role">Role</option>
                                </select>
                            </div>

                            <button
                                onClick={generateReport}
                                className="flex items-center gap-2 font-semibold bg-blue-200 text-blue-700 hover:bg-blue-400 hover:text-white rounded-lg px-4 py-2 transition-colors"
                            >
                                <MdDownload />
                                Generate Report
                            </button>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="p-6">
                            {[...Array(5)].map((_, i) => <UserCardSkeleton key={i} />)}
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-400 text-5xl mb-4">👥</div>
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No users found</h3>
                            <p className="text-gray-500">
                                {searchQuery || roleFilter !== "all"
                                    ? "Try adjusting your search or filter criteria"
                                    : "There are no users in the system yet"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-green-100">
                                    <tr>
                                        <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase">User</th>
                                        <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase">Role</th>
                                        <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
                                        <th className="py-4 px-6 text-right pr-20 text-sm font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredUsers.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-base font-medium text-gray-900">{user.name}</div>
                                                        <div className="text-base text-gray-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6">
    <select
        value={user.status || "Active"}
        onChange={(e) => updateUserStatus(user._id, e.target.value)}
        className={`px-2 py-1 rounded-full text-sm font-semibold outline-none
            ${user.status === 'Active' && 'bg-green-100 text-green-800'}
            ${user.status === 'Inactive' && 'bg-yellow-100 text-yellow-800'}
            ${user.status === 'Suspended' && 'bg-red-100 text-red-800'}
        `}
    >
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
        <option value="Suspended">Suspended</option>
    </select>
</td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setUpdateUserDetails(user);
                                                            setOpenUpdateRole(true);
                                                        }}
                                                        className="text-green-600 bg-green-100 hover:text-white p-2 rounded-lg hover:bg-green-400 flex items-center gap-2"
                                                    >
                                                        <RiEdit2Fill size={18} /> Edit
                                                    </button>
                                                    <button
                                                        onClick={() => deleteUser(user._id, user.name)}
                                                        className="text-red-600 bg-red-100 hover:text-white p-2 rounded-lg hover:bg-red-400 flex items-center gap-2"
                                                    >
                                                        <MdDelete size={18} /> Delete
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

            {/* Edit Role Modal */}
            {openUpdateRole && (
                <ChangeUserRole
                    onClose={() => setOpenUpdateRole(false)}
                    name={updateUserDetails.name}
                    email={updateUserDetails.email}
                    role={updateUserDetails.role}
                    userId={updateUserDetails._id}
                    callFunc={fetchAllUsers}
                />
            )}
        </div>
    );
}

export default AllUsers;
