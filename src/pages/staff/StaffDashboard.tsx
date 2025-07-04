import React from 'react';

const StaffDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Staff Dashboard</h1>
      
      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">My Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Campaign Support", count: 3, color: "bg-blue-100 text-blue-800" },
            { title: "Volunteer Coordination", count: 5, color: "bg-green-100 text-green-800" },
            { title: "Reports Due", count: 2, color: "bg-yellow-100 text-yellow-800" }
          ].map((item, idx) => (
            <div key={idx} className="border rounded-lg p-4 flex items-center">
              <div className="flex-1">
                <h3 className="font-medium">{item.title}</h3>
                <p className="text-gray-600">{item.count} pending tasks</p>
              </div>
              <span className={`px-3 py-1 ${item.color} rounded-full text-sm font-medium`}>
                {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Campaigns */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Upcoming Campaigns</h2>
        <div className="space-y-4">
          {[
            { 
              name: "Beach Cleanup Initiative", 
              date: "Jul 15, 2024", 
              volunteers: 12, 
              status: "Preparation" 
            },
            { 
              name: "Food Drive - Summer Program", 
              date: "Jul 22, 2024", 
              volunteers: 8, 
              status: "Registration" 
            },
            { 
              name: "School Supplies Drive", 
              date: "Aug 5, 2024", 
              volunteers: 15, 
              status: "Planning" 
            }
          ].map((campaign, idx) => (
            <div key={idx} className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">{campaign.name}</h3>
                <p className="text-gray-600">{campaign.date} • {campaign.volunteers} volunteers</p>
              </div>
              <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                {campaign.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Add Volunteer", icon: "👥" },
            { label: "Create Report", icon: "📝" },
            { label: "Check Inventory", icon: "📦" },
            { label: "Request Support", icon: "🆘" }
          ].map((action, idx) => (
            <button 
              key={idx}
              className="flex flex-col items-center justify-center p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">{action.icon}</span>
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;