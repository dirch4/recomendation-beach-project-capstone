import React from 'react';
import { Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProfilePage() {
    const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#dcefff] to-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Page Title */}
        <div className="flex items-center space-x-2 mb-8">
            <button
                onClick={() => navigate(-1)}
                className="px-4 py-2 text-sky-900 rounded hover:text-sky-600 transition text-2xl font-semibold"
                >
                ← Back
            </button>

          <div className="w-2 h-6 bg-blue-600 rounded"></div>
          <h1 className="text-2xl font-semibold text-sky-900">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Profile Image and Upload Sections */}
          <div className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="relative w-48 h-48 mx-auto">
                <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
                  <img src="/profile-avatar.png" alt="Profile" className="w-full h-full object-cover" />
                  <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50">
                    <Camera className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Upload Sections */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
                <div className="text-gray-400 text-sm font-medium">LOGO</div>
              </div>
              <div className="bg-white rounded-lg p-6 border-2 border-dashed border-gray-300 text-center">
                <div className="text-gray-400 text-sm font-medium">VENDOR</div>
                <div className="text-gray-400 text-sm font-medium">DOCUMENTS</div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                <p className="text-gray-600">User name</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                <p className="text-gray-600">ml@xpaytech.co</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number:</label>
                <p className="text-gray-600">+20-01274318900</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address:</label>
                <p className="text-gray-600">285 N Broad St, Elizabeth, NJ 07208, USA</p>
              </div>

              <div className="pt-4">
                <button className="w-full border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50 transition">
                  ✏️ EDIT PROFILE
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
