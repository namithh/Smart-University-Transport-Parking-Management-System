import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import IncidentForm from "../../component/incident/IncidentForm";
import ROLE from "../../common/role";

const ReportIncident = () => {
  const user = useSelector((state) => state?.user?.user);

  if (!user?._id) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Report an incident</h1>
        <p className="text-gray-600 mb-6">
          Describe what happened. Your report starts as <strong>Pending</strong> and staff will
          review it.
        </p>
        {user?.role === ROLE.ADMIN && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            You are signed in as admin. Students normally use this form; you can still submit a test
            report if needed.
          </p>
        )}
        <IncidentForm />
      </div>
    </div>
  );
};

export default ReportIncident;
