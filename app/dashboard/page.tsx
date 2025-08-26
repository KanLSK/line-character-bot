'use client';

import { useState, useEffect } from 'react';
import { AdminNotification } from '../../types/admin';

export default function AdminDashboard() {
  const [pendingRequests, setPendingRequests] = useState<AdminNotification[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [adminMessage, setAdminMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [adminId] = useState('admin-' + Date.now());

  useEffect(() => {
    fetchPendingRequests();
    const interval = setInterval(fetchPendingRequests, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('/api/admin/requests');
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const respondToUser = async (userId: string) => {
    if (!adminMessage.trim()) {
      alert('Please enter a message');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          adminId,
          message: adminMessage,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setAdminMessage('');
        setSelectedUser(null);
        fetchPendingRequests();
      } else {
        alert('Error sending response');
      }
    } catch (error) {
      console.error('Error responding to user:', error);
      alert('Error sending response');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async (userId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/end-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message);
        setSelectedUser(null);
        fetchPendingRequests();
      } else {
        alert('Error ending session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      alert('Error ending session');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🏥 Siriraj Medical Camp 2025 - Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Manage user requests and provide human support
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pending Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                📋 Pending Requests ({pendingRequests.length})
              </h2>
              
              {pendingRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">✅</div>
                  <p>No pending requests</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.userId}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedUser === request.userId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedUser(request.userId)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            User: {request.userId.substring(0, 8)}...
                          </span>
                          <span
                            className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(
                              request.priority
                            )}`}
                          >
                            {getPriorityIcon(request.priority)} {request.priority}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(request.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {request.userMessage}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Response Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                💬 Respond to User
              </h2>
              
              {selectedUser ? (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Selected User:</p>
                    <p className="font-medium">{selectedUser}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Response:
                    </label>
                    <textarea
                      value={adminMessage}
                      onChange={(e) => setAdminMessage(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      placeholder="Type your response here..."
                    />
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => respondToUser(selectedUser)}
                      disabled={loading || !adminMessage.trim()}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Sending...' : 'Send Response'}
                    </button>
                    <button
                      onClick={() => endSession(selectedUser)}
                      disabled={loading}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      End Session
                    </button>
                  </div>
                  
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setAdminMessage('');
                    }}
                    className="w-full text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">👆</div>
                  <p>Select a user to respond</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={fetchPendingRequests}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-medium">Refresh Requests</div>
            </button>
            <button
              onClick={() => window.open('/api/medical-camp?action=seed', '_blank')}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="text-2xl mb-2">🏥</div>
              <div className="font-medium">Seed Medical Data</div>
            </button>
            <button
              onClick={() => window.open('/api/test-advanced', '_blank')}
              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="text-2xl mb-2">🧪</div>
              <div className="font-medium">Test Features</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
