/**
 * Smart Campus AI Attendance System
 * Main Application Hub with Cross-Portal State Engine
 */

import React, { useState, useEffect } from 'react';
import { 
  localDb, 
  SEED_ADVISORS, 
  SEED_STUDENTS, 
  SEED_ATTENDANCE, 
  SEED_OD_REQUESTS, 
  SEED_LEAVE_REQUESTS, 
  SEED_ANNOUNCEMENTS, 
  SEED_AUDIT_LOGS,
  SEED_DEPARTMENTS,
  SEED_DEVICES
} from './data';
import { Advisor, Student, AttendanceRecord, ODRequest, LeaveRequest, Announcement, AuditLog, Department } from './types';
import PortalHOD from './components/PortalHOD';
import PortalAdvisor from './components/PortalAdvisor';
import PortalStudent from './components/PortalStudent';
import { ShieldCheck, Layers, Radio, RefreshCw, KeyRound, HardDrive, Sparkles, UserCheck, Users, HelpCircle, LogOut } from 'lucide-react';

// --- Firebase Connections & SDK Primitives ---
import { db, auth, OperationType, handleFirestoreError } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';

export default function App() {
  // Roles and Auth States
  const [currentUser, setCurrentUser] = useState<{
    role: 'HOD' | 'ADVISOR' | 'STUDENT' | null;
    id: string;
    name: string;
    emailOrReg: string;
  } | null>(null);

  // Active Database State collections
  const [advisors, setAdvisors] = useState<Advisor[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [odRequests, setOdRequests] = useState<ODRequest[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [departments] = useState<Department[]>(SEED_DEPARTMENTS);

  // Timing session controls
  const [isMorningOpen, setIsMorningOpen] = useState(true);
  const [isAfternoonOpen, setIsAfternoonOpen] = useState(false);

  // Authentication Fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginRole, setLoginRole] = useState<'HOD' | 'ADVISOR' | 'STUDENT'>('STUDENT');

  // --- Firebase Sync States ---
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Silent anonymous sign-in on mount for frictionless rule testing
  useEffect(() => {
    const checkAuthAndSync = async () => {
      try {
        const userCredential = await signInAnonymously(auth);
        setFirebaseUser(userCredential.user);
        setSyncEnabled(true);
        setSyncStatus('synced');
        console.log("Firebase Anonymously Authorized & Synced:", userCredential.user.uid);
      } catch (err) {
        console.warn("Silent Firebase Auth fallback: Offline sandbox rules active.", err);
      }
    };
    checkAuthAndSync();
  }, []);

  // Write operation helper in line with Pillar 3 and error guidelines
  const syncWrite = async (collectionName: string, docId: string, data: any) => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, collectionName, docId), data);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
    }
  };

  // Bulk push state to Firebase Firestore 
  const pushLocalToFirestore = async () => {
    if (!auth.currentUser) {
      alert("Firebase integration is authorizing. Please check connection.");
      return;
    }
    setSyncStatus('syncing');
    try {
      for (const adv of advisors) {
        await setDoc(doc(db, 'advisors', adv.id), adv);
      }
      for (const stu of students) {
        await setDoc(doc(db, 'students', stu.id), stu);
      }
      for (const att of attendance) {
        await setDoc(doc(db, 'attendance', att.id), att);
      }
      for (const od of odRequests) {
        await setDoc(doc(db, 'odRequests', od.id), od);
      }
      for (const lv of leaveRequests) {
        await setDoc(doc(db, 'leaveRequests', lv.id), lv);
      }
      for (const ann of announcements) {
        await setDoc(doc(db, 'announcements', ann.id), ann);
      }
      for (const log of auditLogs) {
        await setDoc(doc(db, 'auditLogs', log.id), log);
      }
      setSyncStatus('synced');
      alert("Superb! Offline state successfully uploaded & synced to Firestore DB.");
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'global_bulk_push');
    }
  };

  const syncWithFirestore = async () => {
    setSyncStatus('syncing');
    try {
      const advSnap = await getDocs(collection(db, 'advisors'));
      if (!advSnap.empty) {
        setAdvisors(advSnap.docs.map(d => d.data() as Advisor));
      }
      const stuSnap = await getDocs(collection(db, 'students'));
      if (!stuSnap.empty) {
        setStudents(stuSnap.docs.map(d => d.data() as Student));
      }
      const attSnap = await getDocs(collection(db, 'attendance'));
      if (!attSnap.empty) {
        setAttendance(attSnap.docs.map(d => d.data() as AttendanceRecord));
      }
      const odSnap = await getDocs(collection(db, 'odRequests'));
      if (!odSnap.empty) {
        setOdRequests(odSnap.docs.map(d => d.data() as ODRequest));
      }
      const leaveSnap = await getDocs(collection(db, 'leaveRequests'));
      if (!leaveSnap.empty) {
        setLeaveRequests(leaveSnap.docs.map(d => d.data() as LeaveRequest));
      }
      const annSnap = await getDocs(collection(db, 'announcements'));
      if (!annSnap.empty) {
        setAnnouncements(annSnap.docs.map(d => d.data() as Announcement));
      }
      const auditSnap = await getDocs(collection(db, 'auditLogs'));
      if (!auditSnap.empty) {
        setAuditLogs(auditSnap.docs.map(d => d.data() as AuditLog));
      }
      setSyncStatus('synced');
      alert("Success! Pulled real-time data from Firestore to local state!");
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'global_sync_pull');
    }
  };

  // Load state from local storage or seeds
  useEffect(() => {
    setAdvisors(localDb.get<Advisor>('advisors', SEED_ADVISORS));
    setStudents(localDb.get<Student>('students', SEED_STUDENTS));
    setAttendance(localDb.get<AttendanceRecord>('attendance', SEED_ATTENDANCE));
    setOdRequests(localDb.get<ODRequest>('odRequests', SEED_OD_REQUESTS));
    setLeaveRequests(localDb.get<LeaveRequest>('leaveRequests', SEED_LEAVE_REQUESTS));
    setAnnouncements(localDb.get<Announcement>('announcements', SEED_ANNOUNCEMENTS));
    setAuditLogs(localDb.get<AuditLog>('auditLogs', SEED_AUDIT_LOGS));
  }, []);

  // Update localStorage when lists shift
  useEffect(() => {
    if (advisors.length > 0) localDb.set('advisors', advisors);
  }, [advisors]);

  useEffect(() => {
    if (students.length > 0) localDb.set('students', students);
  }, [students]);

  useEffect(() => {
    if (attendance.length > 0) localDb.set('attendance', attendance);
  }, [attendance]);

  useEffect(() => {
    if (odRequests.length > 0) localDb.set('odRequests', odRequests);
  }, [odRequests]);

  useEffect(() => {
    if (leaveRequests.length > 0) localDb.set('leaveRequests', leaveRequests);
  }, [leaveRequests]);

  useEffect(() => {
    if (announcements.length > 0) localDb.set('announcements', announcements);
  }, [announcements]);

  useEffect(() => {
    if (auditLogs.length > 0) localDb.set('auditLogs', auditLogs);
  }, [auditLogs]);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPass) return;

    if (loginRole === 'HOD') {
      if (loginEmail === 'hod@aiml.edu' && loginPass === 'Password123') {
        setCurrentUser({ role: 'HOD', id: 'HOD01', name: 'Dr. R. Karthikeyan', emailOrReg: loginEmail });
        addAudit('Dr. R. Karthikeyan', 'HOD', 'Successful HOD portal secure sign-on');
      } else {
        alert('Invalid HOD parameters entered. Use: hod@aiml.edu / Password123');
      }
    } else if (loginRole === 'ADVISOR') {
      const match = advisors.find(a => a.email === loginEmail);
      if (match && loginPass === 'Password123' && match.isEnabled) {
        setCurrentUser({ role: 'ADVISOR', id: match.id, name: match.name, emailOrReg: loginEmail });
        addAudit(match.name, 'ADVISOR', 'Successful advisor duty sign-on');
      } else if (!match || !match.isEnabled) {
        alert('Advisor account not found or locks active. Match: advisor@aiml.edu');
      } else {
        alert('Invalid email / Password combination. Hint: Password123');
      }
    } else if (loginRole === 'STUDENT') {
      const match = students.find(s => s.registerNo === loginEmail);
      if (match && loginPass === 'Password123') {
        setCurrentUser({ role: 'STUDENT', id: match.id, name: match.name, emailOrReg: loginEmail });
        addAudit(match.name, 'STUDENT', 'Secure device account matching success');
      } else {
        alert('Student registration credentials incorrect. Try: 21AIML012 or 21AIML045 / Password123');
      }
    }
  };

  // Setup Quick Helper Sign-ins
  const quickSignIn = (role: 'HOD' | 'ADVISOR' | 'STUDENT') => {
    if (role === 'HOD') {
      setCurrentUser({ role: 'HOD', id: 'HOD01', name: 'Dr. R. Karthikeyan', emailOrReg: 'hod@aiml.edu' });
      addAudit('Dr. R. Karthikeyan', 'HOD', 'One-click administrative bypass session logged');
    } else if (role === 'ADVISOR') {
      const adv = advisors[0] || SEED_ADVISORS[0];
      setCurrentUser({ role: 'ADVISOR', id: adv.id, name: adv.name, emailOrReg: adv.email });
      addAudit(adv.name, 'ADVISOR', 'Class advisor bypass active');
    } else if (role === 'STUDENT') {
      const stu = students.find(s => s.registerNo === '21AIML012') || students[0];
      setCurrentUser({ role: 'STUDENT', id: stu.id, name: stu.name, emailOrReg: stu.registerNo });
      addAudit(stu.name, 'STUDENT', 'Bypassed face/device check-in');
    }
  };

  // Log audit helper
  const addAudit = (actor: string, role: string, action: string, rating: 'Secure' | 'Warning' | 'Threat' = 'Secure') => {
    const newLog: AuditLog = {
      id: `LOG_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      actor,
      role,
      action,
      ipAddress: '192.168.12.' + Math.floor(10 + Math.random() * 240),
      securityRating: rating
    };
    setAuditLogs(prev => [newLog, ...prev]);
    syncWrite('auditLogs', newLog.id, newLog);
  };

  // HOD operations
  const registerNewAdvisor = (newAdv: Advisor) => {
    setAdvisors(prev => [newAdv, ...prev]);
    addAudit('HOD Operator', 'HOD', `Enrolled new Section Class Advisor: ${newAdv.name}`);
    syncWrite('advisors', newAdv.id, newAdv);
  };

  const toggleAdvisorAccount = (id: string) => {
    setAdvisors(prev => prev.map(a => {
      if (a.id === id) {
        const nextState = !a.isEnabled;
        addAudit('HOD Operator', 'HOD', `Coordinator status mutated for ${a.name} (Active: ${nextState})`, nextState ? 'Secure' : 'Warning');
        const updated = { ...a, isEnabled: nextState };
        syncWrite('advisors', id, updated);
        return updated;
      }
      return a;
    }));
  };

  // Advisor operations
  const registerNewStudent = (newStu: Student) => {
    setStudents(prev => [newStu, ...prev]);
    // Create pre-populated absent log for today
    const newRecord: AttendanceRecord = {
      id: `ATT_${Math.floor(1000 + Math.random() * 9000)}`,
      studentId: newStu.id,
      studentName: newStu.name,
      registerNo: newStu.registerNo,
      date: new Date().toISOString().substring(0, 10),
      session: isMorningOpen ? 'Morning' : 'Afternoon',
      status: 'Absent'
    };
    setAttendance(prev => [newRecord, ...prev]);
    addAudit(currentUser?.name || 'Advisor', 'ADVISOR', `Onboarded student ${newStu.name} inside sector bounds`);
    syncWrite('students', newStu.id, newStu);
    syncWrite('attendance', newRecord.id, newRecord);
  };

  const evaluateOD = (id: string, isApproved: boolean) => {
    setOdRequests(prev => prev.map(req => {
      if (req.id === id) {
        const nextStatus = isApproved ? 'Approved' : 'Rejected';
        addAudit(currentUser?.name || 'Advisor', 'ADVISOR', `Filer: OD case for ${req.studentName} flagged: ${nextStatus}`);
        
        const updatedReq = { ...req, status: nextStatus as 'Approved' | 'Rejected' };
        syncWrite('odRequests', id, updatedReq);

        // If approved, update today's student attendance log to OD
        if (isApproved) {
          setAttendance(attPrev => attPrev.map(att => {
            if (att.studentId === req.studentId && att.date === req.date) {
              const updatedAtt = { ...att, status: 'OD' as const, location: 'Extramural Event Exempt' };
              syncWrite('attendance', att.id, updatedAtt);
              return updatedAtt;
            }
            return att;
          }));
        }
        return updatedReq;
      }
      return req;
    }));
  };

  const evaluateLeave = (id: string, isApproved: boolean) => {
    setLeaveRequests(prev => prev.map(req => {
      if (req.id === id) {
        const nextStatus = isApproved ? 'Approved' : 'Rejected';
        addAudit(currentUser?.name || 'Advisor', 'ADVISOR', `Filer: Leave application for ${req.studentName} categorized ${nextStatus}`);
        
        const updatedReq = { ...req, status: nextStatus as 'Approved' | 'Rejected' };
        syncWrite('leaveRequests', id, updatedReq);

        // If granted, update attendance to Leave
        if (isApproved) {
          setAttendance(attPrev => attPrev.map(att => {
            if (att.studentId === req.studentId) {
              const updatedAtt = { ...att, status: 'Leave' as const, location: 'Excused Leave block' };
              syncWrite('attendance', att.id, updatedAtt);
              return updatedAtt;
            }
            return att;
          }));
        }
        return updatedReq;
      }
      return req;
    }));
  };

  // Student operations
  const submitODRequest = (reason: string, date: string, proofUrl: string) => {
    const studentObj = students.find(s => s.id === currentUser?.id);
    const newOD: ODRequest = {
      id: `OD_${Date.now()}`,
      studentId: currentUser?.id || 'STU005',
      studentName: currentUser?.name || 'Karthik R',
      registerNo: studentObj?.registerNo || '21AIML012',
      department: studentObj?.department || 'AI & ML',
      section: studentObj?.section || 'Section A',
      reason,
      date,
      proofUrl,
      status: 'Pending',
      raisedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setOdRequests(prev => [newOD, ...prev]);
    addAudit(currentUser?.name || 'Student', 'STUDENT', 'Filed new extramural On-Duty Certificate check');
    syncWrite('odRequests', newOD.id, newOD);
  };

  const submitLeaveForm = (reason: string, startDate: string, endDate: string) => {
    const newLeave: LeaveRequest = {
      id: `LV_${Date.now()}`,
      studentId: currentUser?.id || 'STU005',
      studentName: currentUser?.name || 'Karthik R',
      reason,
      startDate,
      endDate,
      status: 'Pending',
      raisedAt: new Date().toISOString().substring(0, 10)
    };
    setLeaveRequests(prev => [newLeave, ...prev]);
    addAudit(currentUser?.name || 'Student', 'STUDENT', 'Filed sick certificate leave verification check');
    syncWrite('leaveRequests', newLeave.id, newLeave);
  };

  const handleMarkPresent = (record: Omit<AttendanceRecord, 'id' | 'date'>) => {
    const today = new Date().toISOString().slice(0, 10);
    const id = `ATT_${Math.floor(1000 + Math.random() * 9000)}`;
    const fullRecord: AttendanceRecord = {
      ...record,
      id,
      date: today
    };

    // Remove old active placeholder and insert the verified signature attendance
    setAttendance(prev => [fullRecord, ...prev.filter(a => !(a.studentId === record.studentId && a.date === today && a.session === record.session))]);
    addAudit(record.studentName, 'STUDENT', `Executed 4-Stage Secure Face-scan Check-In (${record.session})`);
    syncWrite('attendance', fullRecord.id, fullRecord);
  };

  const handleResetDevice = (studentId: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        addAudit('HOD Operator', 'HOD', `Unlocked physical account bonds check for student: ${s.name}`, 'Warning');
        const updated = {
          ...s,
          deviceId: undefined,
          deviceModel: undefined
        };
        syncWrite('students', studentId, updated);
        return updated;
      }
      return s;
    }));
  };

  const handleBroadcastAnnouncement = (title: string, content: string, priority: 'low' | 'medium' | 'high' | 'urgent') => {
    const newAnn: Announcement = {
      id: `ANN_${Date.now()}`,
      title,
      content,
      priority,
      senderName: currentUser?.name || 'System Principal',
      senderRole: currentUser?.role === 'HOD' ? 'HOD' : 'ADVISOR',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    addAudit(currentUser?.name || 'Admin', currentUser?.role || 'HOD', `Dispatched campus emergency alert: ${title}`, priority === 'urgent' ? 'Warning' : 'Secure');
    syncWrite('announcements', newAnn.id, newAnn);
  };

  const handleLogout = () => {
    if (currentUser) {
      addAudit(currentUser.name, currentUser.role, 'Logged off from portal terminal');
    }
    setCurrentUser(null);
  };

  // Helper clear DB
  const factoryResetSystem = () => {
    if (confirm('Verify: Reset entire browser cache to default seed values? This wipes registered advisor/student logs.')) {
      localDb.reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0f4ff] via-[#f9f5ff] to-[#fff1f5] text-slate-900 font-sans flex flex-col" id="applet-scope-container">
      
      {/* Dynamic Global Sandbox Control Bar for checking in the iframe */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white py-2 px-4 flex flex-col md:flex-row items-center justify-between gap-3 text-xs border-b border-indigo-900/40 relative z-55 shadow" id="global-evaluator-handshake-bar">
        <div className="flex flex-wrap items-center gap-2">
          <span className="p-1 bg-indigo-500/10 text-indigo-400 rounded border border-indigo-400/20 font-bold tracking-widest font-mono uppercase text-[9px]">
            Demo Sandbox Controls
          </span>
          <p className="text-[11px] text-slate-300">
            Active Project: <strong className="text-white">eighth-road-484107-e0 (us-west1)</strong>
          </p>
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono ${
            syncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/30' :
            syncStatus === 'syncing' ? 'bg-amber-500/20 text-amber-400 border border-amber-400/30 animate-pulse' :
            'bg-zinc-500/20 text-zinc-400 border border-zinc-500/30'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-400' : syncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-zinc-400'}`} />
            Firebase Live: {syncStatus}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={pushLocalToFirestore}
            disabled={syncStatus === 'syncing'}
            className="px-2 py-0.5 text-[10px] bg-indigo-600/30 hover:bg-indigo-650 border border-indigo-500/30 hover:border-indigo-500 rounded font-bold cursor-pointer transition-all flex items-center gap-1 text-indigo-300 hover:text-white"
            title="Push local data state to Firestore database collections"
          >
            Push to Cloud DB
          </button>
          
          <button
            onClick={syncWithFirestore}
            disabled={syncStatus === 'syncing'}
            className="px-2 py-0.5 text-[10px] bg-purple-600/30 hover:bg-purple-650 border border-purple-500/30 hover:border-purple-500 rounded font-bold cursor-pointer transition-all flex items-center gap-1 text-purple-300 hover:text-white"
            title="Fetch and merge latest states from Firestore"
          >
            Fetch Cloud DB
          </button>

          {currentUser && (
            <span className="text-[10px] text-zinc-400 font-mono hidden lg:inline">
              Signed in: <strong className="text-white bg-indigo-500/25 px-2 py-0.5 rounded">{currentUser.name} ({currentUser.role})</strong>
            </span>
          )}

          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-lg p-0.5">
            <button 
              onClick={() => quickSignIn('HOD')}
              className="px-2 py-0.5 text-[10px] bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-md cursor-pointer transition-all"
            >
              HOD UI
            </button>
            <button 
              onClick={() => quickSignIn('ADVISOR')}
              className="px-2 py-0.5 text-[10px] bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-md cursor-pointer transition-all"
            >
              Advisor UI
            </button>
            <button 
              onClick={() => quickSignIn('STUDENT')}
              className="px-2 py-0.5 text-[10px] bg-emerald-500 hover:bg-emerald-600 text-[#000000] font-black rounded-md cursor-pointer transition-all"
            >
              Student UI
            </button>
          </div>

          <button
            onClick={factoryResetSystem}
            className="p-1 text-[10px] hover:text-rose-400 transition-all font-mono font-bold flex items-center gap-1 bg-white/5 hover:bg-white/10 rounded"
            title="Reset storage"
          >
            <RefreshCw size={10} /> Reset DB
          </button>
        </div>
      </div>

      {/* Main Workspace Frame container */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Gateway Auth view if logged out */}
        {!currentUser ? (
          <div className="flex-1 flex items-center justify-center p-4 min-h-[85vh] bg-transparent overflow-hidden relative" id="auth-login-view">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600 rounded-full blur-[140px] opacity-25 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-600 rounded-full blur-[140px] opacity-20 pointer-events-none" />

            <div className="max-w-md w-full bg-slate-950/80 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-6 lg:p-8 relative z-10 shadow-2xl" id="saas-login-card">
              
              {/* Header */}
              <div className="text-center mb-6">
                <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl tracking-widest border border-indigo-400 shadow-lg shadow-indigo-600/35 mx-auto mb-4 flex items-center justify-center animate-bounce">
                  AI
                </div>
                <h1 className="text-white font-extrabold text-2xl tracking-tight">Smart Campus Access</h1>
                <p className="text-slate-400 text-xs mt-1 leading-normal">
                  Securing biometric checkpoints, geofencing coordinates, and role-based terminal validations.
                </p>
              </div>

              {/* Login parameters selector tab */}
              <div className="grid grid-[#0B0E14] grid-cols-3 gap-1 bg-white/5 p-1 rounded-2xl border border-white/[0.05] mb-5">
                <button
                  onClick={() => setLoginRole('STUDENT')}
                  className={`py-1.5 rounded-xl text-center text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                    loginRole === 'STUDENT' ? 'bg-[#22c55e] text-[#000000] font-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => setLoginRole('ADVISOR')}
                  className={`py-1.5 rounded-xl text-center text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                    loginRole === 'ADVISOR' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Advisor
                </button>
                <button
                  onClick={() => setLoginRole('HOD')}
                  className={`py-1.5 rounded-xl text-center text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
                    loginRole === 'HOD' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  HOD Login
                </button>
              </div>

              {/* Dynamic login forms */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    {loginRole === 'STUDENT' ? 'Register Number / Roll No' : 'Institutional Email Address'}
                  </label>
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    placeholder={loginRole === 'STUDENT' ? 'e.g. 21AIML045' : 'e.g. karthikeyant.aiml@edu'}
                    className="w-full text-xs p-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-1 focus:ring-[#22c55e] transition"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Security Code / Password
                  </label>
                  <input
                    type="password"
                    value={loginPass}
                    onChange={e => setLoginPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full text-xs p-3 bg-white/5 border border-white/10 rounded-xl text-white font-medium focus:ring-1 focus:ring-[#22c55e] transition"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-[#4f46e5] text-white font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:bg-white hover:text-black transition shadow"
                >
                  Secure Handshake Authorization
                </button>
              </form>

              {/* Clear helpful hint chips */}
              <div className="mt-5 border-t border-white/[0.08] pt-4 text-center">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-2.5">
                  Preconfigured login credentials
                </span>
                
                <div className="flex flex-col gap-2 font-mono text-[10px]">
                  <p className="text-slate-400 text-xs">
                    Use our <strong className="text-white">Quick buttons</strong> in the control header above for instant entry into all three portal states! Or use:
                  </p>
                  <div className="p-2 bg-white/5 rounded-xl text-left border border-white/[0.04]">
                    <div className="text-[9px] text-indigo-400 uppercase font-black">HOD:</div> 
                    <div className="text-slate-300">hod@aiml.edu • Password123</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ) : (
          
          /* Logged In Portal routing */
          <div className="flex-1 flex flex-col min-h-screen" id="authenticated-workspace-parent">
            
            {/* Shared workspace header control ribbon */}
            <header className="bg-white border-b border-slate-200 py-3 px-5 lg:px-8 flex items-center justify-between shadow-sm relative z-30 flex-wrap gap-2" id="shared-portal-top-bar">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white text-xs">
                  SC
                </div>
                <span className="text-xs font-bold text-slate-500 font-mono tracking-wider ml-1">
                  SECURE TERM SECTOR: <strong className="text-indigo-600">AI &amp; ML CLASSROOMS</strong>
                </span>
              </div>

              {/* Timing clock & active overrides preview */}
              <div className="flex items-center gap-3">
                <span className="text-[10px] bg-slate-100 text-slate-650 rounded-lg px-2.5 py-1.5 font-bold font-mono">
                  CLOCK: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>

                <button
                  onClick={handleLogout}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer"
                >
                  <LogOut size={13} /> Exit Portal
                </button>
              </div>
            </header>

            {/* Portal Routing depending on current role */}
            <div className="flex-1 flex flex-col" id="portal-router-scope font-medium">
              
              {currentUser.role === 'HOD' && (
                <PortalHOD 
                  advisors={advisors}
                  students={students}
                  departments={departments}
                  attendance={attendance}
                  odRequests={odRequests}
                  announcements={announcements}
                  auditLogs={auditLogs}
                  onAddAdvisor={registerNewAdvisor}
                  onToggleAdvisor={toggleAdvisorAccount}
                  onSendAnnouncement={handleBroadcastAnnouncement}
                  onResetDevice={handleResetDevice}
                />
              )}

              {currentUser.role === 'ADVISOR' && (
                <PortalAdvisor 
                  students={students}
                  attendance={attendance}
                  odRequests={odRequests}
                  leaveRequests={leaveRequests}
                  announcements={announcements}
                  onAddStudent={registerNewStudent}
                  onApproveOD={evaluateOD}
                  onApproveLeave={evaluateLeave}
                  onStartSession={(session, path) => alert(`Timing sessions config updated.`)}
                  onSendAnnouncement={handleBroadcastAnnouncement}
                  isMorningSessionOpen={isMorningOpen}
                  isAfternoonSessionOpen={isAfternoonOpen}
                  onToggleSession={(session) => {
                    if (session === 'Morning') {
                      setIsMorningOpen(!isMorningOpen);
                    } else {
                      setIsAfternoonOpen(!isAfternoonOpen);
                    }
                  }}
                />
              )}

              {currentUser.role === 'STUDENT' && (
                <PortalStudent 
                  student={students.find(s => s.id === currentUser.id) || students[0]}
                  attendanceHistory={attendance.filter(v => v.studentId === currentUser.id)}
                  announcements={announcements}
                  onMarkPresent={handleMarkPresent}
                  onSubmitOD={submitODRequest}
                  onSubmitLeave={submitLeaveForm}
                  isMorningSessionOpen={isMorningOpen}
                  isAfternoonSessionOpen={isAfternoonOpen}
                  onResetDevice={handleResetDevice}
                />
              )}

            </div>

          </div>
        )}

      </div>
    </div>
  );
}
