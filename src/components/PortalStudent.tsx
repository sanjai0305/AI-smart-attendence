import React, { useState } from 'react';
import { 
  CheckCircle, ShieldAlert, Sparkles, MapPin, 
  Clock, Shield, Award, Calendar, Volume2, KeyRound,
  FileText, Smartphone, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Student, AttendanceRecord, ODRequest, Announcement, LeaveRequest, VerificationState } from '../types';
import OSSecurityCheck from './OSSecurityCheck';
import CameraFeed from './CameraFeed';
import InclusionPriorityWidget from './InclusionPriorityWidget';

interface PortalStudentProps {
  student: Student;
  attendanceHistory: AttendanceRecord[];
  announcements: Announcement[];
  onMarkPresent: (record: Omit<AttendanceRecord, 'id' | 'date'>) => void;
  onSubmitOD: (reason: string, date: string, proofUrl: string) => void;
  onSubmitLeave: (reason: string, startDate: string, endDate: string) => void;
  isMorningSessionOpen: boolean;
  isAfternoonSessionOpen: boolean;
  onResetDevice: (id: string) => void;
}

export default function PortalStudent({
  student,
  attendanceHistory,
  announcements,
  onMarkPresent,
  onSubmitOD,
  onSubmitLeave,
  isMorningSessionOpen,
  isAfternoonSessionOpen,
  onResetDevice
}: PortalStudentProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'mark-attendance' | 'my-attendance' | 'od-request' | 'leave-request' | 'announcements' | 'settings'>('dashboard');

  // Multi-stage check states
  const [vState, setVState] = useState<VerificationState>({
    currentStage: 1,
    stage1_Device_Status: 'pending',
    stage2_GPS_Status: 'pending',
    stage3_Face_Status: 'pending',
    stage4_Priority_Status: 'pending'
  });

  // GPS Simulation variables
  const [gpsLatitude, setGpsLatitude] = useState(13.082711);
  const [gpsLongitude, setGpsLongitude] = useState(80.270712);
  const [isInsideGeofence, setIsInsideGeofence] = useState<boolean | null>(null);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Disability configurations (overridden from priority widget)
  const [accessOptions, setAccessOptions] = useState({
    zoomLevel: student.isPriorityAssisted && student.priorityCategory === 'disability_vision' ? 1.25 : 1.0,
    extendedGracePeriod: student.isPriorityAssisted && student.priorityCategory === 'disability_motor',
    vocalGuidance: student.isPriorityAssisted && student.priorityCategory === 'disability_vision',
    simplifiedUI: student.isPriorityAssisted
  });

  // OD Request States
  const [odReason, setOdReason] = useState('');
  const [odDate, setOdDate] = useState('');
  const [odProof, setOdProof] = useState('workshop_pass.pdf');

  // Leave Request States
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStart, setLeaveStart] = useState('');
  const [leaveEnd, setLeaveEnd] = useState('');

  // Local calculations
  const totalDays = attendanceHistory.length || 1;
  const presentDays = attendanceHistory.filter(h => h.status === 'Present').length;
  const odDays = attendanceHistory.filter(h => h.status === 'OD').length;
  const leaveDays = attendanceHistory.filter(h => h.status === 'Leave').length;
  const attendanceRate = (((presentDays + odDays) / totalDays) * 100).toFixed(1);

  // Trigger GPS locator
  const runCampusGeofencingCheck = () => {
    setIsGpsLoading(true);
    setTimeout(() => {
      // Analyze distance against Room 301 core (13.082711, 80.270712)
      const latDiff = Math.abs(gpsLatitude - 13.082711);
      const lngDiff = Math.abs(gpsLongitude - 80.270712);
      
      const inside = latDiff < 0.0015 && lngDiff < 0.0015;
      setIsInsideGeofence(inside);
      setIsGpsLoading(false);
      
      setVState(prev => ({
        ...prev,
        stage2_GPS_Status: inside ? 'passed' : 'failed',
        errorMessage: inside ? undefined : 'GPS BOUNDARY FAULT: You are categorized 1.5km outside the allowed campus sector. Attendance locked.'
      }));
    }, 1200);
  };

  const proceedStage1 = (isPassed: boolean, logs: string[]) => {
    setVState(prev => ({
      ...prev,
      stage1_Device_Status: isPassed ? 'passed' : 'failed',
      currentStage: isPassed ? 2 : 1,
      errorMessage: isPassed ? undefined : 'OS INTEGRITY REJECTED: Magisk/SuperUser binary identified under root diagnostic check.'
    }));
  };

  const proceedStage3 = (photoData: string, isPassed: boolean) => {
    setVState(prev => ({
      ...prev,
      stage3_Face_Status: isPassed ? 'passed' : 'failed',
      currentStage: isPassed ? 4 : 3,
      capturedPhoto: photoData,
      errorMessage: isPassed ? undefined : 'SPOOF HACK TRIGGERED: Anti-spoof indices indicate printed or digital photo intrusion.'
    }));
  };

  const completeInclusionStage4 = () => {
    setVState(prev => ({
      ...prev,
      stage4_Priority_Status: 'passed'
    }));

    // Save actual attendance
    const activeSession = isMorningSessionOpen ? 'Morning' : 'Afternoon';
    onMarkPresent({
      studentId: student.id,
      studentName: student.name,
      registerNo: student.registerNo,
      session: activeSession,
      status: 'Present',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      location: 'AI & ML Block - Room 301',
      gpsValid: true,
      deviceValid: true,
      faceValid: true,
      stageReached: 4,
      priorityAccommodated: student.isPriorityAssisted
    });

    alert('Smart Campus AI verification success. Your attendance record has been permanently signed on server database.');
    setActiveTab('dashboard');
  };

  const resetVerificationPipeline = () => {
    setVState({
      currentStage: 1,
      stage1_Device_Status: 'pending',
      stage2_GPS_Status: 'pending',
      stage3_Face_Status: 'pending',
      stage4_Priority_Status: 'pending'
    });
    setIsInsideGeofence(null);
  };

  const activeSessionOpen = isMorningSessionOpen || isAfternoonSessionOpen;
  const currentSessionLabel = isMorningSessionOpen ? 'Morning Class Intake' : isAfternoonSessionOpen ? 'Afternoon Class Intake' : 'Lockout Active';

  const handleApplyOD = (e: React.FormEvent) => {
    e.preventDefault();
    if (!odReason || !odDate) return;
    onSubmitOD(odReason, odDate, odProof);
    setOdReason('');
    setOdDate('');
    alert('On-Duty form successfully filed. Sent to class advisor for certificate check.');
    setActiveTab('dashboard');
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason || !leaveStart) return;
    onSubmitLeave(leaveReason, leaveStart, leaveEnd);
    setLeaveReason('');
    setLeaveStart('');
    setLeaveEnd('');
    alert('Leave verification document logged on class coordinator console.');
    setActiveTab('dashboard');
  };

  return (
    <div className={`flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans transition-all`} style={{ fontSize: `${accessOptions.zoomLevel}rem` }} id="student-portal-parent">
      
      {/* Student Sidebar navigation */}
      <aside className="w-full lg:w-64 bg-[#0A0D14]/95 backdrop-blur-md text-slate-305 flex flex-col shrink-0 border-r border-slate-950" id="student-sidebar">
        
        {/* Title widget */}
        <div className="p-5 border-b border-white/[0.04] flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white border border-indigo-400">
            SC
          </div>
          <div>
            <h2 className="font-bold text-white text-xs tracking-tight">Smart Campus</h2>
            <p className="text-[10px] text-indigo-400 font-mono">Student Terminal Mode</p>
          </div>
        </div>

        {/* Student Active Profile brief */}
        <div className="p-4 mx-3 my-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center gap-3">
          <img src={student.studentPhoto} alt={student.name} className="h-9 w-9 rounded-lg object-cover border border-white/10" />
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-white truncate">{student.name}</h4>
            <span className="text-[9px] text-[#22c55e] font-mono block truncate">Reg: {student.registerNo}</span>
          </div>
        </div>

        {/* Action item buttons list */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-2.5 ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            <Clock size={15} /> Student Dashboard
          </button>

          <button 
            onClick={() => setActiveTab('mark-attendance')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-2.5 ${
              activeTab === 'mark-attendance' ? 'bg-[#22c55e] text-[#000000] font-black shadow-md shadow-emerald-500/10' : 'hover:bg-white/[0.03] text-emerald-400 hover:text-emerald-300'
            }`}
          >
            <Shield size={15} /> {activeSessionOpen ? '🔓 Check-In Attendance' : '🔒 Attendance Closed'}
          </button>

          <div className="pt-3 pb-1 text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 font-mono">
            Records File
          </div>

          <button 
            onClick={() => setActiveTab('my-attendance')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-2.5 ${
              activeTab === 'my-attendance' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            <Award size={15} /> Attendance Percentage
          </button>

          <button 
            onClick={() => setActiveTab('od-request')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-2.5 ${
              activeTab === 'od-request' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            <Calendar size={15} /> Apply On-Duty (OD)
          </button>

          <button 
            onClick={() => setActiveTab('leave-request')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-2.5 ${
              activeTab === 'leave-request' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            <FileText size={15} /> Apply Leave Form
          </button>

          <button 
            onClick={() => setActiveTab('announcements')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold tracking-tight transition-all flex items-center gap-2.5 ${
              activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            <Volume2 size={15} /> Announcements List
          </button>
        </nav>

        {/* Security mode label */}
        <div className="p-4 border-t border-white/[0.05] text-[10px] text-zinc-500 font-mono text-center">
          <p>Device Registered Account lock</p>
          <p className="mt-0.5 text-[#22c55e]">✔ ONE DEVICE BOUND</p>
        </div>
      </aside>

      {/* Main Student Portal Frame */}
      <main className="flex-1 p-5 lg:p-8 overflow-y-auto" id="student-main-frame">
        
        {/* Profile Card Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
          <div>
            <span className="text-xs text-indigo-600 font-bold font-mono uppercase tracking-widest">Student Portal Gateway</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome, {student.name} 👋</h1>
            <p className="text-xs text-slate-500 font-semibold">Roster Class: {student.department} - {student.section} • Roll ID: {student.rollNo}</p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-650 font-bold shadow-sm">
              Today: {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <span className={`px-2.5 py-2 rounded-xl text-xs font-black ${
              activeSessionOpen ? 'bg-emerald-50 text-emerald-700 animate-bounce' : 'bg-slate-100 text-slate-500'
            }`}>
              {activeSessionOpen ? '🔓 Session Running' : '🔒 Sessions Closed'}
            </span>
          </div>
        </div>

        {/* Conditional tabs render */}
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6" id="student-dashboard-subview">
            
            {/* Rapid percentages widgets */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Total Attendance Rate</span>
                <span className="text-3xl font-black text-slate-800 tracking-tight font-mono">{attendanceRate}%</span>
                <span className={`block text-[10px] font-bold mt-1 ${parseFloat(attendanceRate) >= 85 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {parseFloat(attendanceRate) >= 85 ? '✔ Defaulter Status Clean' : '⚠ Below 85% requirement limit'}
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-slate-700">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">Present Days</span>
                <span className="text-3xl font-black font-mono tracking-tight">{presentDays} Days</span>
                <span className="text-[10px] text-zinc-500 block mt-1">Verified on campus</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-slate-750">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide block">On-Duty Days</span>
                <span className="text-3xl font-black font-mono tracking-tight">{odDays} Days</span>
                <span className="text-[10px] text-indigo-600 block mt-1">Legitimate exemptions</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm text-slate-750">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block">Absent Count</span>
                <span className="text-3xl font-black text-rose-600 font-mono tracking-tight">{totalDays - presentDays - odDays} Days</span>
                <span className="text-[10px] text-rose-500 font-bold block mt-1">No feedback yet</span>
              </div>
            </div>

            {/* Attendance Window Action Call */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Quick Attendance Scanner card hook */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Large checkin banner */}
                <div className="p-6 rounded-3xl bg-[#0F141C] text-slate-300 border border-slate-950 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="relative z-10 text-center md:text-left space-y-2">
                    <span className="text-[10px] font-mono font-bold bg-[#22c55e]/10 text-emerald-400 border border-emerald-400/20 px-2.5 py-1 rounded">
                      SESSION CHECK-IN GATEWAY Active
                    </span>
                    <h3 className="text-2xl font-black text-white tracking-tight">Mark Attendance Secure Portal</h3>
                    <p className="text-xs text-slate-400 leading-normal max-w-md">
                      Requires biometric facial templates, geofence radius confirmation, and physical single-device IMEI checking models.
                    </p>
                    
                    <p className="text-[10px] text-indigo-400 font-mono">Allowed: AI &amp; ML Block - Sector R301 (Radius : 150m)</p>
                  </div>

                  <button
                    onClick={() => setActiveTab('mark-attendance')}
                    className="px-6 py-3 bg-[#22c55e] text-[#000000] font-black rounded-2xl shadow-lg transition-all hover:scale-105 inline-block cursor-pointer text-sm shrink-0 uppercase tracking-wider"
                  >
                    Launch 4-Stage Scanner
                  </button>
                </div>

                {/* History listing */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-800 text-sm mb-4">Your Recent Attendance Logs</h3>
                  <div className="space-y-2.5">
                    {attendanceHistory.map((h) => (
                      <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100/60 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-slate-700">{h.date} • {h.session} Class Duty</p>
                          <span className="text-[10px] text-zinc-400 font-mono block mt-1">📍 Room 301 Campus Geofence • Checked-In: {h.timestamp || 'Not recorded'}</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          h.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                          h.status === 'OD' ? 'bg-amber-50 text-amber-600' :
                          h.status === 'Leave' ? 'bg-purple-50 text-purple-600' :
                          'bg-rose-50 text-rose-600'
                        }`}>
                          {h.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Right Column: Alerts Board */}
              <div className="space-y-6">
                
                {/* Inclusion Priority Assist module indicator */}
                {student.isPriorityAssisted && (
                  <div className="p-4 bg-amber-50/70 border border-amber-100 rounded-2xl">
                    <span className="text-[9px] font-mono font-bold text-amber-700 uppercase tracking-wider block mb-1">Accessibility Priority support enabled</span>
                    <p className="text-xs text-amber-900 leading-normal">
                      Your advisor configured a tailored accessibility support bracket (e.g. <strong>{student.priorityCategory}</strong>). Visual aids, time limits extensions and voice integrations are active on mark.
                    </p>
                  </div>
                )}

                {/* Visual Circulars Widget inline list */}
                <div className="bg-[#0B0E14] text-slate-350 p-5 rounded-2xl border border-slate-900 shadow">
                  <h3 className="font-bold text-white text-xs mb-3 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <Volume2 size={14} className="text-indigo-400 animate-pulse" /> Latest Bulletins List
                  </h3>
                  
                  <div className="space-y-4">
                    {announcements.slice(0, 3).map((ann) => (
                      <div key={ann.id} className="p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl text-xs">
                        <div className="flex justify-between items-start gap-1 mb-1">
                          <h4 className="font-bold text-white text-xs truncate max-w-[150px]">{ann.title}</h4>
                          <span className={`px-1 rounded text-[8px] uppercase font-bold ${
                            ann.priority === 'high' || ann.priority === 'urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-500/20 text-slate-405'
                          }`}>
                            {ann.priority}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* Tab: The interactive 4-Stage Attendance Check in process */}
        {activeTab === 'mark-attendance' && (
          <div className="space-y-6" id="student-verification-stages">
            
            {/* Stage header stepper indicator */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs text-indigo-650 font-bold font-mono uppercase tracking-widest block mb-1">Verification Steps</span>
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Active Step: {currentSessionLabel}</h3>
              </div>
              <button
                onClick={resetVerificationPipeline}
                className="text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
              >
                Reset scanning sequence
              </button>
            </div>

            {/* Stepper progress visuals */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2.5 rounded-xl border font-semibold ${
                vState.currentStage >= 1 && vState.stage1_Device_Status === 'passed' ? 'bg-emerald-50 text-emerald-800 border-emerald-250 font-bold' :
                vState.currentStage === 1 ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-white border-slate-100 text-slate-400'
              }`}>
                Step 1: Check Environment
              </div>
              <div className={`p-2.5 rounded-xl border font-semibold ${
                vState.currentStage >= 2 && vState.stage2_GPS_Status === 'passed' ? 'bg-emerald-50 text-emerald-800 border-emerald-250 font-bold' :
                vState.currentStage === 2 ? 'bg-indigo-50 text-indigo-805 border-indigo-200' : 'bg-white border-slate-100 text-slate-400'
              }`}>
                Step 2: Geofence radius
              </div>
              <div className={`p-2.5 rounded-xl border font-semibold ${
                vState.currentStage >= 3 && vState.stage3_Face_Status === 'passed' ? 'bg-emerald-50 text-emerald-800 border-emerald-255 font-bold' :
                vState.currentStage === 3 ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-white border-slate-100 text-slate-400'
              }`}>
                Step 3: Biometrics
              </div>
              <div className={`p-2.5 rounded-xl border font-semibold ${
                vState.currentStage >= 4 && vState.stage4_Priority_Status === 'passed' ? 'bg-emerald-50 text-emerald-800 border-emerald-250 font-bold' :
                vState.currentStage === 4 ? 'bg-indigo-50 text-indigo-800 border-indigo-200' : 'bg-white border-slate-100 text-slate-400'
              }`}>
                Step 4: Inclusive check
              </div>
            </div>

            {/* Error notifications block */}
            {vState.errorMessage && (
              <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-4 text-xs text-rose-800 flex items-center gap-3 animate-shake font-semibold">
                <AlertTriangle size={24} className="text-rose-500 shrink-0" />
                <div>
                  <p>{vState.errorMessage}</p>
                  <p className="text-[10px] text-rose-500 font-normal mt-1">If this persists, contact HOD terminal for a device reset bypass.</p>
                </div>
              </div>
            )}

            {/* Active Stage Renderer */}
            
            {vState.currentStage === 1 && (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-650">
                  <h4 className="font-bold text-slate-800 text-sm mb-1.5 flex items-center gap-1.5">
                    <Smartphone size={16} className="text-indigo-600 animate-bounce" /> Sub-stage 1: Checking device OS security sandbox
                  </h4>
                  <p>
                    Analyzing superuser binaries (SU permissions), developer setting options, proxy VPN bounds, and authentic signature handshakes.
                  </p>
                </div>
                
                <OSSecurityCheck 
                  interactive 
                  onValidationComplete={proceedStage1} 
                />
              </div>
            )}

            {vState.currentStage === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs text-slate-600">
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <h4 className="font-bold text-slate-850 text-base mb-1 flex items-center gap-1.5">
                    <MapPin size={18} className="text-indigo-600" /> Geofence calibration map (Stage 2)
                  </h4>
                  <p>
                    Smart Campus attendance only logs when your active geofencing coordinates reside within the sector (e.g. Room 301). Slide coordinates below to test boundary limits.
                  </p>

                  <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl space-y-4 font-mono text-xs">
                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Latitude Coordinates</span>
                        <span className="text-slate-800">{gpsLatitude.toFixed(6)}° N</span>
                      </div>
                      <input 
                        type="range" 
                        min={13.0800} 
                        max={13.0850} 
                        step={0.0001} 
                        value={gpsLatitude} 
                        onChange={e => setGpsLatitude(parseFloat(e.target.value))} 
                        className="w-full accent-indigo-600 h-2 bg-slate-200 rounded"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-bold mb-1">
                        <span>Longitude Coordinates</span>
                        <span className="text-slate-800">{gpsLongitude.toFixed(6)}° E</span>
                      </div>
                      <input 
                        type="range" 
                        min={80.2680} 
                        max={80.2720} 
                        step={0.0001} 
                        value={gpsLongitude} 
                        onChange={e => setGpsLongitude(parseFloat(e.target.value))} 
                        className="w-full accent-indigo-600 h-2 bg-slate-200 rounded"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={runCampusGeofencingCheck}
                      disabled={isGpsLoading}
                      className="py-2.5 px-4 bg-[#0B0E14] text-white hover:bg-slate-850 rounded-xl font-bold cursor-pointer transition-all flex items-center gap-2"
                    >
                      {isGpsLoading ? 'Pinging GPS Satellites...' : 'Calculate geofence perimeter'}
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-[#0B0E14] text-slate-350 p-5 rounded-2xl border border-slate-900 shadow">
                    <h5 className="font-bold text-white text-xs mb-2.5 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Shield size={12} className="text-indigo-400" /> Geofence rules
                    </h5>
                    <ul className="space-y-2 leading-relaxed text-[11px] text-slate-400">
                      <li>• Allowed target coordinate sector focal point: <strong>Room 301 (Latitude: 13.082711, Longitude: 80.270712)</strong>.</li>
                      <li>• Allowed maximum distance boundary: <strong>150 meters</strong>.</li>
                      <li>• Simulated override slider allows mimicking target moves for testing.</li>
                    </ul>
                  </div>

                  {isInsideGeofence === true && (
                    <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 flex flex-col justify-between gap-3 animate-bounce">
                      <p className="font-semibold">GPS verification checked inside bound.</p>
                      <button
                        onClick={() => setVState(prev => ({ ...prev, currentStage: 3 }))}
                        className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] uppercase transition-all"
                      >
                        Enter Biometric stage »
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {vState.currentStage === 3 && (
              <div className="space-y-6">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-650">
                  <h4 className="font-bold text-slate-800 text-sm mb-1">Facial Template Recognition Verification (Stage 3)</h4>
                  <p>
                    Verify biometrical liveness checks. Apply simulated eye-blink or head-tilt cues for real anti-spoof checks.
                  </p>
                </div>

                <CameraFeed 
                  onFaceVerified={proceedStage3} 
                  priorityImpairmentMode={accessOptions.simplifiedUI || student.isPriorityAssisted}
                />
              </div>
            )}

            {vState.currentStage === 4 && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-xs text-slate-600">
                <div className="lg:col-span-2 space-y-4">
                  
                  {/* Priority Inclusion Widget Integration */}
                  <InclusionPriorityWidget 
                    student={student}
                    onOverrideApplied={(cat, opts) => {
                      setAccessOptions({
                        zoomLevel: opts.zoomLevel,
                        extendedGracePeriod: opts.extendedGracePeriod,
                        vocalGuidance: opts.vocalGuidance,
                        simplifiedUI: opts.simplifiedUI
                      });
                    }}
                    readAloudText={`Hello ${student.name}. You have reached absolute Stage 4 of our smart campus intake. Click the inclusive submit indicator below to permanently lock attendance.`}
                  />

                </div>

                <div className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-md col-span-1 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-850 text-sm">Attendance intake final step</h4>
                    <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                      All security criteria, device checks, coordinates, and anti-spoof checks have been executed successfully.
                    </p>
                  </div>

                  <button
                    onClick={completeInclusionStage4}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow hover:shadow-lg text-xs uppercase tracking-wider cursor-pointer transition-all"
                  >
                    Confirm &amp; Finalize Attendance Report
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* Tab: My Attendance percent list */}
        {activeTab === 'my-attendance' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in" id="student-attendance-records-station">
            <h3 className="font-bold text-slate-850 text-base mb-1">Institutional Attendance Log Overview</h3>
            <p className="text-xs text-slate-500 mb-5">Analyze historic check-ins registered inside geofence parameters.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 font-mono">
                    <th className="px-4 py-3 rounded-l-md">Session Calendar Duty</th>
                    <th className="px-4 py-3">Hardware IMEI ID used</th>
                    <th className="px-4 py-3">Checked Geolocation Log</th>
                    <th className="px-4 py-3">Face Verified State</th>
                    <th className="px-4 py-3 rounded-r-md text-right font-bold">Status Code</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendanceHistory.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5 font-semibold text-slate-750">{h.date} • {h.session}</td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#4f46e5]">
                        {h.deviceValid ? '✔ VERIFIED_MOBILE_ID_MATCH' : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 text-zinc-500 italic max-w-sm truncate">{h.location || 'Exempted Duty / Not inside geofence'}</td>
                      <td className="px-4 py-3.5 font-bold text-emerald-600">
                        {h.faceValid ? '✔ FACIAL_MESH_MATCH_OK' : 'N/A'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono">
                        <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${
                          h.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                          h.status === 'OD' ? 'bg-amber-50 text-amber-700 font-bold' :
                          h.status === 'Leave' ? 'bg-purple-50 text-purple-705' :
                          'bg-rose-50 text-rose-600 animate-pulse'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: File OD Request */}
        {activeTab === 'od-request' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in" id="student-od-register-subview">
            <h3 className="font-bold text-slate-800 text-lg mb-1">File On-Duty Request (OD Application)</h3>
            <p className="text-xs text-slate-500 mb-5">Students joining external technical symposiums, paper representations, or sports can lodge OD certificates.</p>

            <form onSubmit={handleApplyOD} className="space-y-4 max-w-xl">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Reason for OD absence *</label>
                <input 
                  type="text" 
                  value={odReason} 
                  onChange={e => setOdReason(e.target.value)} 
                  placeholder="e.g. National Level Web Hackathon, Symposium at XYZ College" 
                  className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Date of OD exemption *</label>
                <input 
                  type="date" 
                  value={odDate} 
                  onChange={e => setOdDate(e.target.value)} 
                  className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl bg-white"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Upload proof document (PDF/JPG) *</label>
                <div className="p-4 bg-slate-50 border border-slate-205 rounded-xl text-center text-xs">
                  <p className="text-zinc-500 font-medium">Drag certificates here, or click to simulation upload</p>
                  <span className="font-mono text-[10px] text-indigo-600 font-bold block mt-1.5">{odProof} ✔</span>
                </div>
              </div>

              <button 
                type="submit" 
                className="py-2.5 px-6 bg-indigo-650 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer text-center"
              >
                Submit OD Document
              </button>
            </form>
          </div>
        )}

        {/* Tab: File Leave Form */}
        {activeTab === 'leave-request' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow animate-fade-in" id="student-leave-register-subview">
            <h3 className="font-bold text-slate-800 text-base mb-1">File Leave Application Form</h3>
            <p className="text-xs text-slate-500 mb-5">Lodge medical leaves or domestic emergencies on class coordinator portal.</p>

            <form onSubmit={handleApplyLeave} className="space-y-4 max-w-xl">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Leave Reason context *</label>
                <input 
                  type="text" 
                  value={leaveReason} 
                  onChange={e => setLeaveReason(e.target.value)} 
                  placeholder="e.g. Throat Viral Infection, Sister's wedding event" 
                  className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    value={leaveStart} 
                    onChange={e => setLeaveStart(e.target.value)} 
                    className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={leaveEnd} 
                    onChange={e => setLeaveEnd(e.target.value)} 
                    className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl bg-white"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-750 text-white font-bold rounded-xl text-xs cursor-pointer text-center"
              >
                Submit Leaf Form
              </button>
            </form>
          </div>
        )}

        {/* Tab: Announcements */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in" id="student-announcements-subview">
            <h3 className="font-bold text-slate-805 text-base mb-1">Institutional Broadcasts Alerts List</h3>
            <p className="text-xs text-slate-500 mb-5">Bulletins lists from HOD and your Advisor.</p>

            <div className="space-y-4 max-w-3xl">
              {announcements.map((ann) => (
                <div key={ann.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs">
                  <div className="flex justify-between items-start gap-2 mb-1.5">
                    <h4 className="font-bold text-slate-850 text-sm">{ann.title}</h4>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                      ann.priority === 'urgent' || ann.priority === 'high' ? 'bg-rose-500/20 text-rose-700' : 'bg-slate-500/20 text-slate-500'
                    }`}>
                      {ann.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-zinc-650 leading-relaxed font-semibold text-[11px] mt-1.5">{ann.content}</p>
                  <span className="text-[10px] font-mono text-zinc-400 block mt-2">Dispatched by: {ann.senderName} ({ann.senderRole}) • {ann.createdAt}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
