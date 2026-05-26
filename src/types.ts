/**
 * Smart Campus AI Attendance System
 * Custom TypeScript Type declarations
 */

export type UserRole = 'HOD' | 'ADVISOR' | 'STUDENT';

export interface UserSession {
  role: UserRole;
  userId: string;
  name: string;
  emailOrReg: string;
  department?: string;
  section?: string;
  photo?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  advisorCount: number;
  studentCount: number;
  avgAttendance: number;
}

export interface Advisor {
  id: string;
  name: string;
  registerNo: string;
  email: string;
  mobile: string;
  department: string;
  section: string;
  isEnabled: boolean;
  faceRegistered: boolean;
  fingerprintRegistered: boolean;
}

export interface Student {
  id: string;
  name: string;
  registerNo: string;
  rollNo: string;
  department: string;
  section: string;
  parentMobile: string;
  parentEmail: string;
  studentPhoto: string;
  faceRegistered: boolean;
  deviceId?: string;
  deviceModel?: string;
  isPriorityAssisted: boolean;
  priorityCategory?: 'none' | 'children' | 'disability_vision' | 'disability_motor' | 'disability_hearing';
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  registerNo: string;
  date: string; // YYYY-MM-DD
  session: 'Morning' | 'Afternoon';
  status: 'Present' | 'Absent' | 'OD' | 'Leave';
  timestamp?: string; // HH:MM AM/PM
  location?: string; // Room or coordinate string
  gpsValid?: boolean;
  deviceValid?: boolean;
  faceValid?: boolean;
  stageReached?: number; // 1-4 stages completed
  priorityAccommodated?: boolean;
}

export interface ODRequest {
  id: string;
  studentId: string;
  studentName: string;
  registerNo: string;
  department: string;
  section: string;
  reason: string;
  date: string;
  proofUrl: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  raisedAt: string;
}

export interface LeaveRequest {
  id: string;
  studentId: string;
  studentName: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  raisedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  senderName: string;
  senderRole: 'HOD' | 'ADVISOR';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetDept?: string;
  targetSection?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  ipAddress: string;
  securityRating: 'Secure' | 'Warning' | 'Threat';
}

export interface DeviceRegistry {
  id: string;
  studentId: string;
  deviceId: string;
  deviceModel: string;
  androidVersion: string;
  firebaseToken: string;
  ipAddress: string;
  isRootCheckOk: boolean;
  isSafeBrowser: boolean;
  isDeveloperModeBlocked: boolean;
  registeredAt: string;
}

// 4-Stage Security Verification State for Attendance Mark Flow
export interface VerificationState {
  currentStage: 1 | 2 | 3 | 4;
  stage1_Device_Status: 'pending' | 'checking' | 'passed' | 'failed';
  stage2_GPS_Status: 'pending' | 'checking' | 'passed' | 'failed';
  stage3_Face_Status: 'pending' | 'checking' | 'passed' | 'failed';
  stage4_Priority_Status: 'pending' | 'checking' | 'passed' | 'failed';
  capturedPhoto?: string;
  errorMessage?: string;
}
