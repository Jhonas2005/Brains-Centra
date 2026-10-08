"use client";
import React, { useState, useEffect } from 'react';

export function MyRequestsModule({ userEmail }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchUserRequests = async () => {
    if (!userEmail) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/user/inquiries?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (res.ok) {
        setRequests(data.inquiries || []);
      }
    } catch (err) {
      console.error('Failed to load user requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserRequests();
  }, [userEmail]);

  const filteredRequests = filter === 'All' 
    ? requests 
    : requests.filter(r => r.status?.toLowerCase() === filter.toLowerCase());

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'contacted':
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'rejected':
      case 'closed':
        return 'bg-red-500/10 text-red-400 border-red-500/30';
      default:
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
    }
  };

  return (
    <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-800/30 pb-5">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-indigo-900/40 rounded-xl border border-indigo-700/50 shadow-inner text-2xl">📑</span>
            My Requests &amp; Inquiries
          </h3>
          <p className="text-sm text-indigo-300/70 mt-1">
            Monitor the review status of your trials, quotes, and service inquiries
          </p>
        </div>
        <button
          onClick={fetchUserRequests}
          className="bg-[#13172e] hover:bg-indigo-900/50 border border-indigo-700/60 text-indigo-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-all"
        >
          🔄 Refresh Status
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#090b14]/60 border border-indigo-800/40 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1">Total Submitted</div>
          <div className="text-3xl font-black text-white">{requests.length}</div>
        </div>
        <div className="bg-[#090b14]/60 border border-indigo-800/40 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1">Awaiting Review</div>
          <div className="text-3xl font-black text-amber-400">
            {requests.filter(r => r.status?.toLowerCase() === 'pending').length}
          </div>
        </div>
        <div className="bg-[#090b14]/60 border border-indigo-800/40 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1">Processed</div>
          <div className="text-3xl font-black text-emerald-400">
            {requests.filter(r => r.status?.toLowerCase() === 'contacted').length}
          </div>
        </div>
        <div className="bg-[#090b14]/60 border border-indigo-800/40 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1">Account Target</div>
          <div className="text-xs font-bold text-indigo-200 truncate mt-2">{userEmail}</div>
        </div>
      </div>

      {/* Requests Ledger */}
      <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl overflow-hidden flex-grow flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-indigo-800/40 flex justify-between items-center bg-[#13172e]/40">
          <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Tracking Log</h4>
          <div className="flex gap-1.5 p-1 bg-[#090b14]/80 rounded-lg border border-indigo-800/30">
            {['All', 'Pending', 'Contacted'].map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-all ${
                  filter === st ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto flex-grow">
          {loading ? (
            <div className="text-center py-16 text-indigo-400 animate-pulse font-mono text-xs">
              LOADING SUBMISSIONS...
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-16 text-indigo-400/60 text-sm">
              You haven't submitted any inquiries or trial requests yet.
            </div>
          ) : (
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-[#090b14]/90 text-indigo-400/80 text-xs uppercase tracking-wider sticky top-0 backdrop-blur-md">
                <tr>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Date</th>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Category</th>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Request Item</th>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Notes / Details</th>
                  <th className="px-6 py-4 font-semibold border-b border-indigo-800/30 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-800/20 text-indigo-200">
                {filteredRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-indigo-900/20 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-indigo-300">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#090b14] border border-indigo-800 text-indigo-200">
                        {r.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white text-sm">{r.subject}</td>
                    <td className="px-6 py-4 text-xs text-indigo-300/80 max-w-xs truncate">
                      {r.details || <span className="italic opacity-40">Standard Request</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${getStatusBadge(r.status)}`}>
                        {r.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}