import { 
  Advisor, 
  Student, 
  AttendanceRecord, 
  ODRequest, 
  LeaveRequest, 
  Announcement, 
  AuditLog, 
  DeviceRegistry,
  Department
} from './types';

// Pre-configured login credentials
export const DEFAULT_HOD_LOGIN = {
  email: 'hod@aiml.edu',
  password: 'Password123'
};

export const DEFAULT_ADVISOR_LOGIN = {
  email: 'advisor@aiml.edu',
  password: 'Password123'
};

export const DEFAULT_STUDENT_LOGIN = {
  regNo: '21AIML045',
  password: 'Password123'
};

// Seed Data
export const SEED_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Artificial Intelligence & Machine Learning', code: 'AI & ML', advisorCount: 4, studentCount: 248, avgAttendance: 85.6 },
  { id: '2', name: 'Computer Science & Engineering', code: 'CSE', advisorCount: 8, studentCount: 480, avgAttendance: 89.2 },
  { id: '3', name: 'Information Technology', code: 'IT', advisorCount: 6, studentCount: 360, avgAttendance: 84.8 },
  { id: '4', name: 'Electronics & Communication', code: 'ECE', advisorCount: 5, studentCount: 310, avgAttendance: 82.1 }
];

export const SEED_ADVISORS: Advisor[] = [
  {
    id: 'ADV001',
    name: 'Dr. R. Karthikeyan',
    registerNo: 'ADV_AIML_A',
    email: 'advisor@aiml.edu',
    mobile: '+91 9845763210',
    department: 'AI & ML',
    section: 'Section A',
    isEnabled: true,
    faceRegistered: true,
    fingerprintRegistered: true
  },
  {
    id: 'ADV002',
    name: 'Mrs. S. Janani',
    registerNo: 'ADV_AIML_B',
    email: 'janani.aiml@edu.in',
    mobile: '+91 9723450912',
    department: 'AI & ML',
    section: 'Section B',
    isEnabled: true,
    faceRegistered: true,
    fingerprintRegistered: false
  },
  {
    id: 'ADV003',
    name: 'Dr. M. Vigneshkumar',
    registerNo: 'ADV_AIML_C',
    email: 'vignesh.aiml@edu.in',
    mobile: '+91 9443210876',
    department: 'AI & ML',
    section: 'Section C',
    isEnabled: true,
    faceRegistered: false,
    fingerprintRegistered: false
  }
];

export const SEED_STUDENTS: Student[] = [
  {
    id: 'STU001',
    name: 'Arun Kumar',
    registerNo: '21AIML045',
    rollNo: '21AML01',
    department: 'AI & ML',
    section: 'Section A',
    parentMobile: '+91 9988776655',
    parentEmail: 'parent.arun@gmail.com',
    studentPhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop',
    faceRegistered: true,
    deviceId: 'DEV_8876_X3',
    deviceModel: 'Realme RMX3868',
    isPriorityAssisted: false,
    priorityCategory: 'none'
  },
  {
    id: 'STU002',
    name: 'B. Keerthana',
    registerNo: '21AIML067',
    rollNo: '21AML02',
    department: 'AI & ML',
    section: 'Section A',
    parentMobile: '+91 9123456780',
    parentEmail: 'parent.keerthi@gmail.com',
    studentPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    faceRegistered: true,
    deviceId: 'DEV_4590_K4',
    deviceModel: 'Samsung Galaxy S23',
    isPriorityAssisted: false,
    priorityCategory: 'none'
  },
  {
    id: 'STU003',
    name: 'M. Vignesh',
    registerNo: '21AIML032',
    rollNo: '21AML03',
    department: 'AI & ML',
    section: 'Section A',
    parentMobile: '+91 9445566778',
    parentEmail: 'parent.vignesh@gmail.com',
    studentPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    faceRegistered: false,
    isPriorityAssisted: true,
    priorityCategory: 'disability_motor' // Motor difficulty; benefits from simplified UI/touch targets
  },
  {
    id: 'STU004',
    name: 'S. Dharshini',
    registerNo: '21AIML089',
    rollNo: '21AML04',
    department: 'AI & ML',
    section: 'Section A',
    parentMobile: '+91 9776655443',
    parentEmail: 'parent.dharshu@gmail.com',
    studentPhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    faceRegistered: false,
    isPriorityAssisted: true,
    priorityCategory: 'disability_vision' // Vision impairment; benefits from voice reads
  },
  {
    id: 'STU005',
    name: 'Karthik R',
    registerNo: '21AIML012',
    rollNo: '21AML05',
    department: 'AI & ML',
    section: 'Section A',
    parentMobile: '+91 9884635241',
    parentEmail: 'parent.karthik@gmail.com',
    studentPhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    faceRegistered: true,
    deviceId: 'DEV_7741_M9',
    deviceModel: 'OnePlus Nord CE 3',
    isPriorityAssisted: false,
    priorityCategory: 'none'
  }
];

