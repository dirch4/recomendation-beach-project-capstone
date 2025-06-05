import React, { useState, useEffect } from 'react';
import { Camera, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import profile1 from '../../assets/profile1.jpg';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, setUser } = useAuth();

  const [editMode, setEditMode] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.name || '');
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('http://localhost:5000/user/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch user data");
        const data = await res.json();
        setUser(prev => ({
          ...prev,
          name: data.name,
          email: data.email,
        }));
        setNewUsername(data.name);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load user data.");
      }
    };

    if (token) {
      fetchUser();
    }
  }, [token, setUser]);

  const handleSaveChanges = async () => {
    const { currentPassword, newPassword, confirmNewPassword } = passwords;
    const usernameChanged = newUsername.trim() !== user?.name?.trim();
    const wantToChangePassword = currentPassword || newPassword || confirmNewPassword;

    if (!usernameChanged && !wantToChangePassword) {
      return toast('⚠️ Nothing to update.');
    }

    // Validasi password
    if (wantToChangePassword) {
      if (!currentPassword || !newPassword || !confirmNewPassword) {
        return toast.error("All password fields are required.");
      }
      if (newPassword !== confirmNewPassword) {
        return toast.error("New passwords do not match.");
      }
    }

    // Validasi username
    if (usernameChanged && newUsername.trim().length < 3) {
      return toast.error("Username must be at least 3 characters.");
    }

    try {
      setLoading(true);
      let success = false;

      // Update username
      if (usernameChanged) {
        const res = await fetch('http://localhost:5000/user/update-username', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ newUsername }),
        });

        const data = await res.json();
        if (res.ok) {
          setUser(prev => ({ ...prev, name: newUsername }));
          toast.success("Username updated successfully");
          success = true;
        } else {
          toast.error(data.message || "Failed to update username");
        }
      }

      // Update password
      if (wantToChangePassword) {
        const res = await fetch('http://localhost:5000/user/update-password', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword,
            confirmNewPassword,
          }),
        });

        const data = await res.json();
        if (res.ok) {
          toast.success("Password updated successfully");
          setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
          success = true;
        } else {
          toast.error(data.message || "Failed to update password");
        }
      }

      if (success) {
        setEditMode(false);
      }

    } catch {
      toast.error("Network error while updating profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#dcefff] to-white p-3">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
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

        <div className="flex justify-center items-center">
          <div className="bg-white rounded-lg p-8 shadow-md border border-gray-200 flex flex-col items-center max-w-md w-full space-y-6">
            {/* FOTO PROFIL */}
            <div className="relative w-32 h-32">
              <img
                src={user?.profilePic || profile1}
                alt="Profile"
                className="w-full h-full object-cover rounded-full border border-gray-300"
              />
            </div>

            {/* INFO USER / MODE EDIT */}
            {!editMode ? (
              <>
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name:</label>
                  <p className="text-gray-600">{user?.name || '-'}</p>
                </div>
                <div className="text-center">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email:</label>
                  <p className="text-gray-600">{user?.email || '-'}</p>
                </div>
                <button
                  onClick={() => setEditMode(true)}
                  className="w-full bg-sky-900 text-sky-100 border hover:border-blue-600 hover:bg-white hover:text-blue-600 px-4 py-2 rounded transition"
                >
                  ✏️ EDIT PROFILE
                </button>
              </>
            ) : (
              <>
                {/* Username Edit */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Username:</label>
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full border rounded p-2"
                  />
                </div>

                {/* Password Edit */}
                <div className="w-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password:</label>
                  <input
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">New Password:</label>
                  <input
                    type="password"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                  <label className="block text-sm font-medium text-gray-700 mb-1 mt-2">Confirm New Password:</label>
                  <input
                    type="password"
                    value={passwords.confirmNewPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                    className="w-full border rounded p-2"
                  />
                </div>

                {/* Save & Cancel */}
                <button
                  onClick={handleSaveChanges}
                  disabled={loading}
                  className="mt-4 w-full bg-sky-800 text-white px-4 py-2 rounded hover:bg-sky-700 flex justify-center items-center gap-2"
                >
                  {loading && <Loader2 className="animate-spin w-4 h-4" />}
                  Save Changes
                </button>

                <button
                  onClick={() => {
                    setEditMode(false);
                    setNewUsername(user?.name || '');
                    setPasswords({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
                  }}
                  className="w-full mt-2 border border-gray-400 text-gray-700 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
