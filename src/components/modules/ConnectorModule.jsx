"use client";
import React, { useState } from 'react';

const CONNECTOR_CONFIGS = {
  hr: {
    title: "Human Resources",
    icon: "👥",
    tagline: "Workforce scheduling, employee performance, and automated payroll",
    recordLabel: "Employee",
    initialData: [
      { id: "EMP-101", col1: "Camila Reyes", col2: "Operations Lead", col3: "Active Shift", status: "On Duty" },
      { id: "EMP-102", col1: "Gabriel Tan", col2: "Full Stack Engineer", col3: "Remote", status: "On Leave" },
      { id: "EMP-103", col1: "Danica Santos", col2: "HR Generalist", col3: "Day Shift", status: "On Duty" }
    ],
    headers: ["Employee Name", "Department / Role", "Shift Schedule", "Work Status"]
  },
  ais: {
    title: "Accounting Information",
    icon: "📊",
    tagline: "General ledger entries, tax summaries, and financial reports",
    recordLabel: "Ledger Entry",
    initialData: [
      { id: "GL-9041", col1: "Operating Expenses (HVAC Maintenance)", col2: "PHP 42,500.00", col3: "Accounts Payable", status: "Settled" },
      { id: "GL-9042", col1: "SaaS Tenant Subscription Inflow", col2: "PHP 185,000.00", col3: "Revenue Account", status: "Posted" }
    ],
    headers: ["Transaction Description", "Amount", "Ledger Account", "Reconciliation"]
  },
  crm: {
    title: "Customer Relationship Management",
    icon: "🤝",
    tagline: "Pipeline velocity, account retention, and client conversion",
    recordLabel: "Lead Record",
    initialData: [
      { id: "LEAD-401", col1: "Apex Holdings Inc.", col2: "Enterprise Suite", col3: "PHP 120,000/yr", status: "Negotiation" },
      { id: "LEAD-402", col1: "Global Horizon Logistics", col2: "Fleet Add-on", col3: "PHP 85,000/yr", status: "Demo Scheduled" }
    ],
    headers: ["Organization Name", "Package Interest", "Contract Potential", "Deal Stage"]
  },
  pos: {
    title: "Point of Sale",
    icon: "🛒",
    tagline: "Checkout terminals, barcode scans, and real-time sales tallies",
    recordLabel: "Transaction",
    initialData: [
      { id: "POS-8801", col1: "Front Desk F&B Counter #1", col2: "PHP 3,450.00", col3: "Credit Card", status: "Completed" },
      { id: "POS-8802", col1: "Concierge Merchandise Bar", col2: "PHP 1,120.00", col3: "GCash / E-Wallet", status: "Completed" }
    ],
    headers: ["Terminal ID / Location", "Total Amount", "Tender Method", "Audit State"]
  },
  fleet: {
    title: "Fleet & Logistics Management",
    icon: "🚛",
    tagline: "Route efficiency, asset geolocation, and fuel utilization",
    recordLabel: "Vehicle Asset",
    initialData: [
      { id: "VAN-01", col1: "Toyota HiAce (Plate: NCD-4412)", col2: "Downtown Hotel Shuttle", col3: "Driver: R. Gomez", status: "In Transit" },
      { id: "TRK-04", col1: "Isuzu Elf Logistics 4-Ton", col2: "Warehouse Distribution", col3: "Driver: M. Dizon", status: "Docked" }
    ],
    headers: ["Vehicle Spec", "Active Route / Assignment", "Assigned Operator", "Telemetry State"]
  },
  ims: {
    title: "Inventory Management System",
    icon: "📦",
    tagline: "Multi-warehouse supply chain, stock replenishments, and tracking",
    recordLabel: "Stock SKU",
    initialData: [
      { id: "SKU-209", col1: "RFID Keycards (Mifare 1k)", col2: "Warehouse Hub B", col3: "1,200 Units", status: "In Stock" },
      { id: "SKU-311", col1: "Smart Zigbee Gateway Hub", col2: "Central Command Room", col3: "14 Units", status: "Low Stock" }
    ],
    headers: ["SKU Description", "Storage Location", "Available Qty", "Stock Status"]
  },
  ewallet: {
    title: "E-Wallet & Payments",
    icon: "💳",
    tagline: "Multi-currency wallets, automated top-ups, and settlement routing",
    recordLabel: "Payout Transaction",
    initialData: [
      { id: "WAL-702", col1: "Merchant Payout (Portress)", col2: "PHP 64,800.00", col3: "InstaPay", status: "Settled" },
      { id: "WAL-703", col1: "Client Refund Folio #401", col2: "PHP 4,500.00", col3: "Direct Transfer", status: "Processing" }
    ],
    headers: ["Transfer Description", "Amount", "Rail Channel", "Settlement"]
  },
  parcel: {
    title: "Parcel & Shipment Tracking",
    icon: "🚚",
    tagline: "Waybill dispatch, GPS milestone pings, and delivery confirm",
    recordLabel: "Consignment",
    initialData: [
      { id: "WB-99120", col1: "Hardware Consignment (5x Touch Displays)", col2: "San Juan Hub -> QC", col3: "ETA: 4:00 PM", status: "Out for Delivery" },
      { id: "WB-99121", col1: "Staff Uniforms Consignment (Finest Fit)", col2: "Manila Port Depot", col3: "ETA: Tomorrow", status: "Dispatched" }
    ],
    headers: ["Package Content", "Routing Origin / Destination", "Schedule", "Transit State"]
  },
  mis: {
    title: "Management Information System",
    icon: "📈",
    tagline: "High-level department KPIs, cross-branch metrics, and summaries",
    recordLabel: "Reporting Metric",
    initialData: [
      { id: "RPT-01", col1: "Hospitality Revenue Run-rate", col2: "+14.8% MoM", col3: "Finance Dept", status: "Optimal" },
      { id: "RPT-02", col1: "Procurement Lead Time", col2: "3.2 Days Avg", col3: "Supply Chain", status: "Optimal" }
    ],
    headers: ["Metric Dimension", "Variance / Velocity", "Origin Dept", "Index Health"]
  },
  pms_proj: {
    title: "Project Management System",
    icon: "📋",
    tagline: "Milestone completion, sprint allocation, and resource tracking",
    recordLabel: "Sprint Task",
    initialData: [
      { id: "PRJ-301", col1: "Deploy V2 Connector Webhooks", col2: "Lead: Engineering Team", col3: "Due in 3 Days", status: "In Progress" },
      { id: "PRJ-302", col1: "Tenant Portal Security Audit", col2: "Lead: SecOps Group", col3: "Due Tomorrow", status: "Review" }
    ],
    headers: ["Task Deliverable", "Owner Team", "Target Deadline", "Sprint Phase"]
  }
};