export const SEED_DEVICES: DeviceRegistry[] = [
  {
    id: 'D01',
    studentId: 'STU001',
    deviceId: 'DEV_8876_X3',
    deviceModel: 'Realme RMX3868',
    androidVersion: 'Android 14',
    firebaseToken: 'fcm_tok_abc123',
    ipAddress: '192.168.12.104',
    isRootCheckOk: true,
    isSafeBrowser: true,
    isDeveloperModeBlocked: true,
    registeredAt: '2026-05-10T10:00:00Z'
  },
  {
    id: 'D02',
    studentId: 'STU002',
    deviceId: 'DEV_4590_K4',
    deviceModel: 'Samsung Galaxy S23',
    androidVersion: 'Android 13.1',
    firebaseToken: 'fcm_tok_xyz789',
    ipAddress: '192.168.12.115',
    isRootCheckOk: true,
    isSafeBrowser: true,
    isDeveloperModeBlocked: true,
    registeredAt: '2026-05-11T14:30:00Z'
  },
  {
    id: 'D03',
    studentId: 'STU005',
    deviceId: 'DEV_7741_M9',
    deviceModel: 'OnePlus Nord CE 3',
    androidVersion: 'Android 14',
    firebaseToken: 'fcm_tok_k881nm',
    ipAddress: '192.168.20.91',
    isRootCheckOk: true,
    isSafeBrowser: true,
    isDeveloperModeBlocked: true,
    registeredAt: '2026-05-15T09:15:00Z'
  }
];

export const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN001',
    title: 'Internal Assessment Schedule',
    content: 'Phase-II Internal Assessment examinations will commence on June 2, 2026. Review targets will be circulated by subject in-charges. All students must verify attendance eligibility.',
    senderName: 'Dr. R. Karthikeyan',
    senderRole: 'HOD',
    priority: 'high',
    createdAt: '2026-05-24T08:30:00Z'
  },
  {
    id: 'ANN002',
    title: 'Department Meeting Invitation',
    content: 'All class advisors and subject handlers of AI & ML are requested to attend a coordination meeting tomorrow (May 27) at 11:00 AM regarding the dynamic security updates and offline verification.',
    senderName: 'Dr. R. Karthikeyan',
    senderRole: 'HOD',
    priority: 'medium',
    createdAt: '2026-05-25T18:15:00Z'
  },
  {
    id: 'ANN003',
    title: 'Project Phase-II Review Timeline',
    content: 'Review-II for final year projects is scheduled starting from May 28, 2026. Upload your mid-term reviews and proof of validation reports into the central server by May 27, 4:00 PM.',
    senderName: 'Dr. R. Karthikeyan',
    senderRole: 'ADVISOR',
    targetDept: 'AI & ML',
    targetSection: 'Section A',
    priority: 'high',
    createdAt: '2026-05-25T16:45:00Z'
  },
  {
    id: 'ANN004',
    title: 'Holiday Notice',
    content: 'The campus will remain closed on June 8, 2026, on account of the special legislative event. Hostellers are advised to inform wardens.',
    senderName: 'Dr. R. Karthikeyan',
    senderRole: 'HOD',
    priority: 'low',
    createdAt: '2026-05-25T15:10:00Z'
  }
];

export const SEED_OD_REQUESTS: ODRequest[] = [
  {
    id: 'OD001',
    studentId: 'STU001',
    studentName: 'Arun Kumar',
    registerNo: '21AIML045',
    department: 'AI & ML',
    section: 'Section A',
    reason: 'Symposium Participation - National Web Tech Summit',
    date: '2026-05-26',
    proofUrl: 'technical_symposium_reg.pdf',
    status: 'Pending',
    raisedAt: '2026-05-24T08:45:00Z'
  },
  {
    id: 'OD002',
    studentId: 'STU002',
    studentName: 'B. Keerthana',
    registerNo: '21AIML067',
    department: 'AI & ML',
    section: 'Section A',
    reason: 'Workshop - External Cloud Deployments',
    date: '2026-05-26',
    proofUrl: 'workshop_acceptance.pdf',
    status: 'Pending',
    raisedAt: '2026-05-24T09:15:00Z'
  },
  {
    id: 'OD003',
    studentId: 'STU003',
    studentName: 'M. Vignesh',
    registerNo: '21AIML032',
    department: 'AI & ML',
    section: 'Section A',
    reason: 'Medical Checkup - Physical Therapy Session',
    date: '2026-05-25',
    proofUrl: 'medical_receipt.jpg',
    status: 'Approved',
    raisedAt: '2026-05-23T10:30:00Z'
  },
  {
    id: 'OD004',
    studentId: 'STU004',
    studentName: 'S. Dharshini',
    registerNo: '21AIML089',
    department: 'AI & ML',
    section: 'Section A',
    reason: 'University Exam Duty Delegation support',
    date: '2026-05-25',
    proofUrl: 'university_letter.pdf',
    status: 'Pending',
    raisedAt: '2026-05-23T11:20:00Z'
  }
];

