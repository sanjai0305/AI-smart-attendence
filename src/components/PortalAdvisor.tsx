import React, { useState } from 'react';
import { 
  Users, UserPlus, CheckSquare, Calendar, ShieldCheck, 
  Settings, Clock, Bell, LogOut, CheckCircle, XCircle, 
  Lock, Radio, PlayCircle, PlusCircle, Volume2, ShieldAlert
} from 'lucide-react';
import { Student, AttendanceRecord, ODRequest, Announcement, LeaveRequest } from '../types';

interface PortalAdvisorProps {
  students: Student[];
  attendance: AttendanceRecord[];
  odRequests: ODRequest[];
  leaveRequests: LeaveRequest[];
  announcements: Announcement[];
  onAddStudent: (student: Student) => void;
  onApproveOD: (id: string, isApproved: boolean) => void;
  onApproveLeave: (id: string, isApproved: boolean) => void;
  onStartSession: (session: 'Morning' | 'Afternoon', openHours: string) => void;
  onSendAnnouncement: (title: string, content: string, priority: 'low' | 'medium' | 'high' | 'urgent') => void;
  isMorningSessionOpen: boolean;
  isAfternoonSessionOpen: boolean;
  onToggleSession: (session: 'Morning' | 'Afternoon') => void;
}

export default function PortalAdvisor({
  students,
  attendance,
  odRequests,
  leaveRequests,
  announcements,
  onAddStudent,
  onApproveOD,
  onApproveLeave,
  onStartSession,
  onSendAnnouncement,
  isMorningSessionOpen,
  isAfternoonSessionOpen,
  onToggleSession
}: PortalAdvisorProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'my-students' | 'register-student' | 'take-attendance' | 'attendance-records' | 'od-requests' | 'leave-requests' | 'announcements' | 'profile'>('dashboard');

  // Register Student state
  const [stuName, setStuName] = useState('');
  const [stuReg, setStuReg] = useState('');
  const [stuRoll, setStuRoll] = useState('');
  const [stuParentMobile, setStuParentMobile] = useState('');
  const [stuParentEmail, setStuParentEmail] = useState('');
  const [hasFaceReg, setHasFaceReg] = useState(false);
  const [hasDeviceReg, setHasDeviceReg] = useState(false);
  const [stuPhoto, setStuPhoto] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop');
  const [priorityCategory, setPriorityCategory] = useState<'none' | 'children' | 'disability_vision' | 'disability_motor' | 'disability_hearing'>('none');

  // Parent OTP simulation
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);

  // Announcement state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annPriority, setAnnPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  // Quick statistics
  const totalStudents = students.length;
  const presentToday = attendance.filter(a => a.status === 'Present').length;
  const absentToday = attendance.filter(a => a.status === 'Absent').length;
  const odToday = attendance.filter(a => a.status === 'OD').length;

  const handleSendOtp = () => {
    if (!stuParentMobile) {
      alert('Please enter parent mobile first');
      return;
    }
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(generatedOtp);
    setOtpSent(true);
    setOtpVerified(false);
    alert(`Secure parent encryption handshake SMS dispatched. OTP: ${generatedOtp} (Active for verification)`);
  };

  const handleVerifyOtp = () => {
    if (enteredOtp === otpCode) {
      setOtpVerified(true);
      alert('Parent OTP authentication completed successfully. Communication channel bonded.');
    } else {
      alert('Incorrect OTP code verification sequence. Try again.');
    }
  };

  const handleRegisterStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName || !stuReg || !stuRoll) {
      alert('Filled required credential slots is necessary.');
      return;
    }
    if (!otpVerified && stuParentMobile) {
      alert('Please complete Parent OTP handshake sequence first.');
      return;
    }

    const newStudent: Student = {
      id: `STU_${Math.floor(10000 + Math.random() * 90000)}`,
      name: stuName,
      registerNo: stuReg,
      rollNo: stuRoll,
      department: 'AI & ML',
      section: 'Section A',
      parentMobile: stuParentMobile,
      parentEmail: stuParentEmail,
      studentPhoto: stuPhoto,
      faceRegistered: hasFaceReg,
      deviceId: hasDeviceReg ? `DEV_SIM_${Math.floor(1000 + Math.random() * 9000)}` : undefined,
      deviceModel: hasDeviceReg ? 'Authorized Student Mobile' : undefined,
      isPriorityAssisted: priorityCategory !== 'none',
      priorityCategory: priorityCategory
    };

    onAddStudent(newStudent);

    // reset
    setStuName('');
    setStuReg('');
    setStuRoll('');
    setStuParentMobile('');
    setStuParentEmail('');
    setHasFaceReg(false);
    setHasDeviceReg(false);
    setOtpSent(false);
    setOtpVerified(false);
    setEnteredOtp('');
    setPriorityCategory('none');

    alert(`Student ${stuName} is successfully registered in Class Roster.`);
  };

  const handleSendCircular = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    onSendAnnouncement(annTitle, annContent, annPriority);
    setAnnTitle('');
    setAnnContent('');
    alert('Circular dispatched for all students.');
  };

  // Switch photo previews
  const setRandomAvatar = () => {
    const avatars = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop',
      'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200&h=200&fit=crop'
    ];
    setStuPhoto(avatars[Math.floor(Math.random() * avatars.length)]);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-slate-50 font-sans" id="advisor-portal-parent">
      
      {/* Sidebar Layout */}
      <aside className="w-full lg:w-64 bg-[#0F141C] text-slate-300 flex flex-col shrink-0 border-r border-slate-950" id="advisor-sidebar">
        
        {/* Header Title */}
        <div className="p-5 border-b border-white/[0.05] flex items-center gap-3">
          <div className="h-9 w-9 bg-indigo-500 rounded-xl flex items-center justify-center font-bold text-white border border-indigo-400">
            SC
          </div>
          <div>
            <h2 className="font-bold text-white text-sm">Smart Campus</h2>
            <p className="text-[10px] text-indigo-400 font-mono">Advisor Workspace</p>
          </div>
        </div>

        {/* Advisor Credentials Info */}
        <div className="p-4 mx-3 my-3 bg-white/[0.02] border border-white/[0.05] rounded-xl flex items-center justify-between">
          <div className="overflow-hidden">
            <h4 className="text-xs font-semibold text-white truncate">Dr. R. Karthikeyan</h4>
            <span className="text-[9px] text-emerald-400 font-mono block mt-0.5">Duty: AI &amp; ML Sector A</span>
          </div>
          <span className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
        </div>

        {/* Nav list */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto pt-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <Clock size={15} /> Dashboard Overview
          </button>

          <button 
            onClick={() => setActiveTab('take-attendance')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'take-attendance' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <PlayCircle size={15} className="text-emerald-400" /> Attendance Windows
          </button>

          <div className="pt-3 pb-1 text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 font-mono">
            Roster &amp; Registry
          </div>

          <button 
            onClick={() => setActiveTab('my-students')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'my-students' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <Users size={15} /> Student Registry ({totalStudents})
          </button>

          <button 
            onClick={() => setActiveTab('register-student')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'register-student' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <UserPlus size={15} /> Enroll Student
          </button>

          <button 
            onClick={() => setActiveTab('attendance-records')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'attendance-records' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <CheckSquare size={15} /> Record Audits
          </button>

          <div className="pt-3 pb-1 text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 font-mono">
            Filing Status
          </div>

          <button 
            onClick={() => setActiveTab('od-requests')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'od-requests' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <Calendar size={15} /> OD Submissions
            {odRequests.filter(r => r.status === 'Pending').length > 0 && (
              <span className="bg-amber-500 text-white font-mono px-1.5 py-0.2 rounded-full text-[9px] font-bold ml-auto">
                {odRequests.filter(r => r.status === 'Pending').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('leave-requests')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'leave-requests' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <Clock size={15} /> Leave Submissions
            {leaveRequests.filter(l => l.status === 'Pending').length > 0 && (
              <span className="bg-blue-500 text-white font-mono px-1.5 py-0.2 rounded-full text-[9px] font-bold ml-auto animate-pulse flex items-center">
                {leaveRequests.filter(l => l.status === 'Pending').length}
              </span>
            )}
          </button>

          <button 
            onClick={() => setActiveTab('announcements')}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2.5 ${
              activeTab === 'announcements' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-white/[0.03] hover:text-white'
            }`}
          >
            <Bell size={15} /> Dispatch Bulletins
          </button>
        </nav>

        <div className="p-4 border-t border-white/[0.05] text-[10px] text-slate-500 font-mono text-center">
          <p>Advisor Sandbox Connected</p>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <main className="flex-1 p-5 lg:p-8 overflow-y-auto" id="advisor-main-frame">
        
        {/* Sub-header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 mb-6">
          <div>
            <span className="text-xs text-indigo-600 font-bold font-mono uppercase tracking-widest">Departmental Workspace</span>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome, Class Advisor 🤝</h1>
            <p className="text-xs text-slate-500 font-medium">Securing AI &amp; ML Block • Section A Class Group</p>
          </div>

          <div className="flex gap-2">
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl px-3 py-1.5 font-bold flex items-center gap-1.5">
              <span className="h-2 w-2 bg-emerald-500 rounded-full animate-ping" />
              AI Face Engine Loaded
            </span>
          </div>
        </div>

        {/* Multi-Tab Render View */}
        
        {activeTab === 'dashboard' && (
          <div className="space-y-6" id="advisor-dashboard-subview">
            
            {/* Standard Dashboard Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm col-span-2 md:col-span-1">
                <span className="text-xs text-slate-400 font-semibold block uppercase">Your Students</span>
                <span className="text-3xl font-black text-slate-800 font-mono tracking-tight">{totalStudents}</span>
                <p className="text-[10px] text-indigo-600 font-bold mt-1">Section A roster</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xs text-slate-400 font-semibold block uppercase">Present Today</span>
                <span className="text-3xl font-black text-emerald-600 font-mono tracking-tight">{presentToday}</span>
                <p className="text-[10px] text-zinc-500 mt-1">Active inside Room</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xs text-slate-400 font-semibold block uppercase">Absent Today</span>
                <span className="text-3xl font-black text-rose-600 font-mono tracking-tight">{absentToday}</span>
                <p className="text-[10px] text-rose-500/80 font-medium mt-1">Requires follow-up</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <span className="text-xs text-slate-400 font-semibold block uppercase">OD Granted</span>
                <span className="text-3xl font-black text-amber-600 font-mono tracking-tight">{odToday}</span>
                <p className="text-[10px] text-zinc-400 mt-1">Legitimate check</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-semibold block uppercase">Window state</span>
                  <span className={`text-xs font-black block mt-1.5 ${isMorningSessionOpen || isAfternoonSessionOpen ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {isMorningSessionOpen || isAfternoonSessionOpen ? '🔓 OPENING' : '🔒 CLOSED'}
                  </span>
                </div>
                <button onClick={() => setActiveTab('take-attendance')} className="text-left text-[10px] text-indigo-600 hover:underline font-bold mt-1">
                  Adjust timing »
                </button>
              </div>
            </div>

            {/* Attendance Window Overview Block */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                
                {/* Active Class list summary */}
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                  <h3 className="font-bold text-slate-855 text-base mb-4">Active Session Attendance (Real-time logs)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead>
                        <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 font-mono">
                          <th className="px-3 py-2 rounded-l-md">Student</th>
                          <th className="px-3 py-2">Verification Stage</th>
                          <th className="px-3 py-2">Location Log</th>
                          <th className="px-3 py-2">Timestamp</th>
                          <th className="px-3 py-2 rounded-r-md text-right">Attendance Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendance.map((att) => (
                          <tr key={att.id} className="hover:bg-slate-50/50">
                            <td className="px-3 py-2.5">
                              <div>
                                <p className="font-bold text-slate-800">{att.studentName}</p>
                                <p className="text-[9px] text-zinc-400 font-mono">{att.registerNo}</p>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 font-mono text-[10px]">
                              {att.status === 'Present' ? (
                                <span className="text-emerald-600 font-bold">Stage {att.stageReached || 4} Completed</span>
                              ) : att.status === 'OD' ? (
                                <span className="text-amber-600 font-bold">OD Overwrite</span>
                              ) : att.status === 'Leave' ? (
                                <span className="text-purple-600 font-bold">Leave Override</span>
                              ) : (
                                <span className="text-zinc-400">Not check-in</span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-zinc-650 max-w-[150px] truncate">{att.location || 'N/A'}</td>
                            <td className="px-3 py-2.5 font-mono text-[10px] text-slate-500">{att.timestamp || '--:--'}</td>
                            <td className="px-3 py-2.5 text-right">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                att.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                att.status === 'OD' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                                att.status === 'Leave' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                'bg-rose-50 text-rose-600 border border-rose-100 animate-pulse'
                              }`}>
                                {att.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* Action Sidebar */}
              <div className="space-y-6">
                
                {/* Visual Attendance Open Close controller */}
                <div className="bg-[#0B0E14] text-white p-5 rounded-2xl border border-slate-900 shadow">
                  <h3 className="font-bold text-white text-xs mb-3 uppercase tracking-wider font-mono">Quick Attendance Control</h3>
                  
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                      <div>
                        <p className="font-bold text-white">Morning Session</p>
                        <p className="text-[10px] text-slate-400 font-mono">Timings: 09:00 AM - 10:00 AM</p>
                      </div>

                      <button
                        onClick={() => onToggleSession('Morning')}
                        className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer border ${
                          isMorningSessionOpen 
                            ? 'bg-emerald-500/15 text-[#22c55e] border-[#22c55e]' 
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        {isMorningSessionOpen ? 'ACTIVE OPEN' : 'CLOSED'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/[0.05] rounded-xl">
                      <div>
                        <p className="font-bold text-white">Afternoon Session</p>
                        <p className="text-[10px] text-slate-400 font-mono">Timings: 02:00 PM - 02:30 PM</p>
                      </div>

                      <button
                        onClick={() => onToggleSession('Afternoon')}
                        className={`px-3 py-1 rounded text-[10px] font-bold cursor-pointer border ${
                          isAfternoonSessionOpen 
                            ? 'bg-emerald-500/15 text-[#22c55e] border-[#22c55e]' 
                            : 'bg-white/5 text-slate-400 border-white/10'
                        }`}
                      >
                        {isAfternoonSessionOpen ? 'ACTIVE OPEN' : 'CLOSED'}
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* Tab: Attendance Session controllers */}
        {activeTab === 'take-attendance' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm" id="advisor-take-attendance-subview">
            <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-1.5 animate-pulse">
              <Clock size={20} className="text-emerald-500" /> Administrative Class-level Session controller
            </h3>
            <p className="text-xs text-slate-500 mb-6">Start dynamic sessions, configure window intervals manually. Outside verified limits, students cannot override.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2 flex justify-between items-center">
                  <span>🌅 Morning Schedule</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${isMorningSessionOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                    {isMorningSessionOpen ? 'Open active' : 'Locked'}
                  </span>
                </h4>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <p>Open timeframe parameter slot: <strong>09:00 AM</strong></p>
                  <p>Close timeframe parameter slot: <strong>10:00 AM</strong></p>
                  <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">
                    Student locks applied automatically at 10:00 AM. Geofence tracking required for validation checks.
                  </p>
                </div>

                <button
                  onClick={() => onToggleSession('Morning')}
                  className={`w-full py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    isMorningSessionOpen 
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-inner' 
                      : 'bg-[#0B0E14] text-white hover:bg-slate-850 shadow'
                  }`}
                >
                  {isMorningSessionOpen ? 'Emergency Shutdown Morning Session' : 'Activate Morning Session Manual Bypass'}
                </button>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2 flex justify-between items-center">
                  <span>🌇 Afternoon Schedule</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded ${isAfternoonSessionOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                    {isAfternoonSessionOpen ? 'Open active' : 'Locked'}
                  </span>
                </h4>

                <div className="space-y-2.5 text-xs text-slate-600">
                  <p>Open timeframe parameter slot: <strong>02:00 PM</strong></p>
                  <p>Close timeframe parameter slot: <strong>02:30 PM</strong></p>
                  <p className="text-[11px] text-zinc-500 font-mono leading-relaxed">
                    Automatic lockout limits at 2:30 PM. One-device verification matching system active.
                  </p>
                </div>

                <button
                  onClick={() => onToggleSession('Afternoon')}
                  className={`w-full py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                    isAfternoonSessionOpen 
                      ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-inner' 
                      : 'bg-[#0B0E14] text-white hover:bg-slate-850 shadow'
                  }`}
                >
                  {isAfternoonSessionOpen ? 'Emergency Shutdown Afternoon Session' : 'Activate Afternoon Session Manual Bypass'}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* Tab: Student Registry */}
        {activeTab === 'my-students' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in" id="advisor-students-subview">
            <h3 className="font-bold text-slate-800 text-base mb-1">Students Roster - Section A</h3>
            <p className="text-xs text-slate-500 mb-4">View enrolled students, biometric verification status, and device logs.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-[#0F141C] text-slate-350 text-[10px] uppercase font-bold font-mono">
                    <th className="px-4 py-3 rounded-l-md">Student Detail</th>
                    <th className="px-4 py-3">Register / Roll</th>
                    <th className="px-4 py-3">Parent contact</th>
                    <th className="px-4 py-3">Device ID Log</th>
                    <th className="px-4 py-3">Accessibility Overwrites</th>
                    <th className="px-4 py-3 rounded-r-md text-right">Biometric Signed</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <img src={stu.studentPhoto} alt={stu.name} className="h-7 w-7 rounded object-cover border" />
                          <span className="font-bold text-slate-800">{stu.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px]">
                        <p>{stu.registerNo}</p>
                        <p className="text-zinc-400 text-[10px]">{stu.rollNo}</p>
                      </td>
                      <td className="px-4 py-3.5 text-[11px]">
                        <p className="font-medium text-slate-700">{stu.parentMobile}</p>
                        <p className="text-zinc-400 select-all">{stu.parentEmail}</p>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-zinc-650 font-bold">
                        {stu.deviceId || 'NOT_LINKED'}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {stu.isPriorityAssisted ? (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 font-bold text-[9px] rounded-lg block uppercase border border-amber-200">
                            Inclusive Active
                          </span>
                        ) : (
                          <span className="text-slate-400">None</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          stu.faceRegistered ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                          {stu.faceRegistered ? 'FACE CONFIGURED ✔' : 'AWAITING REG'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Enroll Student */}
        {activeTab === 'register-student' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="advisor-register-student-subview">
            
            {/* Onboarding form */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-1.5">
                <PlusCircle size={20} className="text-[#4f46e5]" /> Onboard New Student
              </h3>
              <p className="text-xs text-slate-500 mb-5">Enroll students under your Section. Complete secure multi-device parameters and parent verification.</p>

              <form onSubmit={handleRegisterStudentSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Student Name *</label>
                    <input 
                      type="text" 
                      value={stuName} 
                      onChange={e => setStuName(e.target.value)} 
                      placeholder="e.g. Arun Kumar" 
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Roll ID Number *</label>
                    <input 
                      type="text" 
                      value={stuRoll} 
                      onChange={e => setStuRoll(e.target.value)} 
                      placeholder="e.g. 21AML01" 
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Register Number *</label>
                    <input 
                      type="text" 
                      value={stuReg} 
                      onChange={e => setStuReg(e.target.value)} 
                      placeholder="e.g. 21AIML045" 
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-450 block mb-1">Accessibility Group Option</label>
                    <select
                      value={priorityCategory}
                      onChange={e => setPriorityCategory(e.target.value as any)}
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl bg-white"
                    >
                      <option value="none">Standard Enrollment Mode (Strict)</option>
                      <option value="children">Young Student / Visitor Under 15</option>
                      <option value="disability_vision">Disability Support (Visual guidance read)</option>
                      <option value="disability_motor">Disability Support (Dexterity targets, relaxed times)</option>
                      <option value="disability_hearing">Disability Support (Hearing flashing confirmation)</option>
                    </select>
                  </div>
                </div>

                {/* Parent Otp Integration block requested */}
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Parent OTP Verification Handshake</span>
                    {otpVerified ? (
                      <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-bold">✔ HANDSHAKE OK</span>
                    ) : (
                      <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded animate-pulse">AWAITING HANDSHAKE</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Parent Mobile *</label>
                      <div className="flex gap-2">
                        <input 
                          type="tel" 
                          value={stuParentMobile} 
                          onChange={e => setStuParentMobile(e.target.value)} 
                          placeholder="e.g. +91 9988776655" 
                          className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl bg-white"
                          required
                        />
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="px-3 py-2 bg-[#0B0E14] text-white hover:bg-slate-850 text-xs rounded-xl font-bold cursor-pointer transition-all"
                        >
                          Send OTP
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Parent Email *</label>
                      <input 
                        type="email" 
                        value={stuParentEmail} 
                        onChange={e => setStuParentEmail(e.target.value)} 
                        placeholder="parent.office@mail.com" 
                        className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl"
                        required
                      />
                    </div>
                  </div>

                  {otpSent && !otpVerified && (
                    <div className="pt-2 flex gap-2 items-end max-w-sm">
                      <div className="flex-1">
                        <label className="text-[9px] uppercase font-extrabold text-[#4f46e5] block mb-1">Enter Generated Parent OTP code</label>
                        <input 
                          type="text" 
                          value={enteredOtp} 
                          onChange={e => setEnteredOtp(e.target.value)} 
                          placeholder="4-digit code" 
                          className="w-full text-xs p-2 border border-zinc-250 rounded-xl bg-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Verify Code
                      </button>
                    </div>
                  )}
                </div>

                {/* Device registry lock options */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-slate-50/40 space-y-3">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">Biometrics &amp; Hardware bonding options</span>
                  
                  <div className="flex items-center gap-6 text-xs text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={hasFaceReg} 
                        onChange={e => setHasFaceReg(e.target.checked)} 
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-0" 
                      />
                      <span>Enable biometric template storage on device</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={hasDeviceReg} 
                        onChange={e => setHasDeviceReg(e.target.checked)} 
                        className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-0" 
                      />
                      <span>Encrypt and bond IMEI/Device MAC identifier</span>
                    </label>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-2.5 bg-[#4f46e5] hover:bg-neutral-800 text-white font-bold rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  Confirm and Onboard Student Active Registry
                </button>
              </form>
            </div>

            {/* Profile visual selector helper */}
            <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm text-center flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-4">Student Photo ID</span>
                <img src={stuPhoto} alt="Student Blueprint" className="h-40 w-40 rounded-full object-cover border-4 border-white shadow-xl mx-auto mb-4 scale-x-[-1] animate-pulse" />
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mb-4">
                  For anti-spoof checks, the biometric reference image must match facial scan nodes.
                </p>
              </div>

              <button
                type="button"
                onClick={setRandomAvatar}
                className="py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-bold text-xs"
              >
                Simulate Face Registry Upload
              </button>
            </div>

          </div>
        )}

        {/* Tab: Attendance Records */}
        {activeTab === 'attendance-records' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in" id="advisor-records-subview">
            <h3 className="font-bold text-slate-800 text-base mb-1">Complete Section-A Attendance Records</h3>
            <p className="text-xs text-slate-500 mb-4">Audit history by student with geofence, device keys, and stage completion stats.</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead>
                  <tr className="bg-slate-50 text-[10px] uppercase font-bold text-slate-400 font-mono">
                    <th className="px-3 py-2 rounded-l-md">Student</th>
                    <th className="px-3 py-2">Session</th>
                    <th className="px-3 py-2">GPS Coordinates Valid</th>
                    <th className="px-3 py-2">Registered Device Valid</th>
                    <th className="px-3 py-2">Face Biometrics OK</th>
                    <th className="px-3 py-2 rounded-r-md text-right">Registered Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {attendance.map((att) => (
                    <tr key={att.id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-3">
                        <span className="font-bold text-slate-800">{att.studentName}</span>
                        <span className="text-[9px] text-zinc-400 font-mono block">{att.registerNo}</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="font-mono bg-zinc-100 text-zinc-700 px-1.5 py-0.2 rounded text-[9px]">
                          {att.session}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${att.gpsValid ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                          {att.gpsValid ? '✔ GPS geofence inside campus' : '✘ Outside allowed perimeter'}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-semibold font-mono text-[10px]">
                        {att.deviceValid ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">✔ Registered hardware matches ID</span>
                        ) : (
                          <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded animate-pulse">✘ Blocked device sign-in</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] ${att.faceValid ? 'text-emerald-700 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                          {att.faceValid ? '✔ Biometric verified' : '✘ Template match failure'}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          att.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                          att.status === 'OD' ? 'bg-amber-50 text-amber-700 border border-amber-100' :
                          att.status === 'Leave' ? 'bg-indigo-50 text-indigo-600 border border-indigo-150' :
                          'bg-rose-50 text-rose-620 border border-rose-100 animate-pulse'
                        }`}>
                          {att.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: OD Requests */}
        {activeTab === 'od-requests' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in" id="advisor-od-requests-subview">
            <h3 className="font-bold text-slate-800 text-lg mb-1">On-Duty Requests</h3>
            <p className="text-xs text-slate-500 mb-5">Approve or deny OD forms filed by Section students.</p>

            <div className="space-y-3">
              {odRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 text-sm">{req.studentName}</span>
                      <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2 py-0.2 rounded font-bold">
                        {req.registerNo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1"><strong className="text-slate-500">Reason:</strong> {req.reason}</p>
                    <div className="flex gap-4 mt-2 font-mono text-[10px] text-zinc-400">
                      <span>📆 OD Date: <strong className="text-slate-700 font-semibold">{req.date}</strong></span>
                      <span>📁 Proof document: <span className="text-indigo-600 underline font-semibold cursor-pointer">{req.proofUrl}</span></span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {req.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => onApproveOD(req.id, true)}
                          className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow hover:bg-emerald-700 cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => onApproveOD(req.id, false)}
                          className="px-3.5 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow hover:bg-rose-700 cursor-pointer"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'
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

        {/* Tab: Leave requests with active state mutation */}
        {activeTab === 'leave-requests' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100/90 shadow animate-fade-in" id="advisor-leave-requests-subview">
            <h3 className="font-bold text-slate-800 text-base mb-1">Leave Application Submissions</h3>
            <p className="text-xs text-slate-500 mb-5">Validate leave applications backed by parenting OTP parameters.</p>

            <div className="space-y-3.5">
              {leaveRequests.map((req) => (
                <div key={req.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-800 text-sm block">{req.studentName}</span>
                    <p className="text-xs text-slate-650 mt-1 font-medium"><strong className="text-slate-400">Reason:</strong> {req.reason}</p>
                    <div className="flex gap-4 mt-2 font-mono text-[10px] text-zinc-400">
                      <span>📆 Start: {req.startDate}</span>
                      <span>📆 End: {req.endDate}</span>
                      <span>🕒 Filed: {req.raisedAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {req.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => onApproveLeave(req.id, true)}
                          className="px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 font-bold rounded-lg text-xs shadow cursor-pointer text-center"
                        >
                          Grant Leave
                        </button>
                        <button
                          onClick={() => onApproveLeave(req.id, false)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-xs border cursor-pointer text-center"
                        >
                          Reject
                        </button>
                      </>
                    ) : (
                      <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                        req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
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

        {/* Tab: Dispatch bulletins */}
        {activeTab === 'announcements' && (
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm animate-fade-in" id="advisor-announcements-subview">
            <h3 className="font-bold text-slate-800 text-base mb-1">Broadcast Section-A bulletins list</h3>
            <p className="text-xs text-slate-500 mb-5">Target students with class homework targets, schedules, or test pointers.</p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
              <div className="lg:col-span-2 space-y-3">
                {announcements.map((ann) => (
                  <div key={ann.id} className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl text-xs">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-bold text-slate-850 text-sm">{ann.title}</h4>
                      <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                        ann.priority === 'urgent' || ann.priority === 'high' ? 'bg-rose-500/20 text-rose-700' : 'bg-slate-500/20 text-slate-500'
                      }`}>
                        {ann.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-zinc-500 leading-relaxed text-[11px] mt-1.5 font-medium">{ann.content}</p>
                    <span className="text-[9px] text-zinc-400 font-mono block mt-2">Dispatched by {ann.senderName} • {ann.createdAt}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-800 text-sm mb-3">Broadcast new circular</h4>
                <form onSubmit={handleSendCircular} className="space-y-3.5">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Alert Title</label>
                    <input 
                      type="text" 
                      value={annTitle} 
                      onChange={e => setAnnTitle(e.target.value)} 
                      placeholder="e.g. LAB REVIEW SCHEDULE" 
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Message Detail</label>
                    <textarea 
                      value={annContent} 
                      onChange={e => setAnnContent(e.target.value)} 
                      placeholder="Enter detailed homework/scheduling list..." 
                      rows={4} 
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl bg-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Severity Priority</label>
                    <select 
                      value={annPriority} 
                      onChange={e => setAnnPriority(e.target.value as any)} 
                      className="w-full text-xs p-2.5 border border-zinc-200 rounded-xl bg-white"
                    >
                      <option value="low">Standard level info</option>
                      <option value="medium">Medium alert level</option>
                      <option value="high">Urget assignment schedules (High)</option>
                    </select>
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs cursor-pointer text-center"
                  >
                    Broadcast Circular To Students
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
