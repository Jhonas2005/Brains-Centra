"use client";
import React, { useState } from 'react';

export function PMSModule() {
  const [workOrders, setWorkOrders] = useState([
    { id: 101, unit: 'Unit 4B', issue: 'Major Plumbing Leak in Bathroom', priority: 'High', status: 'Open', reported: '2 hrs ago' },
    { id: 102, unit: 'Unit 12A', issue: 'HVAC Air Filter Replacement', priority: 'Med', status: 'In Progress', reported: 'Yesterday' },
  ]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [newOrder, setNewOrder] = useState({ unit: '', issue: '', priority: 'Med' });
  const [leases, setLeases] = useState([
    { id: 1, unit: 'Unit 7C', tenant: 'Amanda Torres', daysLeft: 14, renewed: false },
    { id: 2, unit: 'Unit 2F', tenant: 'TechCorp Solutions', daysLeft: 45, renewed: false },
  ]);

  const advanceWorkOrder = (id) => {
    setWorkOrders(prev => prev.map(order => {
      if (order.id !== id) return order;
      return { ...order, status: order.status === 'Open' ? 'In Progress' : 'Resolved' };
    }));
  };

  const handleCreateWorkOrder = (e) => {
    e.preventDefault();
    if (!newOrder.unit || !newOrder.issue) return;
    setWorkOrders(prev => [
      { id: Date.now(), ...newOrder, status: 'Open', reported: 'Just now' },
      ...prev
    ]);
    setShowOrderModal(false);
    setNewOrder({ unit: '', issue: '', priority: 'Med' });
  };

  const triggerRenewal = (id) => {
    setLeases(prev => prev.map(l => l.id === id ? { ...l, renewed: true } : l));
  };

  const activeOrders = workOrders.filter(o => o.status !== 'Resolved').length;

  return (
    <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-800/30 pb-5">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-indigo-900/40 rounded-xl border border-indigo-700/50 shadow-inner text-2xl">🏢</span> 
            Landlord <span className="text-indigo-400 font-medium">(PMS)</span>
          </h3>
          <p className="text-sm text-indigo-300/70 mt-1.5 font-medium">Residential & commercial leasing, maintenance tickets, and collections</p>
        </div>
        <button 
          onClick={() => setShowOrderModal(true)} 
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold py-2.5 px-6 rounded-xl shadow-[0_4px_15px_rgba(79,70,229,0.3)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.5)] transition-all active:scale-95"
        >
          + Create Work Order
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Active Leases", value: "128", color: "text-white", glow: "bg-blue-500/10" },
          { label: "Collection Rate", value: "94.2%", color: "text-emerald-400", glow: "bg-emerald-500/10" },
          { label: "Open Work Orders", value: activeOrders, color: "text-amber-400", glow: "bg-amber-500/10" },
          { label: "Expiring in 30d", value: leases.filter(l => l.daysLeft <= 30 && !l.renewed).length, color: "text-fuchsia-400", glow: "bg-fuchsia-500/10" }
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
        {/* Work Orders List */}
        <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl flex flex-col h-[400px] shadow-xl overflow-hidden relative">
          <div className="px-6 py-4 border-b border-indigo-800/40 bg-[#13172e]/40">
            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span> Active Maintenance Tickets
            </h4>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto flex-grow connector-scrollbar">
            {workOrders.filter(o => o.status !== 'Resolved').map(order => (
              <div key={order.id} className="relative bg-[#13172e]/80 border border-indigo-800/30 rounded-xl p-4 flex justify-between items-start group hover:border-indigo-600/50 transition-colors overflow-hidden">
                {/* Priority Color Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  order.priority === 'High' ? 'bg-red-500' :
                  order.priority === 'Med' ? 'bg-amber-500' : 'bg-blue-500'
                }`}></div>
                
                <div className="pl-2">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className="text-white font-bold text-sm">{order.unit}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider border ${
                      order.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                      order.priority === 'Med' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                      'bg-blue-500/10 text-blue-400 border-blue-500/30'
                    }`}>
                      {order.priority}
                    </span>
                  </div>
                  <p className="text-sm text-indigo-200 font-medium mb-2">{order.issue}</p>
                  <span className="text-[10px] text-indigo-400/80 font-mono">Reported: {order.reported}</span>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#090b14]/50 border border-indigo-800 text-[9px] font-bold uppercase tracking-widest text-amber-400">
                    {order.status}
                  </span>
                  <button 
                    onClick={() => advanceWorkOrder(order.id)} 
                    className="bg-indigo-600/20 hover:bg-indigo-600/80 border border-indigo-500/30 text-indigo-100 hover:text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm"
                  >
                    {order.status === 'Open' ? 'Dispatch' : 'Resolve'}
                  </button>
                </div>
              </div>
            ))}
            {activeOrders === 0 && <div className="h-full flex items-center justify-center text-sm font-medium text-emerald-400/80">All maintenance tickets resolved.</div>}
          </div>
        </div>

        {/* Leases Expiration */}
        <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl flex flex-col h-[400px] shadow-xl overflow-hidden relative">
          <div className="px-6 py-4 border-b border-indigo-800/40 bg-[#13172e]/40">
            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
              <span className="text-lg leading-none mb-1">📑</span> Lease Expirations & Renewals
            </h4>
          </div>
          <div className="p-4 space-y-3 overflow-y-auto flex-grow connector-scrollbar">
            {leases.map(lease => (
              <div key={lease.id} className="flex justify-between items-center p-4 bg-[#13172e]/60 border border-indigo-800/30 rounded-xl hover:border-indigo-600/50 transition-colors">
                <div>
                  <span className="font-bold text-white text-sm block mb-1">{lease.unit}</span>
                  <span className="text-indigo-300 text-xs font-medium flex items-center gap-1.5">👤 {lease.tenant}</span>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-xs font-bold block mb-2 px-2.5 py-1 rounded-md bg-[#090b14]/50 border ${lease.daysLeft <= 30 ? 'text-amber-400 border-amber-900/50' : 'text-indigo-300 border-indigo-800/50'}`}>
                    {lease.daysLeft} Days Left
                  </span>
                  {lease.renewed ? (
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex justify-end items-center gap-1">Notice Sent <span className="text-sm">✓</span></span>
                  ) : (
                    <button 
                      onClick={() => triggerRenewal(lease.id)} 
                      className="text-xs text-fuchsia-400 hover:text-fuchsia-300 font-bold transition-colors"
                    >
                      Send Renewal Notice →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showOrderModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-[#060810]/80" onClick={() => setShowOrderModal(false)}></div>
          <form onSubmit={handleCreateWorkOrder} className="relative w-full max-w-md bg-gradient-to-b from-[#13172e] to-[#090b14] border border-indigo-600/50 p-8 rounded-3xl z-10 shadow-[0_0_50px_rgba(79,70,229,0.15)] space-y-5">
            <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Create Work Order</h4>
            <p className="text-xs text-indigo-300/80 mb-6">Dispatch a new maintenance ticket to the facility team.</p>
            
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Unit Number</label>
              <input placeholder="e.g. Unit 8D" required value={newOrder.unit} onChange={e => setNewOrder({ ...newOrder, unit: e.target.value })} className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Description</label>
              <textarea placeholder="Describe the issue..." required rows="3" value={newOrder.issue} onChange={e => setNewOrder({ ...newOrder, issue: e.target.value })} className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Priority Level</label>
              <select value={newOrder.priority} onChange={e => setNewOrder({ ...newOrder, priority: e.target.value })} className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all">
                <option value="Low">Low Priority</option>
                <option value="Med">Medium Priority</option>
                <option value="High">High Priority</option>
              </select>
            </div>
            
            <div className="flex gap-3 justify-end pt-6 mt-2 border-t border-indigo-800/30">
              <button type="button" onClick={() => setShowOrderModal(false)} className="px-5 py-2.5 text-sm font-bold text-indigo-300 hover:text-white transition-colors">Cancel</button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition-all">Dispatch Ticket</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}