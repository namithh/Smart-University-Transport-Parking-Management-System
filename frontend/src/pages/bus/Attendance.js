import React from 'react';
import GenerateQR from '../component/GenerateQR';
import ScanQR from '../component/ScanQR';

const Attendance = () => {
  const userId = 'USER_ID_HERE'; // Replace with dynamic user ID

  return (
    <div>
      <h1>QR Attendance System</h1>
      <GenerateQR userId={userId} />
      <ScanQR />
    </div>
  );
};

export default Attendance;
