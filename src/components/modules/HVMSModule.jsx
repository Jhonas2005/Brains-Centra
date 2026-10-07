"use client";
import React, { useState } from 'react';

export function HVMSModule() {
  const [visitors, setVisitors] = useState([
    { id: 1, name: 'David Miller', destination: 'Unit 14B (Smith)', timeIn: '10:45 AM', status: 'On Premises', badge: 'V-0821' },
    { id: 2, name: 'Lalamove Courier', destination: 'Frontdesk Package Delivery', timeIn: '11:12 AM', status: 'On Premises', badge: 'V-0822' },
    { id: 3, name: 'Elena Rodriguez', destination: 'Unit 2A (Garcia)', timeIn: '--:--', status: 'Pre-Registered', badge: 'V-0823' },
  ]);
  const [search, setSearch] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [newVisitor, setNewVisitor] = useState({ name: '', destination: '' });

  const markDeparted = (id) => {
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'Departed' } : v));
  };

  const checkInPreReg = (id) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setVisitors(prev => prev.map(v => v.id === id ? { ...v, status: 'On Premises', timeIn: time } : v));
  };

  const handleAddVisitor = (e) => {
    e.preventDefault();
    if (!newVisitor.name || !newVisitor.destination) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const badgeNum = `V-${Math.floor(1000 + Math.random() * 9000)}`;
    setVisitors(prev => [
      { id: Date.now(), ...newVisitor, timeIn: time, status: 'On Premises', badge: badgeNum },
      ...prev
    ]);
    setShowLogModal(false);
    setNewVisitor({ name: '', destination: '' });
  };

  const activeVisitors = visitors.filter(v => v.status === 'On Premises').length;
  const filteredVisitors = visitors.filter(v => 
    v.name.toLowerCase().includes(search.toLowerCase()) || 
    v.destination.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-800/30 pb-5">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-indigo-900/40 rounded-xl border border-indigo-700/50 shadow-inner text-2xl">📋</span> 
            Butler <span className="text-indigo-400 font-medium">(HVMS)</span>
          </h3>
          <p className="text-sm text-indigo-300/70 mt-1.5 font-medium">Contactless check-in, identity verification, and lobby security audit</p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)} 
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_15px_rgba(16,185,129,0.3)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.5)] transition-all active:scale-95"
        >
          + Log Walk-in
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Visitors Inside", value: activeVisitors, color: "text-emerald-400", glow: "bg-emerald-500/10" },
          { label: "Pre-Registered", value: visitors.filter(v => v.status === 'Pre-Registered').length, color: "text-white", glow: "bg-blue-500/10" },
          { label: "Departed Today", value: visitors.filter(v => v.status === 'Departed').length, color: "text-indigo-300", glow: "bg-indigo-500/10" },
          { label: "Security Flags", value: "0", color: "text-emerald-400", glow: "bg-emerald-500/10" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-br from-[#13172e]/90 to-[#090b14]/90 border border-indigo-800/40 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.glow} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10">
              <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1.5">{stat.label}</div>
              <div className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl overflow-hidden flex-grow flex flex-col shadow-2xl relative">
        <div className="px-6 py-4 border-b border-indigo-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#13172e]/40">
          <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
            <span className="text-lg leading-none mb-1">🛡️</span> Lobby Access Stream
          </h4>
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Search visitor or unit..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-[#090b14]/80 border border-indigo-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-indigo-500/60 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all shadow-inner"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          </div>
        </div>

        <div className="overflow-x-auto flex-grow connector-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#090b14]/90 text-indigo-400/80 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Badge</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Visitor</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Destination</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Entry Time</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Status</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-800/20 text-indigo-200">
              {filteredVisitors.map(v => (
                <tr key={v.id} className="hover:bg-indigo-900/30 transition-colors group">
                  <td className="px-6 py-4 font-mono font-bold text-indigo-300">
                    <span className="px-2 py-1 bg-[#090b14] border border-indigo-800 rounded-md">{v.badge}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-white text-base">{v.name}</td>
                  <td className="px-6 py-4 text-sm font-medium">{v.destination}</td>
                  <td className="px-6 py-4 font-mono text-sm text-indigo-300">{v.timeIn}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                      v.status === 'On Premises' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      v.status === 'Pre-Registered' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      'bg-gray-500/10 text-gray-400 border-gray-500/30'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {v.status === 'On Premises' && (
                      <button onClick={() => markDeparted(v.id)} className="bg-[#13172e] hover:bg-red-600 border border-indigo-700 hover:border-red-500 text-indigo-300 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">Log Departure</button>
                    )}
                    {v.status === 'Pre-Registered' && (
                      <button onClick={() => checkInPreReg(v.id)} className="bg-[#13172e] hover:bg-emerald-600 border border-indigo-700 hover:border-emerald-500 text-indigo-300 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">Grant Entry</button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredVisitors.length === 0 && (
                <tr><td colSpan="6" className="text-center py-12 text-indigo-400/50 font-medium">No visitors match the current search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLogModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-[#060810]/80" onClick={() => setShowLogModal(false)}></div>
          <form onSubmit={handleAddVisitor} className="relative w-full max-w-md bg-gradient-to-b from-[#13172e] to-[#090b14] border border-indigo-600/50 p-8 rounded-3xl z-10 shadow-[0_0_50px_rgba(79,70,229,0.15)] space-y-5">
            <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Log Walk-In</h4>
            <p className="text-xs text-indigo-300/80 mb-6">Create a temporary access badge for a new visitor.</p>
            
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Visitor Full Name</label>
              <input placeholder="e.g. John Doe" required value={newVisitor.name} onChange={e => setNewVisitor({ ...newVisitor, name: e.target.value })} className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Destination</label>
              <input placeholder="e.g. Unit 11A or Accounting Dept" required value={newVisitor.destination} onChange={e => setNewVisitor({ ...newVisitor, destination: e.target.value })} className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all" />
            </div>
            
            <div className="flex gap-3 justify-end pt-6 mt-2 border-t border-indigo-800/30">
              <button type="button" onClick={() => setShowLogModal(false)} className="px-5 py-2.5 text-sm font-bold text-indigo-300 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-emerald-500/25 active:scale-95 transition-all">Print Badge</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}