"use client";
import React, { useState } from 'react';

const hardwareProducts = [
  "Construction Auxiliaries", "Command Center", "GPS Tracker", "Accessories", "Auto Identification and Data Capture",
  "Cloud Solutions", "Copiers", "Data Centers", "Desktops", "Digital Appliance", "Hyperconverge", "IT Security",
  "LFD", "Mobile Devices", "Networking", "Notebooks", "Peripherals", "Photography", "Printers", "Server Appliance",
  "Servers", "Software", "Storage", "Surveillance", "Unified Communication and Collaboration", 
  "VDI- Virtual Desktop Infrastructure", "Wearables", "Open-source Platform", "3D Printing", "Artificial Intelligence-RPA",
  "Big Data", "CAD & Graphics", "Collaboration Solutions", "Commercial Digital Display", "Containers & Microservices",
  "Data Management Solutions", "Dev Ops", "eMobility", "Gadgets & Accessories", "Gaming Accessories", "Gaming Notebooks",
  "Gaming Desktops", "Hyper-Converged Infrastructure", "IP Surveillance and Security", "Security", "Lifestyle IoT",
  "Mobility-Smartphones", "Mobility-Tablets", "Networking Wired and Wireless", "Network Security", "POS Solutions and AIDC",
  "Power Management", "Software Defined Network", "Software Enterprise Solutions", "Document Imaging", "Workstations"
];

export function HardwareModule({ openInquiryModal }) {
  const [hardwareSearch, setHardwareSearch] = useState('');

  return (
    <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
      
      {/* Clean Header with Primary CTA */}
      <div className="border-b border-indigo-800/50 pb-5 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h3 className="text-2xl font-black text-white tracking-tight mb-1">Hardware Procurement</h3>
          <p className="text-sm text-indigo-300/80">Request quotes for enterprise IT infrastructure and flagship products.</p>
        </div>
        <button 
          onClick={() => openInquiryModal('General Hardware Procurement', 'Hardware')}
          className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold py-2.5 px-6 rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all active:scale-95"
        >
          + Request General Quote
        </button>
      </div>
      
      {/* Elevated Flagship Cards */}
      <div className="grid lg:grid-cols-2 gap-6 flex-shrink-0">
        <div className="bg-gradient-to-br from-[#13172e]/80 to-[#090b14]/80 border border-cyan-800/50 rounded-2xl p-6 shadow-lg flex flex-col group hover:border-cyan-500/50 transition-all backdrop-blur-sm">
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-2xl border border-cyan-500/20 shadow-inner">🖥️</div>
            <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-cyan-500/30">Flagship</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">Millennium Interactive Board</h4>
          <p className="text-sm text-indigo-200/80 mb-6 flex-grow leading-relaxed">4K Ultra HD touch panel with embedded OS and telepresence camera for modern meeting rooms.</p>
          <button onClick={() => openInquiryModal('Millennium Interactive Board', 'Hardware')} className="w-full py-2.5 bg-[#090b14] border border-indigo-700/50 text-cyan-400 text-xs font-bold rounded-xl hover:bg-cyan-900/40 hover:border-cyan-500/50 transition-colors shadow-sm">
            Request Spec Sheet
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#13172e]/80 to-[#090b14]/80 border border-emerald-800/50 rounded-2xl p-6 shadow-lg flex flex-col group hover:border-emerald-500/50 transition-all backdrop-blur-sm">
          <div className="flex justify-between items-start mb-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 text-2xl border border-emerald-500/20 shadow-inner">⚙️</div>
            <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/30">Innovation</span>
          </div>
          <h4 className="text-lg font-bold text-white mb-2">THEHCO Tech Device</h4>
          <p className="text-sm text-indigo-200/80 mb-6 flex-grow leading-relaxed">Heat exchanger for internal combustion engines. Reduces fuel consumption and carbon emissions up to 90%.</p>
          <button onClick={() => openInquiryModal('THEHCO Tech Device', 'Hardware')} className="w-full py-2.5 bg-[#090b14] border border-indigo-700/50 text-emerald-400 text-xs font-bold rounded-xl hover:bg-emerald-900/40 hover:border-emerald-500/50 transition-colors shadow-sm">
            Inquire for Fleet
          </button>
        </div>
      </div>

      {/* Structured Catalog Grid with Live Search */}
      <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl flex flex-col flex-grow overflow-hidden shadow-2xl relative min-h-[400px]">
        <div className="px-6 py-4 border-b border-indigo-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#13172e]/40 sticky top-0">
          <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></span>
            Enterprise Catalog
          </h4>
          <div className="relative w-full sm:w-64">
            <svg className="absolute left-3 top-2 w-4 h-4 text-indigo-500/70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            <input
              type="text"
              placeholder="Search infrastructure..."
              value={hardwareSearch}
              onChange={(e) => setHardwareSearch(e.target.value)}
              className="w-full bg-[#090b14]/80 border border-indigo-700/50 rounded-lg pl-9 pr-4 py-1.5 text-sm text-white placeholder-indigo-500/60 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner"
            />
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto connector-scrollbar flex-grow">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {hardwareProducts
              .filter(prod => prod.toLowerCase().includes(hardwareSearch.toLowerCase()))
              .map((prod, idx) => (
              <div
                key={idx}
                onClick={() => openInquiryModal(prod, 'Hardware')}
                className="flex items-center justify-between p-4 bg-[#13172e]/40 border border-indigo-800/30 rounded-xl hover:border-cyan-500/50 hover:bg-[#13172e]/80 cursor-pointer transition-all duration-300 group"
              >
                <span className="text-sm font-semibold text-indigo-100 group-hover:text-cyan-300 transition-colors truncate pr-3">{prod}</span>
                <span className="text-indigo-600 group-hover:text-cyan-400 font-bold transition-transform group-hover:translate-x-1">→</span>
              </div>
            ))}
            {hardwareProducts.filter(prod => prod.toLowerCase().includes(hardwareSearch.toLowerCase())).length === 0 && (
              <div className="col-span-full text-center py-10 text-indigo-400/60 text-sm font-medium">
                No hardware matches your search criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}