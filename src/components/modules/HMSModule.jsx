"use client";
import React, { useState } from 'react';

export function HMSModule() {
  const [guests, setGuests] = useState([
    { id: 1, name: 'Alexander Wright', room: '402 (Suite)', dates: 'Oct 12 - Oct 15', status: 'Checked In', folio: 'PHP 25,500' },
    { id: 2, name: 'Sarah Jenkins', room: '214 (Standard)', dates: 'Oct 12 - Oct 14', status: 'Pending', folio: 'PHP 8,500' },
    { id: 3, name: 'Marcus Chen', room: '305 (Deluxe)', dates: 'Oct 10 - Oct 12', status: 'Due Out', folio: 'PHP 17,000' },
  ]);
  const [filter, setFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', room: '', dates: '', folio: '' });

  const toggleStatus = (id, newStatus) => {
    setGuests(prev => prev.map(g => g.id === id ? { ...g, status: newStatus } : g));
  };

  const handleAddBooking = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.room) return;
    setGuests(prev => [
      ...prev,
      { id: Date.now(), ...formData, status: 'Pending', folio: formData.folio || 'PHP 8,500' }
    ]);
    setShowModal(false);
    setFormData({ name: '', room: '', dates: '', folio: '' });
  };

  const filteredGuests = filter === 'All' ? guests : guests.filter(g => g.status === filter);
  const checkedInCount = guests.filter(g => g.status === 'Checked In').length;
  const totalRooms = 60;

  return (
    <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-800/30 pb-5">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-indigo-900/40 rounded-xl border border-indigo-700/50 shadow-inner text-2xl">🏨</span> 
            Frontdesk <span className="text-indigo-400 font-medium">(HMS)</span>
          </h3>
          <p className="text-sm text-indigo-300/70 mt-1.5 font-medium">Room inventory, live occupancy telemetry, and guest folios</p>
        </div>
        <button 
          onClick={() => setShowModal(true)} 
          className="bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_15px_rgba(217,70,239,0.3)] hover:shadow-[0_6px_20px_rgba(217,70,239,0.5)] transition-all active:scale-95"
        >
          + New Reservation
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Rooms", value: totalRooms, color: "text-white", glow: "bg-blue-500/10" },
          { label: "Occupancy", value: `${Math.round((checkedInCount / totalRooms) * 100)}%`, color: "text-emerald-400", glow: "bg-emerald-500/10" },
          { label: "Active Folios", value: checkedInCount, color: "text-white", glow: "bg-fuchsia-500/10" },
          { label: "Pending Arrivals", value: guests.filter(g => g.status === 'Pending').length, color: "text-amber-400", glow: "bg-amber-500/10" }
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

      {/* Roster Table */}
      <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl overflow-hidden flex-grow flex flex-col shadow-2xl relative">
        <div className="px-6 py-4 border-b border-indigo-800/40 flex justify-between items-center bg-[#13172e]/40">
          <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Live Guest Roster
          </h4>
          <div className="flex gap-1.5 p-1 bg-[#090b14]/80 rounded-lg border border-indigo-800/30">
            {['All', 'Checked In', 'Pending', 'Due Out'].map(st => (
              <button 
                key={st} 
                onClick={() => setFilter(st)}
                className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-all ${filter === st ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-400 hover:text-white hover:bg-indigo-800/40'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto flex-grow connector-scrollbar">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#090b14]/90 text-indigo-400/80 text-xs uppercase tracking-wider sticky top-0 z-10 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Guest Name</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Room</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Stay Dates</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Total Folio</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">Status</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-800/20 text-indigo-200">
              {filteredGuests.map(g => (
                <tr key={g.id} className="hover:bg-indigo-900/30 transition-colors group">
                  <td className="px-6 py-4 font-bold text-white">{g.name}</td>
                  <td className="px-6 py-4 font-mono text-xs">{g.room}</td>
                  <td className="px-6 py-4 text-xs">{g.dates}</td>
                  <td className="px-6 py-4 font-mono text-xs font-semibold text-emerald-400">{g.folio}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border ${
                      g.status === 'Checked In' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                      g.status === 'Due Out' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                      'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    }`}>
                      {g.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {g.status === 'Pending' && (
                      <button onClick={() => toggleStatus(g.id, 'Checked In')} className="bg-[#13172e] hover:bg-emerald-600 border border-indigo-700 hover:border-emerald-500 text-indigo-300 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">Check-in</button>
                    )}
                    {g.status === 'Checked In' && (
                      <button onClick={() => toggleStatus(g.id, 'Due Out')} className="bg-[#13172e] hover:bg-blue-600 border border-indigo-700 hover:border-blue-500 text-indigo-300 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">Mark Due</button>
                    )}
                    {g.status === 'Due Out' && (
                      <button onClick={() => setGuests(prev => prev.filter(guest => guest.id !== g.id))} className="bg-[#13172e] hover:bg-fuchsia-600 border border-indigo-700 hover:border-fuchsia-500 text-indigo-300 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm">Checkout</button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-indigo-400/50 font-medium">No guests match the current filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-[#060810]/80" onClick={() => setShowModal(false)}></div>
          <form onSubmit={handleAddBooking} className="relative w-full max-w-md bg-gradient-to-b from-[#13172e] to-[#090b14] border border-indigo-600/50 p-8 rounded-3xl z-10 shadow-[0_0_50px_rgba(79,70,229,0.15)]">
            <h4 className="text-2xl font-black text-white mb-2 tracking-tight">New Reservation</h4>
            <p className="text-xs text-indigo-300/80 mb-6">Enter guest details to create a new frontdesk folio.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Guest Name</label>
                <input placeholder="e.g. John Doe" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Room Assignment</label>
                <input placeholder="e.g. 501 Suite" required value={formData.room} onChange={e => setFormData({ ...formData, room: e.target.value })} className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Stay Dates</label>
                <input placeholder="e.g. Oct 15 - Oct 18" required value={formData.dates} onChange={e => setFormData({ ...formData, dates: e.target.value })} className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" />
              </div>
            </div>
            
            <div className="flex gap-3 justify-end pt-8 mt-2 border-t border-indigo-800/30">
              <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-bold text-indigo-300 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-fuchsia-500/25 active:scale-95 transition-all">Save Booking</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}