export const SEED_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LV001',
    studentId: 'STU005',
    studentName: 'Karthik R',
    reason: 'Fever and viral throat infection',
    startDate: '2026-05-20',
    endDate: '2026-05-22',
    status: 'Approved',
    raisedAt: '2026-05-19T14:20:00Z'
  }
];

export const SEED_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'ATT001',
    studentId: 'STU001',
    studentName: 'Arun Kumar',
    registerNo: '21AIML045',
    date: '2026-05-25',
    session: 'Morning',
    status: 'Present',
    timestamp: '09:12 AM',
    location: 'AI & ML Block - Room 301',
    gpsValid: true,
    deviceValid: true,
    faceValid: true,
    stageReached: 4
  },
  {
    id: 'ATT002',
    studentId: 'STU002',
    studentName: 'B. Keerthana',
    registerNo: '21AIML067',
    date: '2026-05-25',
    session: 'Morning',
    status: 'Present',
    timestamp: '09:15 AM',
    location: 'AI & ML Block - Room 301',
    gpsValid: true,
    deviceValid: true,
    faceValid: true,
    stageReached: 4
  },
  {
    id: 'ATT003',
    studentId: 'STU003',
    studentName: 'M. Vignesh',
    registerNo: '21AIML032',
    date: '2026-05-25',
    session: 'Morning',
    status: 'OD',
    timestamp: '08:45 AM',
    location: 'Approved Extramural',
    gpsValid: true,
    deviceValid: true,
    faceValid: true,
    stageReached: 4,
    priorityAccommodated: true
  },
  {
    id: 'ATT004',
    studentId: 'STU004',
    studentName: 'S. Dharshini',
    registerNo: '21AIML089',
    date: '2026-05-25',
    session: 'Morning',
    status: 'Absent',
    timestamp: undefined,
    location: undefined,
    gpsValid: false,
    deviceValid: false,
    faceValid: false,
    stageReached: 1
  },
  {
    id: 'ATT005',
    studentId: 'STU005',
    studentName: 'Karthik R',
    registerNo: '21AIML012',
    date: '2026-05-25',
    session: 'Morning',
    status: 'Present',
    timestamp: '09:18 AM',
    location: 'AI & ML Block - Room 301',
    gpsValid: true,
    deviceValid: true,
    faceValid: true,
    stageReached: 4
  }
];

export const SEED_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG001',
    timestamp: '2026-05-26 08:30:12',
    actor: 'Dr. R. Karthikeyan',
    role: 'HOD',
    action: 'Registered new class advisor (ADV_AIML_C)',
    ipAddress: '10.51.24.89',
    securityRating: 'Secure'
  },
  {
    id: 'LOG002',
    timestamp: '2026-05-26 08:32:45',
    actor: 'Dr. R. Karthikeyan',
    role: 'HOD',
    action: 'Dispatched campus emergency notification: Internal Assessments',
    ipAddress: '10.51.24.89',
    securityRating: 'Secure'
  },
  {
    id: 'LOG003',
    timestamp: '2026-05-26 08:50:11',
    actor: '21AIML045',
    role: 'STUDENT',
    action: 'OS environment check bypassed warning - Device Integrity passed',
    ipAddress: '192.168.12.104',
    securityRating: 'Secure'
  },
  {
    id: 'LOG004',
    timestamp: '2026-05-26 09:01:05',
    actor: '21AIML089',
    role: 'STUDENT',
    action: 'GPS validation failure: Logged location 3.4km outside geofence boundary',
    ipAddress: '172.56.230.14',
    securityRating: 'Warning'
  },
  {
    id: 'LOG005',
    timestamp: '2026-05-26 09:10:22',
    actor: 'Unregistered Android X4',
    role: 'STUDENT',
    action: 'One-Device Lockout triggered: Login blocked; credentials active on DEV_7741_M9',
    ipAddress: '172.56.230.99',
    securityRating: 'Threat'
  }
];

// LocalDatabase Utility helper to emulate API state in local storage
export const localDb = {
  get: <T>(key: string, seed: T[]): T[] => {
    const data = localStorage.getItem(`smart_campus_${key}`);
    if (!data) {
      localStorage.setItem(`smart_campus_${key}`, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(data);
  },
  set: <T>(key: string, value: T[]): void => {
    localStorage.setItem(`smart_campus_${key}`, JSON.stringify(value));
  },
  reset: (): void => {
    localStorage.clear();
    window.location.reload();
  }
};
