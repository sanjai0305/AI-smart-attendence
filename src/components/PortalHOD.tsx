import React, { useState } from 'react';
import { 
  Users, UserCheck, ShieldCheck, FileText, AlertTriangle, 
  Map, Calendar, PlusCircle, Volume2, ShieldAlert, KeyRound,
  FileSpreadsheet, Lock, RefreshCw, Layers, CheckCircle, Smartphone
} from 'lucide-react';
import { Advisor, Student, AttendanceRecord, ODRequest, Announcement, AuditLog, Department } from '../types';

interface PortalHODProps {
  advisors: Advisor[];
  students: Student[];
  attendance: AttendanceRecord[];
  odRequests: ODRequest[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  departments: Department[];
  onAddAdvisor: (advisor: Advisor) => void;
  onToggleAdvisor: (id: string) => void;
  onSendAnnouncement: (title: string, content: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  onResetDevice: (studentId: string) => void;
}

export default function PortalHOD({
  advisors,
  students,
  attendance,
  odRequests,
  announcements,
  auditLogs,
  departments,
  onAddAdvisor,
  onToggleAdvisor,
  onSendAnnouncement,
  onResetDevice
}: PortalHODProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'advisors' | 'students' | 'departments' | 'od-requests' | 'announcements' | 'audit-logs' | 'device-locks'>('dashboard');

  // Input states for registering new class advisor
  const [advName, setAdvName] = useState('');
  const [advReg, setAdvReg] = useState('');
  const [advEmail, setAdvEmail] = useState('');
  const [advMobile, setAdvMobile] = useState('');
  const [advDept, setAdvDept] = useState('AI & ML');
  const [advSec, setAdvSec] = useState('Section A');
  const [advPass, setAdvPass] = useState('');
  
  // Custom states for onboarding biometrics
  const [faceRegistered, setFaceRegistered] = useState(false);
  const [fingerprintRegistered, setFingerprintRegistered] = useState(false);
  const [faceScanning, setFaceScanning] = useState(false);
  const [fingerScanning, setFingerScanning] = useState(false);

  // Announcement inputs
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Generate dynamic metrics
  const totalAdvisors = advisors.length;
  const totalStudents = students.length;
  const activeAdvisors = advisors.filter(a => a.isEnabled).length;
  const pendingOD = odRequests.filter(r => r.status === 'Pending').length;
  
  // Today's attendance percentage calculation
  const presentCount = attendance.filter(a => a.status === 'Present' || a.status === 'OD').length;
  const totalTracked = attendance.length || 1;
  const attendanceRate = ((presentCount / totalTracked) * 100).toFixed(1);

  const handleRegisterAdvisor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advName || !advReg || !advEmail || !advPass) {
      alert('Please fill out all required advisor details.');
      return;
    }

    const newAdv: Advisor = {
      id: `ADV_${Math.floor(1000 + Math.random() * 9000)}`,
      name: advName,
      registerNo: advReg,
      email: advEmail,
      mobile: advMobile || '+91 9445522110',
      department: advDept,
      section: advSec,
      isEnabled: true,
      faceRegistered: faceRegistered,
      fingerprintRegistered: fingerprintRegistered
    };

    onAddAdvisor(newAdv);
    
    // Clear forms
    setAdvName('');
    setAdvReg('');
    setAdvEmail('');
    setAdvMobile('');
    setAdvPass('');
    setFaceRegistered(false);
    setFingerprintRegistered(false);
    
    alert(`Advisor ${advName} successfully enrolled with active security roles.`);
  };

