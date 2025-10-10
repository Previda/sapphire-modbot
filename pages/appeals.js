import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Appeals() {
  const [appeals, setAppeals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchAppeals();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await fetch('/api/auth/user');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  const fetchAppeals = async () => {
    try {
      const response = await fetch('/api/appeals');
      const data = await response.json();
      setAppeals(data.appeals || []);
    } catch (error) {
      console.error('Failed to fetch appeals:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitAppeal = async (appealData) => {
    try {
      const response = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appealData)
      });
      
      if (response.ok) {
        fetchAppeals(); // Refresh appeals
      }
    } catch (error) {
      console.error('Failed to submit appeal:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <motion.div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Login Required</h2>
          <p className="text-white/70 mb-6">Please login with Discord to access appeals</p>
          <a href="/api/auth/login" className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors">
            Login with Discord
          </a>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8"
        >
          <h1 className="text-3xl font-bold text-white mb-6">Appeals System</h1>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {appeals.length === 0 ? (
                <p className="text-white/70 text-center py-8">No appeals found</p>
              ) : (
                appeals.map((appeal, index) => (
                  <motion.div
                    key={appeal.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 rounded-xl p-6 border border-white/10"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-semibold">{appeal.type} Appeal</h3>
                        <p className="text-white/60 text-sm">Submitted: {new Date(appeal.createdAt).toLocaleDateString()}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appeal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        appeal.status === 'denied' ? 'bg-red-500/20 text-red-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {appeal.status}
                      </span>
                    </div>
                    <p className="text-white/80">{appeal.reason}</p>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}