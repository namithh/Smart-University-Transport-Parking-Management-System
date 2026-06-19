const backendDomain = "http://localhost:8000"

const SummaryApi = {
    signUP : {
        url: `${backendDomain}/api/signup`,
        method: "POST"
    },
    signIN : {
        url: `${backendDomain}/api/signin`,
        method: "POST"
    },
    current_user : {
        url : `${backendDomain}/api/user-details`,
        method: "GET"
    },
    logout : {
        url : `${backendDomain}/api/userLogout`,
        method: "GET"
    },
    allUser : {
        url : `${backendDomain}/api/all-user`,
        method: "GET"
    },
    updateUser : {
        url : `${backendDomain}/api/update-user`,
        method: "POST"
    },
        updateUserdetails : {
    url : `${backendDomain}/api/update-userdetails`,
    method: "PUT"
},
    deleteUser: {
        url: `${backendDomain}/api/delete-User`,
        method: "POST"
    },
    getFinancialRecords: {
    url: `${backendDomain}/api/financial`,
    method: "GET"
  },
  getFinancialSummary: {
    url: `${backendDomain}/api/financial/summary`,
    method: "GET"
  },
  addFinancialRecord: {
    url: `${backendDomain}/api/financial`,
    method: "POST"
  },
  updateFinancialRecord: {
    url: (id) => `${backendDomain}/api/financial/${id}`,
    method: "PUT"
  },
  deleteFinancialRecord: {
    url: (id) => `${backendDomain}/api/financial/${id}`,
    method: "DELETE"
  },
  parkingOverview: {
    url: `${backendDomain}/api/parking/overview`,
    method: "GET"
  },
  parkingZones: {
    url: `${backendDomain}/api/parking/zones`,
    method: "GET"
  },
  parkingCreateReservation: {
    url: `${backendDomain}/api/parking/reservations`,
    method: "POST"
  },
  parkingMyReservations: {
    url: `${backendDomain}/api/parking/my-reservations`,
    method: "GET"
  },
  parkingReservationCancel: {
    url: (reservationId) => `${backendDomain}/api/parking/reservations/${reservationId}/cancel`,
    method: "POST"
  },
  parkingReservationCheckIn: {
    url: (reservationId) => `${backendDomain}/api/parking/reservations/${reservationId}/check-in`,
    method: "POST"
  },
  parkingReservationCheckOut: {
    url: (reservationId) => `${backendDomain}/api/parking/reservations/${reservationId}/check-out`,
    method: "POST"
  },
  adminParkingDashboard: {
    url: `${backendDomain}/api/parking/admin/dashboard`,
    method: "GET"
  },
  adminParkingZones: {
    url: `${backendDomain}/api/parking/admin/zones`,
    method: "GET"
  },
  adminParkingSlots: {
    url: `${backendDomain}/api/parking/admin/slots`,
    method: "GET"
  },
  adminParkingReservations: {
    url: `${backendDomain}/api/parking/admin/reservations`,
    method: "GET"
  },
  adminParkingUsage: {
    url: `${backendDomain}/api/parking/admin/usage`,
    method: "GET"
  },
  adminParkingSeed: {
    url: `${backendDomain}/api/parking/admin/seed`,
    method: "POST"
  }
}

export default SummaryApi
