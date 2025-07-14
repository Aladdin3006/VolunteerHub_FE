// src/pages/manager/ManagerDashboard.tsx
import React from 'react';

const ManagerDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Campaign Management</h1>
      
      {/* Campaign Post Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Campaign Post</h2>
          <div className="flex space-x-2">
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">Open</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Closed</span>
            <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">Draft</span>
          </div>
        </div>
        
        <div className="border rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Summer Sale 2023, New Product Launch - Summer 2023, Back to School Sale 2023</h3>
            <div className="flex items-center space-x-2">
              <span>Instagram</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Paid</span>
              <span className="text-gray-500">1h ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Active Campaign */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Active Campaign</h2>
        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Back to School Sale 2023 - Students and Teachers Get 20% Off</h3>
            <div className="flex items-center space-x-2">
              <span>Instagram</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Paid</span>
              <span className="text-gray-500">1h ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Partner Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Partner Rebertsen</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b pb-3">
            <div>
              <h3 className="font-medium">Pending Activation Post (Photo)</h3>
              <p className="text-gray-600">Patience Rebertsen</p>
            </div>
            <div>
              <h3 className="font-medium">Activate</h3>
              <p className="text-gray-600">Darnell Steward</p>
            </div>
          </div>
        </div>
      </div>

      {/* Campaign Cards Section */}
      {[
        "$10,000 Google Search Campaign - Brand Terms, Millennial Mom, Luxury Goods Buyers Campaign",
        "Activity Campaign",
        "Post (Photo)",
        "Pay",
        "Approve"
      ].map((title, idx) => (
        <div key={idx} className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
          <div className="border rounded-lg p-4">
            {title === "Activity Campaign" && (
              <div className="flex justify-between items-center">
                <h3 className="font-medium">02 Creators</h3>
                <div className="flex items-center space-x-4">
                  <span className="text-blue-600">Publish</span>
                  <span>Instagram</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">Paid</span>
                  <span>Instagram</span>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">S114 Amount Spend</span>
                  <span className="text-gray-500">Followed Live</span>
                </div>
              </div>
            )}
            
            {title === "Post (Photo)" && (
              <div className="flex justify-between items-center">
                <h3 className="font-medium">Posted on: Oct 28, 2022</h3>
              </div>
            )}
            
            {title === "Pay" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">02 Proposals</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-600">Invited Creators</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Facebook</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Twitter</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Facebook</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Instagram</span>
                  <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">Paid</span>
                  <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">S114 Amount Spend</span>
                  <span className="text-gray-500">Followed Live</span>
                </div>
              </div>
            )}
            
            {title === "Approve" && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">02 Investors</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-gray-600">Invited Creators</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Facebook</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Twitter</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Facebook</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">Instagram</span>
                  <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">Paid</span>
                  <span className="bg-blue-100 px-2 py-1 rounded text-blue-800">S114 Amount Spend</span>
                  <span className="text-gray-500">Followed Live</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ManagerDashboard;