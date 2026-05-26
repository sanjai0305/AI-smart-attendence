import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

// Enable JSON body parsing with higher limit for bulk syncing
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Use provided MongoDB connection string or fallback to the requested default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sanjaim0940r_db_user:sanjai@cluster0.badefjv.mongodb.net/?appName=Cluster0';

console.log('Connecting to MongoDB...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB successfully connected!');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

// --- Mongoose Scemas & Models ---
// 1. Advisor Schema
const AdvisorSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  registerNo: { type: String, required: true },
  email: { type: String, required: true },
  mobile: { type: String, required: true },
  department: { type: String, required: true },
  section: { type: String, required: true },
  isEnabled: { type: Boolean, default: true },
  faceRegistered: { type: Boolean, default: false },
  fingerprintRegistered: { type: Boolean, default: false }
}, { timestamps: true });

const AdvisorModel = mongoose.model('Advisor', AdvisorSchema);

// 2. Student Schema (with OS security & accessibility details)
const StudentSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  registerNo: { type: String, required: true },
  rollNo: { type: String, required: true },
  department: { type: String, required: true },
  section: { type: String, required: true },
  parentMobile: { type: String, required: true },
  parentEmail: { type: String, required: true },
  studentPhoto: { type: String, default: '' },
  faceRegistered: { type: Boolean, default: false },
  deviceId: { type: String },
  deviceModel: { type: String },
  isPriorityAssisted: { type: Boolean, default: false },
  priorityCategory: { type: String, enum: ['none', 'children', 'disability_vision', 'disability_motor', 'disability_hearing'], default: 'none' }
}, { timestamps: true });

const StudentModel = mongoose.model('Student', StudentSchema);

// 3. Attendance Record Schema
const AttendanceSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  registerNo: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  session: { type: String, enum: ['Morning', 'Afternoon'], required: true },
  status: { type: String, enum: ['Present', 'Absent', 'OD', 'Leave'], required: true },
  timestamp: { type: String }, // HH:MM AM/PM
  location: { type: String }, // Room or geofence coord
  gpsValid: { type: Boolean, default: false },
  deviceValid: { type: Boolean, default: false },
  faceValid: { type: Boolean, default: false },
  stageReached: { type: Number, default: 0 }, // 1-4 stages completed
  priorityAccommodated: { type: Boolean, default: false }
}, { timestamps: true });

const AttendanceModel = mongoose.model('AttendanceRecord', AttendanceSchema);

// 4. On-Duty (OD) Request Schema
const ODSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  registerNo: { type: String, required: true },
  department: { type: String, required: true },
  section: { type: String, required: true },
  reason: { type: String, required: true },
  date: { type: String, required: true },
  proofUrl: { type: String },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  raisedAt: { type: String, required: true }
}, { timestamps: true });

const ODModel = mongoose.model('ODRequest', ODSchema);

// 5. Leave Request Schema
const LeaveSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  reason: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
  raisedAt: { type: String, required: true }
}, { timestamps: true });

const LeaveModel = mongoose.model('LeaveRequest', LeaveSchema);

// 6. Announcement Schema
const AnnouncementSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  senderName: { type: String, required: true },
  senderRole: { type: String, enum: ['HOD', 'ADVISOR'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  targetDept: { type: String },
  targetSection: { type: String },
  createdAt: { type: String, required: true }
}, { timestamps: true });

const AnnouncementModel = mongoose.model('Announcement', AnnouncementSchema);

// 7. Audit Log Schema (System security tracking)
const AuditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, required: true },
  actor: { type: String, required: true },
  role: { type: String, required: true },
  action: { type: String, required: true },
  ipAddress: { type: String, required: true },
  securityRating: { type: String, enum: ['Secure', 'Warning', 'Threat'], default: 'Secure' }
}, { timestamps: true });

const AuditLogModel = mongoose.model('AuditLog', AuditLogSchema);

// Map of collections to models to facilitate generic operations
const collectionModels: Record<string, mongoose.Model<any>> = {
  advisors: AdvisorModel,
  students: StudentModel,
  attendance: AttendanceModel,
  odRequests: ODModel,
  leaveRequests: LeaveModel,
  announcements: AnnouncementModel,
  auditLogs: AuditLogModel
};

// --- REST Endpoints for Single Writes and Pull/Push Syncs ---

// Check database live status
app.get('/api/db-status', (req, res) => {
  const state = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.json({
    connected: state === 1,
    statusText: states[state] || 'Unknown',
    uriMasked: MONGODB_URI.replace(/:([^@]+)@/, ':******@')
  });
});

// Single document upsert
app.post('/api/sync/write', async (req, res) => {
  const { collectionName, docId, data } = req.body;
  
  if (!collectionName || !docId || !data) {
    return res.status(400).json({ error: 'Missing collectionName, docId or data' });
  }

  const Model = collectionModels[collectionName];
  if (!Model) {
    return res.status(400).json({ error: `Unsupported collection: ${collectionName}` });
  }

  try {
    const updated = await Model.findOneAndUpdate(
      { id: docId },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ success: true, updated });
  } catch (err: any) {
    console.error(`Error writing single doc to collection ${collectionName}:`, err);
    res.status(500).json({ error: err.message || 'Internal server write error' });
  }
});

// Bulk sync push (push entire client state lists to MongoDB)
app.post('/api/sync/push', async (req, res) => {
  const { advisors, students, attendance, odRequests, leaveRequests, announcements, auditLogs } = req.body;
  
  try {
    const startSync = async (list: any[], Model: mongoose.Model<any>) => {
      if (!list || !Array.isArray(list)) return;
      for (const item of list) {
        if (item && item.id) {
          await Model.findOneAndUpdate(
            { id: item.id },
            item,
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
        }
      }
    };

    await Promise.all([
      startSync(advisors, AdvisorModel),
      startSync(students, StudentModel),
      startSync(attendance, AttendanceModel),
      startSync(odRequests, ODModel),
      startSync(leaveRequests, LeaveModel),
      startSync(announcements, AnnouncementModel),
      startSync(auditLogs, AuditLogModel)
    ]);

    res.json({ success: true, message: 'All entities successfully synced to MongoDB!' });
  } catch (err: any) {
    console.error('Error during bulk push sync to MongoDB:', err);
    res.status(500).json({ error: err.message || 'Error occurred during MongoDB bulk push' });
  }
});

// Bulk sync pull (fetch all data sets from MongoDB back to local application state)
app.get('/api/sync/pull', async (req, res) => {
  try {
    const [advisors, students, attendance, odRequests, leaveRequests, announcements, auditLogs] = await Promise.all([
      AdvisorModel.find({}).lean(),
      StudentModel.find({}).lean(),
      AttendanceModel.find({}).lean(),
      ODModel.find({}).lean(),
      LeaveModel.find({}).lean(),
      AnnouncementModel.find({}).lean(),
      AuditLogModel.find({}).lean()
    ]);

    res.json({
      success: true,
      data: {
        advisors,
        students,
        attendance,
        odRequests,
        leaveRequests,
        announcements,
        auditLogs
      }
    });
  } catch (err: any) {
    console.error('Error during bulk pull sync from MongoDB:', err);
    res.status(500).json({ error: err.message || 'Error occurred during MongoDB bulk pull' });
  }
});

// --- Vite Dev Server Middleware vs Production Handling ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite development server middleware mounted.');
  } else {
    const distPath = path.join(__dirname, '.');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Production static asset streaming enabled.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server successfully started. Listening on http://localhost:${PORT}`);
  });
}

startServer();
