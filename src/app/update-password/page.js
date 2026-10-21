'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  // Check if the user arrived here with a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // If no session is found, they didn't click a valid link
        window.location.href = '/';
      } else {
        setUser(session.user);
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Updating password...');

    try {
      // This securely updates the password for the currently active session
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setMessage('Password updated successfully! Redirecting...');
      
      // Redirect them to their dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/user-dashboard';
      }, 2000);

    } catch (error) {
      console.error('Error updating password:', error);
      setMessage(error.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  // Prevent rendering the form until the session is verified
  if (!user) return <div className="min-h-screen bg-[#090b14] flex items-center justify-center text-indigo-400">Verifying secure link...</div>;

  return (
    <div className="min-h-screen bg-[#090b14] flex flex-col items-center justify-center p-4 font-sans text-gray-100">
      
      {/* Reused Background Styling */}
      <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-[#13172e] border border-indigo-800/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(217,70,239,0.15)] relative z-10">
        <div className="text-center mb-8">
          <img src="/brains-logo.png" alt="Brains Logo" className="h-10 w-auto mx-auto mb-4 object-contain" />
          <h2 className="text-2xl font-bold text-white mb-1">Set New Password</h2>
          <p className="text-sm text-indigo-300/80">Please enter a new, secure password below.</p>
        </div>

        {message && (
          <p className={`text-center text-sm font-semibold mb-6 ${message.includes('success') ? 'text-emerald-400' : 'text-fuchsia-400'}`}>
            {message}
          </p>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-indigo-300 mb-1 uppercase tracking-wide">New Password</label>
            <input 
              type="password" 
              required 
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#090b14] border border-indigo-800/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-fuchsia-500/50 transition-colors" 
              placeholder="••••••••" 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all shadow-[0_4px_14px_rgba(217,70,239,0.25)] active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}