  const handleDispatchAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    onSendAnnouncement(annTitle, annContent, annPriority);
    setAnnTitle('');
    setAnnContent('');
    alert('Campus alerts dispatched to all portals successfully.');
  };

  // Simulate face scanner enrollment for HOD
  const simulateFaceCapture = () => {
    setFaceScanning(true);
    setTimeout(() => {
      setFaceScanning(false);
      setFaceRegistered(true);
    }, 1500);
  };

  // Simulate fingerprint diagnostic
  const simulateFingerprintCapture = () => {
    setFingerScanning(true);
    setTimeout(() => {
      setFingerScanning(false);
      setFingerprintRegistered(true);
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans" id="hod-portal-parent">
      
      {/* Sidebar navigation */}
      <aside className="w-full lg:w-64 bg-[#0B0E14] text-slate-300 flex flex-col shrink-0 border-r border-slate-900" id="hod-sidebar">
        
        {/* Profile Card Header */}
        <div className="p-5 border-b border-white/[0.06] flex items-center gap-3">
          <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black text-white text-lg tracking-wider border border-indigo-400">
            AI
          </div>
          <div>
            <h2 className="font-bold text-white text-sm tracking-tight">Smart Campus</h2>
            <p className="text-[10px] text-indigo-400 font-mono">HOD Portal • AI &amp; ML Block</p>
          </div>
        </div>

        {/* Current Coordinator info */}
        <div className="p-4 mx-3 my-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center gap-3">
          <div className="h-9 w-9 bg-slate-800 rounded-lg flex items-center justify-center font-bold text-white font-mono text-xs">
            HOD
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">Dr. R. Karthikeyan</h4>
            <span className="text-[9px] text-[#22c55e] font-mono flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Role: HOD - AI &amp; ML
            </span>
          </div>
        </div>

        {/* Navigation block */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Layers size={15} /> Dashboard Overview
          </button>
          
          <div className="pt-3 pb-1 text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 font-mono">
            Security Control
          </div>

          <button 
            onClick={() => setActiveTab('advisors')} 
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'advisors' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <UserCheck size={15} /> Manage Advisors ({totalAdvisors})
          </button>

          <button 
            onClick={() => setActiveTab('students')} 
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'students' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Users size={15} /> Students Census ({totalStudents})
          </button>

          <button 
            onClick={() => setActiveTab('device-locks')} 
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'device-locks' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Smartphone size={15} /> Dynamic Device Locks
          </button>

          <button 
            onClick={() => setActiveTab('od-requests')} 
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'od-requests' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Calendar size={15} /> OD Requests &amp; Approvals
            {pendingOD > 0 && <span className="bg-amber-500 text-white font-mono font-bold px-1.5 py-0.2 rounded-full text-[9px] animate-bounce ml-auto">{pendingOD}</span>}
          </button>

          <div className="pt-3 pb-1 text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 font-mono">
            Circulars &amp; Audits
          </div>

          <button 
            onClick={() => setActiveTab('announcements')} 
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Volume2 size={15} /> Broadcast Announcements
          </button>

          <button 
            onClick={() => setActiveTab('audit-logs')} 
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'audit-logs' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <ShieldCheck size={15} /> Audit logs &amp; Security OS
          </button>

          <button 
            onClick={() => setActiveTab('departments')} 
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'departments' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.04] hover:text-white'
            }`}
          >
            <Map size={15} /> Campus Geo-boundaries
          </button>
        </nav>

        {/* Footer info lock badge */}
        <div className="p-4 border-t border-white/[0.05] text-[10px] text-slate-500 font-mono text-center">
          <p>Security Level: Level-3 HOD</p>
          <p className="mt-0.5 text-zinc-600">Secure AES Session Active</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-5 lg:p-8 overflow-y-auto" id="hod-main-frame">
        
        {/* Breadcrumb banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
          <div>
            <span className="text-xs text-indigo-600 font-bold font-mono uppercase tracking-widest">Active Campus Session</span>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Welcome, HOD <span className="text-lg">👋</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Manage departmental infrastructure, advisor rosters, and strict anti-spoof biometrics.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-sm text-slate-700">
              📅 Today: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className="text-xs font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl px-2.5 py-1.5 font-bold flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-ping" />
              STATUS: SECURED
            </span>
          </div>
        </div>

        {/* Dynamic Inner Tab Framework */}
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6" id="hod-dashboard-subview">
            {/* Quick overview metrics box */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-medium text-xs uppercase block tracking-wider">Total Class Advisors</span>
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{totalAdvisors}</span>
                  <span className="block text-[10px] text-emerald-600 font-semibold mt-1">100% Onboarded</span>
                </div>
                <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <UserCheck size={22} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-medium text-xs uppercase block tracking-wider">Enrolled Students</span>
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{totalStudents}</span>
                  <span className="block text-[10px] text-indigo-600 font-semibold mt-1">AI &amp; ML Block</span>
                </div>
                <div className="h-12 w-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <Users size={22} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-medium text-xs uppercase block tracking-wider">Today's Attendance</span>
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{attendanceRate}%</span>
                  <span className="block text-[10px] text-indigo-500 font-bold mt-1">Target threshold: 85%</span>
                </div>
                <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <CheckCircle size={22} />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-medium text-xs uppercase block tracking-wider">Pending OD Cases</span>
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{pendingOD}</span>
                  <span className={`block text-[10px] font-bold mt-1 ${pendingOD > 0 ? 'text-amber-600 animate-pulse' : 'text-slate-500'}`}>
                    {pendingOD > 0 ? 'Action required' : 'Fully resolved'}
                  </span>
                </div>
                <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <Calendar size={22} />
                </div>
              </div>
            </div>

            {/* Department grid and recent OD lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Department stats */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Visual Department breakdown with progress bars */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-1.5">
                    <Layers size={18} className="text-indigo-600" /> Department-wise Attendance Metrics
                  </h3>
                  <div className="space-y-4">
                    {departments.map((dept) => (
                      <div key={dept.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100/60">
                        <div className="flex justify-between items-center mb-1.5">
                          <div>
                            <span className="font-semibold text-xs text-slate-800">{dept.name} ({dept.code})</span>
                            <span className="block text-[10px] text-zinc-400 font-mono mt-0.5">
                              {dept.studentCount} Students • {dept.advisorCount} Class advisors assigned
                            </span>
                          </div>
                          <span className="font-mono text-xs font-bold text-indigo-600">{dept.avgAttendance}% avg</span>
                        </div>
                        {/* Custom visual bar */}
                        <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-full rounded-full transition-all"
                            style={{ width: `${dept.avgAttendance}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Secure log highlights */}
                <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 text-base flex items-center gap-1.5">
                      <ShieldAlert size={18} className="text-indigo-600" /> Recent Security Audit logs
                    </h3>
                    <button onClick={() => setActiveTab('audit-logs')} className="text-xs text-indigo-600 font-bold hover:underline">
                      Audit Station »
                    </button>
                  </div>
                  
                  <div className="space-y-2.5">
                    {auditLogs.slice(0, 4).map((log) => (
                      <div key={log.id} className="p-3 bg-slate-50/50 rounded-xl border border-slate-100/80 flex items-center justify-between text-xs font-mono">
                        <div>
                          <p className="font-medium text-slate-800">{log.action}</p>
                          <span className="text-[10px] text-zinc-400">{log.timestamp} • IP: {log.ipAddress}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          log.securityRating === 'Secure' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          log.securityRating === 'Warning' ? 'bg-amber-50 text-amber-600 border border-amber-100 animate-pulse' :
                          'bg-rose-50 text-rose-600 border border-rose-100 font-black'
                        }`}>
                          {log.securityRating}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Alerts Dispatch & Circular lists */}
              <div className="space-y-6">
                
                {/* Fast alerts dispatcher */}
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
                    <Volume2 size={16} className="text-indigo-600" /> Quick Announcement Broadcast
                  </h3>
                  <form onSubmit={handleDispatchAnnouncement} className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Alert Title</label>
                      <input 
                        type="text" 
                        value={annTitle} 
                        onChange={e => setAnnTitle(e.target.value)} 
                        placeholder="e.g. Server Maintenance, HOLIDAY" 
                        className="w-full text-xs p-2 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Content</label>
                      <textarea 
                        value={annContent} 
                        onChange={e => setAnnContent(e.target.value)} 
                        placeholder="Detailed campus policy announcement..." 
                        rows={3} 
                        className="w-full text-xs p-2 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Priority Rating</label>
                      <select 
                        value={annPriority} 
                        onChange={e => setAnnPriority(e.target.value as any)} 
                        className="w-full text-xs p-2 border border-zinc-200 rounded-lg focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="low">Standard info (Low)</option>
                        <option value="medium">Medium alert</option>
                        <option value="high">High priority exam circular</option>
                        <option value="urgent">Emergency / Lockout alert</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2 bg-[#0B0E14] text-white hover:bg-slate-850 rounded-lg font-bold text-xs cursor-pointer text-center"
                    >
                      Broadcast Campus Circular
                    </button>
                  </form>
                </div>

                {/* Direct circular preview */}
                <div className="bg-[#0B0E14] text-slate-300 rounded-2xl p-5 border border-slate-900 shadow-lg">
                  <h4 className="text-white font-bold text-xs mb-3 flex items-center gap-1.5">
                    <Lock size={14} className="text-indigo-400" /> Active Campus Broadcasts
                  </h4>
                  <div className="space-y-3">
                    {announcements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-xs">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <h5 className="font-semibold text-white text-xs truncate max-w-[140px]">{ann.title}</h5>
                          <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                            ann.priority === 'urgent' || ann.priority === 'high' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-400'
                          }`}>
                            {ann.priority.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{ann.content}</p>
                        <span className="text-[8px] text-zinc-500 font-mono block mt-1.5">{ann.createdAt}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Tab: Manage Advisors & Onboarding */}
        {activeTab === 'advisors' && (
          <div className="space-y-6" id="hod-advisors-subview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Advisor Enrolment Form */}
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-850 text-lg mb-1 flex items-center gap-1.5">
                  <PlusCircle size={20} className="text-indigo-600" /> Enroll New Advisor
                </h3>
                <p className="text-xs text-slate-500 mb-4">Onboard class-level advisors and secure cryptographic biometric logs</p>

                <form onSubmit={handleRegisterAdvisor} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Advisor Name *</label>
                    <input 
                      type="text" 
                      value={advName} 
                      onChange={e => setAdvName(e.target.value)} 
                      placeholder="e.g. Dr. S. Janani" 
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Register Number *</label>
                      <input 
                        type="text" 
                        value={advReg} 
                        onChange={e => setAdvReg(e.target.value)} 
                        placeholder="ADV_AIML_B" 
                        className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Mobile Number</label>
                      <input 
                        type="tel" 
                        value={advMobile} 
                        onChange={e => setAdvMobile(e.target.value)} 
                        placeholder="+91 91234 50912" 
                        className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Institutional Email *</label>
                    <input 
                      type="email" 
                      value={advEmail} 
                      onChange={e => setAdvEmail(e.target.value)} 
                      placeholder="advisor@aiml.edu" 
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Department</label>
                      <select 
                        value={advDept} 
                        onChange={e => setAdvDept(e.target.value)} 
                        className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-white"
                      >
                        <option value="AI & ML">AI &amp; ML</option>
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Assigned Section</label>
                      <select 
                        value={advSec} 
                        onChange={e => setAdvSec(e.target.value)} 
                        className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg bg-white"
                      >
                        <option value="Section A">Section A</option>
                        <option value="Section B">Section B</option>
                        <option value="Section C">Section C</option>
                        <option value="Section D">Section D</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">Portal Login Password *</label>
                    <input 
                      type="password" 
                      value={advPass} 
                      onChange={e => setAdvPass(e.target.value)} 
                      placeholder="••••••••••••" 
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-lg"
                      required
                    />
                  </div>

                  {/* Anti-spoof biometric enrollment requested */}
                  <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/55 space-y-2.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Institutional Biometrics Registry</span>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CheckCircle size={14} className={faceRegistered ? 'text-emerald-500' : 'text-slate-300'} />
                        <span>Facial Recognition ID</span>
                      </div>
                      <button 
                        type="button"
                        onClick={simulateFaceCapture}
                        disabled={faceScanning}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all ${
                          faceRegistered ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                         : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {faceScanning ? 'Capturing...' : faceRegistered ? 'Enrolled ✔' : 'Scan face'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <CheckCircle size={14} className={fingerprintRegistered ? 'text-emerald-500' : 'text-slate-300'} />
                        <span>Fingerprint Hardware log</span>
                      </div>
                      <button 
                        type="button"
                        onClick={simulateFingerprintCapture}
                        disabled={fingerScanning}
                        className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all ${
                          fingerprintRegistered ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                                                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700'
                        }`}
                      >
                        {fingerScanning ? 'Scanning...' : fingerprintRegistered ? 'Bound ✔' : 'Map sensor'}
                      </button>
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 shadow-md flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    Generate Advisor Credentials
                  </button>
                </form>

              </div>

              {/* Roster list */}
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-1.5">
                  <UserCheck size={20} className="text-indigo-600" /> Active Roster of Advisors
                </h3>
                <p className="text-xs text-slate-500 mb-4">View and toggle portal privileges for class advisors</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600">
                    <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 font-mono">
                      <tr>
                        <th className="px-4 py-3 rounded-l-lg">Advisor Detail</th>
                        <th className="px-4 py-3">Section Duty</th>
                        <th className="px-4 py-3">Biometric Bind</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {advisors.map((adv) => (
                        <tr key={adv.id} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5">
                            <div>
                              <p className="font-bold text-slate-800">{adv.name}</p>
                              <p className="text-[10px] text-zinc-400 font-mono mt-0.5">{adv.registerNo} • {adv.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-mono">
                              {adv.department} - {adv.section}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex gap-1">
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${adv.faceRegistered ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                Face
                              </span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${adv.fingerprintRegistered ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                Finger
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              adv.isEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {adv.isEnabled ? 'Enabled' : 'Suspended'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => onToggleAdvisor(adv.id)}
                              className={`text-[10px] font-bold px-2 py-1 rounded transition-all cursor-pointer ${
                                adv.isEnabled ? 'bg-rose-50 hover:bg-rose-100 text-rose-600' : 'bg-blue-50 hover:bg-blue-100 text-indigo-700'
                              }`}
                            >
                              {adv.isEnabled ? 'Disable' : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Tab: Student Registry */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" id="hod-students-subview">
            <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-1.5">
              <Users size={20} className="text-[#4f46e5]" /> Student Census Registry (Current Term)
            </h3>
            <p className="text-xs text-slate-500 mb-5">Audit student device signatures, face registration coordinates, and parent communication status.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-[#0B0E14] text-slate-300 text-[10px] font-semibold font-mono uppercase">
                  <tr>
                    <th className="px-4 py-3 rounded-l-lg">Student / Roll</th>
                    <th className="px-4 py-3">Register No</th>
                    <th className="px-4 py-3">Section Target</th>
                    <th className="px-4 py-3">Parent Interface</th>
                    <th className="px-4 py-3">Secured Device Model</th>
                    <th className="px-4 py-3">Inclusion Support</th>
                    <th className="px-4 py-3 rounded-r-lg text-right">Biometrics State</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/60 transition-all">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={stu.studentPhoto} alt={stu.name} className="h-7 w-7 rounded-lg object-cover border border-slate-200 shadow-sm shrink-0" />
                          <div>
                            <p className="font-bold text-slate-850 text-xs">{stu.name}</p>
                            <span className="text-[10px] font-mono text-zinc-400 block">{stu.rollNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] font-semibold text-slate-700">{stu.registerNo}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                          {stu.department} - {stu.section}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[10px]">
                        <p className="font-medium text-slate-800">{stu.parentMobile}</p>
                        <p className="text-zinc-400 truncate max-w-[130px]">{stu.parentEmail}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-700 font-mono text-[10px]">
                        {stu.deviceModel ? (
                          <span className="flex items-center gap-1.5 text-indigo-700">
                            <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full shrink-0" />
                            {stu.deviceModel}
                          </span>
                        ) : (
                          <span className="text-rose-600 font-semibold italic flex items-center gap-1">
                            <AlertTriangle size={11} /> Unregistered Device
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {stu.isPriorityAssisted ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[9px] font-bold rounded-lg border border-amber-200 block uppercase text-center animate-pulse">
                            Accessibility Adapt
                          </span>
                        ) : (
                          <span className="text-zinc-400 text-[10px]">Standard Mode</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${
                          stu.faceRegistered ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200 border-dashed animate-pulse'
                        }`}>
                          {stu.faceRegistered ? 'FACE SIGNED' : 'AWAITING RECOGNITION REG'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Device Locks Administrator Option */}
        {activeTab === 'device-locks' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" id="hod-device-locks-subview">
            <h3 className="font-bold text-slate-850 text-lg mb-1 flex items-center gap-1.5">
              <KeyRound size={20} className="text-[#4f46e5]" /> One-Device Registry Lock &amp; Reset Station
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              A student is limited to exactly one registered Android device. In case of institutional hardware changes or device theft, the HOD must authorize a cryptographical lock release.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="md:col-span-2 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">Bonded Device Signatures</h4>
                <div className="space-y-3">
                  {students.map((stu) => (
                    <div key={stu.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800 text-sm">{stu.name}</span>
                          <span className="text-[10px] bg-slate-200 text-slate-600 rounded px-1.5 font-mono">{stu.registerNo}</span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2.5 text-[11px] font-mono text-slate-500">
                          <div>
                            <span className="text-slate-400">Model name:</span> <span className="text-slate-700 font-semibold">{stu.deviceModel || 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Device ID:</span> <span className="text-slate-700 font-semibold">{stu.deviceId || 'NOT_REGISTERED'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">FCM Target:</span> <span className="text-slate-700 font-semibold">{stu.deviceId ? 'fcm_tok_bound_22' : 'N/A'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400">Biometric Sync:</span> <span className="text-emerald-600 font-bold">{stu.faceRegistered ? 'Active' : 'Unconfirmed'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {stu.deviceId ? (
                          <button
                            onClick={() => {
                              onResetDevice(stu.id);
                              alert(`Device registry locks reset for ${stu.name}. New device registration permitted.`);
                            }}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all cursor-pointer"
                          >
                            Reset Registry Lock
                          </button>
                        ) : (
                          <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg text-xs font-semibold block border border-emerald-100">
                            Available for registration
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-[#0B0E14] text-slate-300 p-5 rounded-2xl border border-slate-900 shadow">
                  <h4 className="font-bold text-white text-sm mb-2.5 flex items-center gap-2">
                    <Lock size={15} className="text-indigo-400" /> Secure Device Policy
                  </h4>
                  <ul className="space-y-3.5 text-xs leading-relaxed text-slate-400">
                    <li className="flex items-start gap-2.5">
                      <span className="bg-white/10 text-white rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">1</span>
                      <span><strong>Instant Lockout:</strong> Logging in on an unauthenticated hardware framework generates instant administrative logs.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="bg-white/10 text-white rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">2</span>
                      <span><strong>Hardware Cryptography:</strong> The system locks attendance sessions to the registered physical device signatures stored upon student enrollment.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="bg-white/10 text-white rounded-full h-5 w-5 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">3</span>
                      <span><strong>One-Device Lock:</strong> Restricting accounts to a single active smartphone ID prevents "proxy card" or classroom-buddy spoofing.</span>
                    </li>
                  </ul>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab: OD Requests Approvals */}
        {activeTab === 'od-requests' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" id="hod-od-requests-subview">
            <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-1.5">
              <Calendar size={20} className="text-[#4f46e5]" /> Department OD requests (Duty Leave)
            </h3>
            <p className="text-xs text-slate-500 mb-5">HOD level diagnostic preview of On-Duty requests filed by students with associated upload parameters</p>

            <div className="space-y-3">
              {odRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-slate-800 text-sm">{req.studentName}</span>
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.2 rounded font-bold">
                        {req.registerNo} • {req.section}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1.5 font-medium"><strong className="text-slate-500">Reason:</strong> {req.reason}</p>
                    <div className="flex gap-4 mt-2 font-mono text-[10px] text-slate-400">
                      <span>📆 OD Date: <strong className="text-slate-700 font-semibold">{req.date}</strong></span>
                      <span>📁 Proof document: <span className="text-indigo-600 underline font-semibold cursor-pointer text-[10px]">{req.proofUrl}</span></span>
                      <span>🕒 Raised: {req.raisedAt}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'Pending' ? (
                      <span className="text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 animate-pulse">
                        Pending Advisor Action
                      </span>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-250' : 'bg-rose-50 text-rose-605 border-rose-200'
                      }`}>
                        {req.status}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Campus Geo boundaries */}
        {activeTab === 'departments' && (
          <div className="space-y-6" id="hod-departments-subview">
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-850 text-xl mb-1 flex items-center gap-1.5">
                <Map size={22} className="text-[#4f46e5]" /> Campus Geofencing Coordinates
              </h3>
              <p className="text-xs text-slate-500 mb-5">
                Configure allowed latitude, longitude, and radius constraints for attendance validation. Student submissions outside boundaries are automatically tagged: "Outside Campus".
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative aspect-video rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg flex items-center justify-center">
                    {/* Simulated Map */}
                    <div className="absolute inset-0 bg-slate-950 p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-white font-bold text-xs">AI &amp; ML Block Sector Center</p>
                          <span className="text-[10px] font-mono text-indigo-400 block mt-0.5">Core Geofence Bound: v44-Secure</span>
                        </div>
                        <span className="bg-emerald-500 text-black font-semibold text-[9px] px-2 py-0.5 rounded uppercase font-mono">
                          Standard Lock: Enforced
                        </span>
                      </div>
                      
                      {/* Graphics mimicking coordinate targets */}
                      <div className="flex items-center justify-center relative flex-1">
                        <div className="absolute h-28 w-28 rounded-full border border-indigo-500/30 bg-indigo-500/10 animate-ping" />
                        <div className="absolute h-16 w-16 rounded-full border border-indigo-400/50 bg-indigo-500/20" />
                        <div className="relative h-4 w-4 rounded-full bg-emerald-500 border-2 border-white shadow flex items-center justify-center">
                          <span className="h-1 w-1 bg-white rounded-full animate-bounce" />
                        </div>
                        <span className="absolute text-[9px] text-indigo-400 font-mono bottom-2">Target Geofence: Radius 150m</span>
                      </div>

                      <div className="flex justify-between text-[9px] font-mono text-zinc-500 border-t border-white/10 pt-2">
                        <span>Lat: 13.0827° N</span>
                        <span>Long: 80.2707° E</span>
                        <span>Compass: North-West Sector</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-150 space-y-4">
                  <h4 className="font-bold text-slate-800 text-sm">Zone Coordinates Calibration</h4>
                  <div className="space-y-3">
                    <div className="p-3 bg-white rounded-xl border border-zinc-100 text-xs">
                      <span className="font-bold text-slate-700 block">AI &amp; ML Block (R301)</span>
                      <p className="text-[11px] text-slate-500 mt-1">Latitude: <strong className="text-slate-800 font-mono">13.082711</strong></p>
                      <p className="text-[11px] text-slate-500 font-mono">Longitude: <strong className="text-slate-800">80.270712</strong></p>
                      <p className="text-[10px] text-indigo-600 font-bold mt-1">Status: Primary Attendance Center</p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-zinc-100 text-xs opacity-60">
                      <span className="font-bold text-slate-700 block text-xs">General Admin block Sector</span>
                      <p className="text-[11px] text-slate-500 mt-1">Latitude: <strong className="text-slate-800 font-mono">13.083102</strong></p>
                      <p className="text-[11px] text-slate-500 font-mono">Longitude: <strong className="text-slate-800">80.271109</strong></p>
                      <p className="text-[10px] text-zinc-500 mt-1">Status: Alternative target block</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Audit logs */}
        {activeTab === 'audit-logs' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" id="hod-audit-logs-subview">
            <h3 className="font-bold text-slate-850 text-xl mb-1 flex items-center gap-1.5">
              <ShieldCheck size={22} className="text-indigo-600" /> Administrative Cryptographic Audit station
            </h3>
            <p className="text-xs text-slate-500 mb-6">Audits of advisor onboarding credentials, root-checker warnings, face verification bypass statuses, and critical hardware registrations.</p>

            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800">{log.action}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-4 text-[10px] text-zinc-400">
                      <span>Actor: <strong className="text-[#4f46e5] font-bold">{log.actor} ({log.role})</strong></span>
                      <span>Timestamp: {log.timestamp}</span>
                      <span>Source IP: {log.ipAddress}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase shrink-0 ${
                    log.securityRating === 'Secure' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' :
                    log.securityRating === 'Warning' ? 'bg-amber-50 text-amber-600 border border-amber-150 animate-pulse' :
                    'bg-rose-50 text-rose-600 border border-rose-150 font-black'
                  }`}>
                    {log.securityRating}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
