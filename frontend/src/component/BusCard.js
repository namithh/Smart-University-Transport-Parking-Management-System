import React from 'react';

const BusCard = ({ bus, onBook }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-gray-800">{bus.bus_number}</h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
            {bus.bus_type}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-600">Departure</p>
            <p className="font-semibold">{bus.departure_time}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Arrival</p>
            <p className="font-semibold">{bus.arrival_time}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-sm text-gray-600">Route</p>
          <p className="font-semibold">{bus.route?.route_name || 'N/A'}</p>
          <p className="text-sm text-gray-500">
            {bus.route?.start_location} to {bus.route?.end_location}
          </p>
        </div>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-sm text-gray-600">Available Seats</p>
            <p className="font-semibold text-green-600">{bus.available_seats}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Fare</p>
            <p className="font-bold text-xl text-blue-600">
              ${bus.route?.price || 0}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => onBook(bus)}
          disabled={bus.available_seats === 0}
          className={`w-full py-2 px-4 rounded-md font-medium ${
            bus.available_seats === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {bus.available_seats === 0 ? 'No Seats Available' : 'Book Now'}
        </button>
      </div>
    </div>
  );
};

export default BusCard;