export function ConnectorModule({ systemId, companyName }) {
  const config = CONNECTOR_CONFIGS[systemId] || CONNECTOR_CONFIGS.hr;
  const [records, setRecords] = useState(config.initialData);
  const [syncState, setSyncState] = useState({ syncing: false, lastSync: 'Just now' });
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({ col1: '', col2: '', col3: '', status: 'Active' });

  const triggerSync = () => {
    setSyncState({ syncing: true, lastSync: syncState.lastSync });
    setTimeout(() => {
      setSyncState({
        syncing: false,
        lastSync: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }, 1200);
  };

  const handleCreateRecord = (e) => {
    e.preventDefault();
    if (!newEntry.col1) return;
    const randomId = `${config.recordLabel.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    setRecords(prev => [
      { id: randomId, ...newEntry },
      ...prev
    ]);
    setShowAddModal(false);
    setNewEntry({ col1: '', col2: '', col3: '', status: 'Active' });
  };

  return (
    <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-800/30 pb-5">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-indigo-900/40 rounded-xl border border-indigo-700/50 shadow-inner text-2xl">
              {config.icon}
            </span>
            {config.title}
          </h3>
          <p className="text-sm text-indigo-300/70 mt-1">{config.tagline}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={triggerSync}
            disabled={syncState.syncing}
            className="bg-[#090b14] hover:bg-indigo-900/30 border border-indigo-700 text-indigo-200 text-xs font-bold py-2.5 px-4 rounded-xl transition-all flex items-center gap-2"
          >
            <span className={`w-2 h-2 rounded-full ${syncState.syncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`}></span>
            {syncState.syncing ? 'Syncing...' : 'Run Sync'}
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white text-xs font-bold py-2.5 px-5 rounded-xl shadow-lg transition-all"
          >
            + Add {config.recordLabel}
          </button>
        </div>
      </div>

      {/* Metric Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#090b14]/60 border border-indigo-800/40 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1">Total Entries</div>
          <div className="text-3xl font-black text-white">{records.length}</div>
        </div>
        <div className="bg-[#090b14]/60 border border-indigo-800/40 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1">Connector Gateway</div>
          <div className="text-sm font-bold text-emerald-400 mt-2 font-mono">200 OK • CONNECTED</div>
        </div>
        <div className="bg-[#090b14]/60 border border-indigo-800/40 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1">Last Data Sync</div>
          <div className="text-sm font-mono text-indigo-200 mt-2">{syncState.lastSync}</div>
        </div>
        <div className="bg-[#090b14]/60 border border-indigo-800/40 rounded-2xl p-5 shadow-lg">
          <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1">Authorized Tenant</div>
          <div className="text-xs font-bold text-indigo-300 truncate mt-2">{companyName || 'Operator Group'}</div>
        </div>
      </div>

      {/* Main Records Table */}
      <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl overflow-hidden flex-grow flex flex-col shadow-2xl">
        <div className="px-6 py-4 border-b border-indigo-800/40 flex justify-between items-center bg-[#13172e]/40">
          <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Live Operational Ledger
          </h4>
          <span className="text-[10px] font-mono text-indigo-400/60">Module Scope: {systemId.toUpperCase()}</span>
        </div>

        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-[#090b14]/90 text-indigo-400/80 text-xs uppercase tracking-wider sticky top-0 backdrop-blur-md">
              <tr>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">ID</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">{config.headers[0]}</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">{config.headers[1]}</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30">{config.headers[2]}</th>
                <th className="px-6 py-4 font-semibold border-b border-indigo-800/30 text-right">{config.headers[3]}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-800/20 text-indigo-200">
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-indigo-900/20 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-indigo-300">{r.id}</td>
                  <td className="px-6 py-4 font-bold text-white text-sm">{r.col1}</td>
                  <td className="px-6 py-4 text-xs">{r.col2}</td>
                  <td className="px-6 py-4 text-xs font-mono text-indigo-300">{r.col3}</td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="absolute inset-0 bg-[#060810]/80" onClick={() => setShowAddModal(false)}></div>
          <form
            onSubmit={handleCreateRecord}
            className="relative w-full max-w-md bg-gradient-to-b from-[#13172e] to-[#090b14] border border-blue-500/50 p-8 rounded-3xl z-10 shadow-2xl space-y-4"
          >
            <h4 className="text-xl font-bold text-white mb-2">Create {config.recordLabel}</h4>
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">{config.headers[0]}</label>
              <input
                required
                value={newEntry.col1}
                onChange={e => setNewEntry({ ...newEntry, col1: e.target.value })}
                className="w-full bg-[#060810]/60 border border-indigo-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">{config.headers[1]}</label>
              <input
                required
                value={newEntry.col2}
                onChange={e => setNewEntry({ ...newEntry, col2: e.target.value })}
                className="w-full bg-[#060810]/60 border border-indigo-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">{config.headers[2]}</label>
              <input
                required
                value={newEntry.col3}
                onChange={e => setNewEntry({ ...newEntry, col3: e.target.value })}
                className="w-full bg-[#060810]/60 border border-indigo-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs text-indigo-300">Cancel</button>
              <button type="submit" className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-md">Add Entry</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}