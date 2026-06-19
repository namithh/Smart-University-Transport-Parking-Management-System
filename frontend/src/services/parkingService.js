import SummaryApi from "../common";

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

const request = async ({ url, method = "GET", body }) => {
  const response = await fetch(url, {
    method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Parking request failed");
  }

  return data.data;
};

export const fetchParkingOverview = (filters = {}) =>
  request({
    url: `${SummaryApi.parkingOverview.url}${buildQuery(filters)}`,
    method: SummaryApi.parkingOverview.method,
  });

export const fetchParkingZones = () =>
  request({
    url: `${SummaryApi.parkingZones.url}${buildQuery({ activeOnly: true })}`,
    method: SummaryApi.parkingZones.method,
  });

export const createParkingReservation = (payload) =>
  request({
    url: SummaryApi.parkingCreateReservation.url,
    method: SummaryApi.parkingCreateReservation.method,
    body: payload,
  });

export const fetchMyParkingReservations = (filters = {}) =>
  request({
    url: `${SummaryApi.parkingMyReservations.url}${buildQuery(filters)}`,
    method: SummaryApi.parkingMyReservations.method,
  });

export const cancelParkingReservation = (reservationId) =>
  request({
    url: SummaryApi.parkingReservationCancel.url(reservationId),
    method: SummaryApi.parkingReservationCancel.method,
  });

export const checkInParkingReservation = (reservationId) =>
  request({
    url: SummaryApi.parkingReservationCheckIn.url(reservationId),
    method: SummaryApi.parkingReservationCheckIn.method,
  });

export const checkOutParkingReservation = (reservationId) =>
  request({
    url: SummaryApi.parkingReservationCheckOut.url(reservationId),
    method: SummaryApi.parkingReservationCheckOut.method,
  });

export const fetchAdminParkingDashboard = (filters = {}) =>
  request({
    url: `${SummaryApi.adminParkingDashboard.url}${buildQuery(filters)}`,
    method: SummaryApi.adminParkingDashboard.method,
  });

export const fetchAdminParkingZones = () =>
  request({
    url: SummaryApi.adminParkingZones.url,
    method: SummaryApi.adminParkingZones.method,
  });

export const createAdminParkingZone = (payload) =>
  request({
    url: SummaryApi.adminParkingZones.url,
    method: "POST",
    body: payload,
  });

export const updateAdminParkingZone = (zoneId, payload) =>
  request({
    url: `${SummaryApi.adminParkingZones.url}/${zoneId}`,
    method: "PUT",
    body: payload,
  });

export const deleteAdminParkingZone = (zoneId) =>
  request({
    url: `${SummaryApi.adminParkingZones.url}/${zoneId}`,
    method: "DELETE",
  });

export const fetchAdminParkingSlots = (filters = {}) =>
  request({
    url: `${SummaryApi.adminParkingSlots.url}${buildQuery(filters)}`,
    method: SummaryApi.adminParkingSlots.method,
  });

export const createAdminParkingSlot = (payload) =>
  request({
    url: SummaryApi.adminParkingSlots.url,
    method: "POST",
    body: payload,
  });

export const bulkCreateAdminParkingSlots = (payload) =>
  request({
    url: `${SummaryApi.adminParkingSlots.url}/bulk`,
    method: "POST",
    body: payload,
  });

export const updateAdminParkingSlot = (slotId, payload) =>
  request({
    url: `${SummaryApi.adminParkingSlots.url}/${slotId}`,
    method: "PUT",
    body: payload,
  });

export const updateAdminParkingSlotStatus = (slotId, status) =>
  request({
    url: `${SummaryApi.adminParkingSlots.url}/${slotId}/status`,
    method: "PATCH",
    body: { status },
  });

export const deleteAdminParkingSlot = (slotId) =>
  request({
    url: `${SummaryApi.adminParkingSlots.url}/${slotId}`,
    method: "DELETE",
  });

export const fetchAdminParkingReservations = (filters = {}) =>
  request({
    url: `${SummaryApi.adminParkingReservations.url}${buildQuery(filters)}`,
    method: SummaryApi.adminParkingReservations.method,
  });

export const fetchAdminParkingUsage = (filters = {}) =>
  request({
    url: `${SummaryApi.adminParkingUsage.url}${buildQuery(filters)}`,
    method: SummaryApi.adminParkingUsage.method,
  });

export const adminCancelParkingReservation = (reservationId) =>
  request({
    url: `${SummaryApi.adminParkingReservations.url}/${reservationId}/cancel`,
    method: "POST",
  });

export const adminCheckInParkingReservation = (reservationId) =>
  request({
    url: `${SummaryApi.adminParkingReservations.url}/${reservationId}/check-in`,
    method: "POST",
  });

export const adminCheckOutParkingReservation = (reservationId) =>
  request({
    url: `${SummaryApi.adminParkingReservations.url}/${reservationId}/check-out`,
    method: "POST",
  });

export const seedAdminParkingData = () =>
  request({
    url: SummaryApi.adminParkingSeed.url,
    method: SummaryApi.adminParkingSeed.method,
  });
