# Security Specification & Threat Model (TDD)

## 1. Security Invariants
1. **Zero-Trust Identity**: No user can read or write documents where the `studentId`, `userId`, or `ownerId` does not match their verified `request.auth.uid`, unless they are an enabled administrator or verified Department Head.
2. **Device State Guarding**: A student cannot modify another student's `deviceId` or reset physical device bonds or registered faces without class advisor or HOD authority checks.
3. **Immutability of Historical Audits**: Attendance records, and historical logs, once committed, cannot be altered or deleted.
4. **Stage Integrity**: Marking attendance requires validation that all stages are correctly satisfied, and priority accommodation is only mapped if registered.

---

## 2. Invariants & Threat Scenarios
1. **Advisors**: Only HODs or existing registered admins can write to advisors. No user can register as an advisor with an unverified email.
2. **Students**: Only Advisors or HODs can create/update student properties like facial/fingerprint registrations. Students can view their own profile.
3. **Attendance**: Only the corresponding Student can write/submit a Morning/Afternoon mark, and only when validations match. No retroactive edits from students.
4. **OD/Leave**: Students can file, but only assigned advisors can mutate state to `Approved`/`Rejected`.

---

## 3. The "Dirty Dozen" Payloads (Exploit Scenarios)

### Exploit 1: Identity Spoofing (Student marking attendance as another student)
* **Target Path**: `/attendance/ATT_9999`
* **Payload**:
  ```json
  {
    "id": "ATT_9999",
    "studentId": "STU002",
    "studentName": "B. Keerthana",
    "registerNo": "21AIML067",
    "date": "2026-05-26",
    "session": "Morning",
    "status": "Present"
  }
  ```
* **Attacking Auth**: Sign-on as `STU001` (`Arun Kumar`).
* **Expected Result**: `PERMISSION_DENIED` (studentId mismatch).

### Exploit 2: Security Checklist Bypass (Bypassing Stage Integrity check)
* **Target Path**: `/attendance/ATT_1001`
* **Payload**:
  ```json
  {
    "id": "ATT_1001",
    "studentId": "STU001",
    "studentName": "Arun Kumar",
    "registerNo": "21AIML045",
    "date": "2026-05-26",
    "session": "Morning",
    "status": "Present",
    "stageReached": 1,
    "gpsValid": false,
    "faceValid": false
  }
  ```
* **Attacking Auth**: `STU001` attempts to force state.
* **Expected Result**: `PERMISSION_DENIED` (stageReached must be valid and check validations).

### Exploit 3: Admin Privilege Escalation (Student elevating their own profile priority category)
* **Target Path**: `/students/STU001`
* **Payload**:
  ```json
  {
    "id": "STU001",
    "name": "Arun Kumar",
    "registerNo": "21AIML045",
    "rollNo": "21AML01",
    "department": "AI & ML",
    "section": "Section A",
    "parentMobile": "+91 9988776655",
    "parentEmail": "parent.arun@gmail.com",
    "studentPhoto": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop",
    "faceRegistered": true,
    "isPriorityAssisted": true,
    "priorityCategory": "disability_vision"
  }
  ```
* **Attacking Auth**: `STU001` attempting self-access update.
* **Expected Result**: `PERMISSION_DENIED` (requires class advisor validation).

### Exploit 4: Denial of Wallet (Resource Poisoning via massive string size injection)
* **Target Path**: `/announcements/ANN_9999`
* **Payload**:
  ```json
  {
    "id": "ANN_9999",
    "title": "A".repeat(5000),
    "content": "A".repeat(500000),
    "priority": "urgent",
    "senderName": "Attacker",
    "senderRole": "ADVISOR",
    "createdAt": "2026-05-26T10:00:00"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (lengths violate rules constraints).

### Exploit 5: One-Device Locking Bypass (Altering own device lock parameters after registration)
* **Target Path**: `/students/STU001` (Modifying device lock on owned profile)
* **Payload**:
  ```json
  {
    "deviceId": "DEV_ATTACKER_X",
    "deviceModel": "Attacking Emulator"
  }
  ```
* **Attacking Auth**: `STU001` (Student) attempting to bind a new device.
* **Expected Result**: `PERMISSION_DENIED` (device locks are system fields immutable by students after registration).

### Exploit 6: State Terminal Locking Override (Overwriting approved OD to Pending)
* **Target Path**: `/odRequests/OD003` (Which has been approved)
* **Payload**:
  ```json
  {
    "id": "OD003",
    "status": "Pending"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (terminal status cannot be mutated).

### Exploit 7: Spoofy Admin Registration (Bypassing trusted backend check for admin roles)
* **Target Path**: `/advisors/ADV999`
* **Payload**:
  ```json
  {
    "id": "ADV999",
    "name": "Bypass Admin",
    "email": "attacker@aiml.edu",
    "isEnabled": true,
    "registerNo": "ADV_AIML_A"
  }
  ```
* **Attacking Auth**: `STU001`
* **Expected Result**: `PERMISSION_DENIED` (requires admin/HOD credentials).

### Exploit 8: Unverified Email Hijack
* **Target Path**: `/students/STU001`
* **Payload**: General modification while `request.auth.token.email_verified == false`
* **Expected Result**: `PERMISSION_DENIED`.

### Exploit 9: Retroactive Audit Tampering
* **Target Path**: `/auditLogs/LOG001`
* **Payload**:
  ```json
  {
    "id": "LOG001",
    "ipAddress": "1.1.1.1",
    "action": "Malicious logs clean up"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Audits have allow update/delete: if false).

### Exploit 10: Private PII Access Scavenging (Reading other student's disability/assisted info)
* **Target Path**: `/students/STU003` (Which contains dynamic motor disability categorization)
* **Attacking Auth**: Authenticated but unrelated Student ID `STU001`.
* **Expected Result**: `PERMISSION_DENIED` (PII block).

### Exploit 11: Future/Past Date Injection
* **Target Path**: `/attendance/ATT_1002`
* **Payload**:
  ```json
  {
    "date": "2099-12-31"
  }
  ```
* **Expected Result**: `PERMISSION_DENIED` (Timestamp constraints violation).

### Exploit 12: Broad Query Scavenging without Security Filters
* **Target Path**: `/attendance/` (Attempting global list check)
* **Attacking Auth**: Unassigned Student
* **Expected Result**: `PERMISSION_DENIED` (Collection rules mandate exact filters).
