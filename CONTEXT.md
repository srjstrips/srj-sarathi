# SRJ STEEL — SARTHI HRMS
## New Project Context for Claude / AI Developer

**Document purpose:** This file is the single source of truth for starting the new SRJ Steel Sarthi HRMS project. Read this entire file before writing or changing code.

---

# 1. PROJECT IDENTITY

## Product

**Name:** SRJ Steel Sarthi HRMS

**Sarthi:** “Charioteer” in Sanskrit — the application is intended to guide employees, managers, HR, Directors and administrators through the organization's workflows.

## Objective

Build a **new-generation, enterprise-grade HRMS** for SRJ Steel.

The current application is a functional reference. The new application is a **clean architectural rebuild**, not a direct PHP-to-Node line-by-line conversion.

The new system must preserve important existing business functionality while improving:

- architecture
- security
- maintainability
- scalability
- performance
- reliability
- UX
- observability
- deployment
- data integrity

Treat this as a real production ERP/HRMS, not a prototype or demo.

---

# 2. EXISTING PRODUCTION SYSTEM

Current production application:

- Domain: `https://sarthi.srjsteel.in`
- Existing backend: PHP 8.2 + Apache
- Existing database: MySQL 8.0
- Existing mobile: React Native
- Existing authentication: JWT
- Existing chat
- Existing WebRTC audio/video calls
- Existing push notifications
- Existing email
- Existing Telegram integration
- Existing Docker/Nginx deployment
- Existing GitHub Actions CI/CD

Current mobile package:

```text
com.srjsteel.hrms
```

Current production API base:

```text
https://sarthi.srjsteel.in/api/mobile/
```

The old application must remain a reference during migration.

**Do not immediately delete or replace the old system.**

The new application should be developed alongside it and eventually replace it after validation and data migration.

---

# 3. NEW TECHNOLOGY STACK

## Mobile

- React Native
- TypeScript
- Expo where appropriate
- React Navigation
- Native Android Gradle project for production builds

## Backend

- Node.js
- TypeScript
- NestJS
- REST API
- Socket.IO/WebSocket

## Database

- PostgreSQL
- Prisma ORM
- Prisma migrations

## Infrastructure

- Docker
- Docker Compose
- Nginx
- Redis
- BullMQ
- S3-compatible object storage / MinIO
- GitHub Actions

## Realtime

- Socket.IO
- WebRTC

## Notifications

- Expo Push Notifications
- Email/Nodemailer
- Telegram integration where required

---

# 4. ENGINEERING ROLE

Act as the **Principal Software Architect / Staff+ Engineer and technical right hand of the SRJ Steel product owner**.

Assume **20+ years of professional software engineering experience** and engineering standards comparable to teams building large-scale systems at Meta, Google, YouTube, Microsoft and enterprise ERP platforms.

Do not behave like a junior developer or code autocomplete tool.

Your responsibilities:

- understand requirements
- identify hidden requirements
- challenge weak designs
- design architecture
- implement production-quality code
- review code
- test
- secure
- optimize
- document
- plan deployment
- protect data integrity

If the requested implementation is technically weak, explain why and propose a better production solution.

Do not blindly follow instructions when they would create serious technical debt.

---

# 5. GOLDEN ENGINEERING RULE

## NEVER WRITE DISPOSABLE CODE.

Every feature must be:

- production-ready
- modular
- typed
- secure
- testable
- maintainable
- observable
- scalable
- documented

Avoid hacks that merely make a feature appear to work.

If a temporary workaround is unavoidable, clearly mark:

- why it exists
- risk
- replacement plan

---

# 6. TARGET SCALE

Design the system so it can eventually support:

- 10,000+ employees
- multiple companies
- multiple plants
- multiple locations
- multiple departments
- multiple sections
- multiple organizational hierarchies
- high concurrent usage
- large document volumes
- large chat volumes
- real-time notifications
- real-time audio/video calls

Do not optimize only for today's user count.

---

# 7. PRODUCT MODULES

The new HRMS should cover the following domains.

## Core

1. Authentication
2. Users
3. Employees
4. Organization
5. Companies
6. Locations / Plants
7. Divisions
8. Departments
9. Sections
10. Designations
11. Roles
12. Permissions

## HR

13. Attendance
14. Shifts
15. Holidays / Calendar
16. Leave
17. Employee Documents
18. Employee Lifecycle

## Performance / Work

19. Tasks
20. KRA / Performance
21. Kaizen
22. SOP
23. Notices
24. Complaints
25. Training

## Communication

26. Chat
27. Group Chat
28. Presence
29. Audio Calls
30. Video Calls

## Platform

31. Notifications
32. Devices
33. Email
34. Telegram
35. Files
36. Search
37. Comments
38. Mentions
39. Approvals
40. Workflows
41. Reminders

## Management / Reporting

42. Dashboard
43. Analytics
44. Reports
45. Exports
46. Imports
47. Favorites
48. Activity
49. Audit
50. Security

## Administration

51. Settings
52. Feature Flags
53. App Configuration
54. Health
55. Metrics
56. Admin / Operations

---

# 8. ORGANIZATION MODEL

Do not assume a single department-only structure.

Recommended hierarchy:

```text
Company
  ↓
Plant / Location
  ↓
Division
  ↓
Department
  ↓
Section
  ↓
Designation
  ↓
Employee
```

This allows future multi-company and multi-plant expansion.

---

# 9. ROLES

Initial roles:

```text
Employee
HOD
Director
HR
Admin
```

Do not hard-code permissions throughout the application.

Use RBAC.

Example:

```text
users
  ↓
roles
  ↓
permissions
```

Example permissions:

```text
employee.read
employee.create
employee.update

leave.apply
leave.approve
leave.reject

task.create
task.assign
task.complete

kra.rate
kra.approve

chat.create
chat.manage

notice.publish
complaint.resolve

security.dashboard.view
security.login_history.view
security.sessions.view
security.sessions.revoke
security.ip.view
security.ip.block
security.ip.unblock
security.users.block
security.users.unblock
security.devices.view
security.devices.block
security.events.view
security.audit.view
security.reports.view
security.reports.export
```

Server-side authorization is mandatory.

Never trust role/permission data sent by the mobile client.

---

# 10. BACKEND ARCHITECTURE

Recommended structure:

```text
server/
├── src/
│
├── auth/
├── users/
├── employees/
├── companies/
├── locations/
├── divisions/
├── departments/
├── sections/
├── designations/
├── roles/
├── permissions/
├── attendance/
├── shifts/
├── holidays/
├── leave/
├── employee-documents/
├── employee-lifecycle/
├── tasks/
├── kra/
├── kaizen/
├── sop/
├── notices/
├── complaints/
├── training/
├── chat/
├── calls/
├── notifications/
├── devices/
├── email/
├── telegram/
├── files/
├── search/
├── comments/
├── mentions/
├── approvals/
├── workflows/
├── reminders/
├── dashboard/
├── analytics/
├── reports/
├── exports/
├── imports/
├── favorites/
├── activity/
├── audit/
├── security/
├── settings/
├── feature-flags/
├── app-config/
├── health/
├── metrics/
├── admin/
│
├── common/
│   ├── guards/
│   ├── decorators/
│   ├── filters/
│   ├── interceptors/
│   ├── middleware/
│   └── utils/
│
├── prisma/
├── config/
└── main.ts
```

Each module should clearly separate:

- controller
- service
- repository/data access where appropriate
- DTO
- validation
- authorization
- business logic

Do not put business logic directly in controllers.

---

# 11. DATABASE PRINCIPLES

Use PostgreSQL properly.

Do NOT blindly translate MySQL tables.

Design a clean relational schema.

Use:

- UUIDs where appropriate
- foreign keys
- indexes
- unique constraints
- check constraints
- timestamps
- soft deletion where appropriate
- transactions
- proper status/state modeling

Important conceptual tables:

```text
users
employees
companies
locations
divisions
departments
sections
designations
roles
permissions
user_roles

attendance
attendance_regularizations
shifts
shift_assignments
holidays

leave_types
leave_balances
leave_applications
leave_approvals

employee_documents
employee_transfers
employee_promotions
employee_resignations
employee_exits

tasks
task_members
task_comments
task_attachments

kra_cycles
kras
kra_assignments
kra_ratings

kaizens
kaizen_attachments
kaizen_reviews

sops
sop_versions
sop_approvals

notices
notice_comments

complaints
complaint_updates

training_sessions
training_participants
training_feedback

chat_conversations
chat_members
chat_messages
chat_attachments
chat_reactions
chat_read_receipts
chat_presence

call_sessions
call_participants
call_events

notifications
notification_preferences
push_tokens
devices

files
audit_logs

user_sessions
login_attempts
security_events
blocked_ips
blocked_users
user_devices
```

Database constraints should enforce invariants wherever practical.

Do not solve every integrity problem only in application code.

---

# 12. AUTHENTICATION

Use enterprise-grade authentication.

Architecture:

```text
Access Token
+
Refresh Token
+
Session / Device Management
```

Support:

```text
POST /api/v1/auth/login
POST /api/v1/auth/logout
POST /api/v1/auth/refresh
POST /api/v1/auth/send-otp
POST /api/v1/auth/verify-otp
POST /api/v1/auth/forgot-password
POST /api/v1/auth/reset-password
POST /api/v1/auth/change-password
GET  /api/v1/auth/me

GET    /api/v1/auth/sessions
DELETE /api/v1/auth/sessions/:id
DELETE /api/v1/auth/sessions/all
```

Use secure password hashing such as Argon2 or appropriately configured bcrypt.

Implement:

- expiration
- token revocation
- refresh token rotation where appropriate
- session management
- account lockout
- rate limiting
- brute-force protection

Never log passwords, tokens or OTPs.

---

# 13. API DESIGN

All APIs should be versioned:

```text
/api/v1/
```

Use REST resources.

Examples:

```text
POST   /api/v1/auth/login

GET    /api/v1/employees
GET    /api/v1/employees/:id
POST   /api/v1/employees
PATCH  /api/v1/employees/:id

GET    /api/v1/tasks
POST   /api/v1/tasks
PATCH  /api/v1/tasks/:id

GET    /api/v1/leaves
POST   /api/v1/leaves
POST   /api/v1/leaves/:id/approve

GET    /api/v1/conversations
GET    /api/v1/conversations/:id/messages
POST   /api/v1/conversations/:id/messages
```

Do not create giant action-based PHP-style endpoints.

---

# 14. STANDARD ERROR FORMAT

Use consistent errors.

Example:

```json
{
  "success": false,
  "error": {
    "code": "LEAVE_ALREADY_APPROVED",
    "message": "This leave application has already been approved."
  },
  "requestId": "..."
}
```

Production responses must not expose:

- SQL errors
- stack traces
- passwords
- tokens
- internal paths
- infrastructure details

---

# 15. PAGINATION / FILTERING

Large collections must support:

```text
page
limit
search
sort
sortBy
status
departmentId
employeeId
from
to
```

Use cursor pagination where appropriate, especially for chat/history.

Avoid loading huge datasets into mobile memory.

Avoid N+1 queries.

---

# 16. ATTENDANCE

Attendance is a required HRMS module.

APIs:

```text
GET    /api/v1/attendance
GET    /api/v1/attendance/today
GET    /api/v1/attendance/:employeeId
GET    /api/v1/attendance/monthly
GET    /api/v1/attendance/team
GET    /api/v1/attendance/summary
GET    /api/v1/attendance/late
GET    /api/v1/attendance/absent

POST   /api/v1/attendance/check-in
POST   /api/v1/attendance/check-out

POST   /api/v1/attendance/regularization
GET    /api/v1/attendance/regularizations/:id
POST   /api/v1/attendance/regularizations/:id/approve
POST   /api/v1/attendance/regularizations/:id/reject
```

Future integration should be possible with biometric/attendance machines.

---

# 17. SHIFTS

```text
GET    /api/v1/shifts
POST   /api/v1/shifts
PATCH  /api/v1/shifts/:id
DELETE /api/v1/shifts/:id

GET    /api/v1/shift-assignments
POST   /api/v1/shift-assignments
PATCH  /api/v1/shift-assignments/:id

GET    /api/v1/employees/:id/shift
POST   /api/v1/employees/:id/shift
```

Examples:

```text
A Shift
B Shift
C Shift
General Shift
```

---

# 18. HOLIDAYS / CALENDAR

```text
GET    /api/v1/holidays
POST   /api/v1/holidays
PATCH  /api/v1/holidays/:id
DELETE /api/v1/holidays/:id

GET    /api/v1/calendar
GET    /api/v1/calendar/events
```

Calendar should integrate with Leave and Attendance.

---

# 19. LEAVE

```text
GET    /api/v1/leave/types
POST   /api/v1/leave/types
PATCH  /api/v1/leave/types/:id
DELETE /api/v1/leave/types/:id

GET    /api/v1/leave/balance
GET    /api/v1/leave/balance/:employeeId

GET    /api/v1/leave/applications
GET    /api/v1/leave/applications/:id

POST   /api/v1/leave/applications
PATCH  /api/v1/leave/applications/:id
DELETE /api/v1/leave/applications/:id

POST   /api/v1/leave/applications/:id/submit
POST   /api/v1/leave/applications/:id/approve
POST   /api/v1/leave/applications/:id/reject
POST   /api/v1/leave/applications/:id/cancel

GET    /api/v1/leave/pending-approvals
GET    /api/v1/leave/history
```

Approval workflow must prevent invalid state transitions.

---

# 20. EMPLOYEE LIFECYCLE

Support:

```text
Application
  ↓
Joining
  ↓
Active Employee
  ↓
Transfer
  ↓
Promotion
  ↓
Resignation
  ↓
Exit
```

APIs:

```text
POST /api/v1/employees/:id/join
POST /api/v1/employees/:id/transfer
POST /api/v1/employees/:id/promote
POST /api/v1/employees/:id/resign
POST /api/v1/employees/:id/terminate
POST /api/v1/employees/:id/exit

GET  /api/v1/employees/:id/timeline
```

---

# 21. EMPLOYEE DOCUMENTS

```text
GET    /api/v1/employees/:id/documents
POST   /api/v1/employees/:id/documents
GET    /api/v1/employees/:id/documents/:documentId
DELETE /api/v1/employees/:id/documents/:documentId
```

Sensitive employee documents require strict authorization.

---

# 22. TASKS

```text
GET    /api/v1/tasks
GET    /api/v1/tasks/:id
POST   /api/v1/tasks
PATCH  /api/v1/tasks/:id
DELETE /api/v1/tasks/:id

POST   /api/v1/tasks/:id/assign
DELETE /api/v1/tasks/:id/assignees/:employeeId

POST   /api/v1/tasks/:id/start
POST   /api/v1/tasks/:id/complete
POST   /api/v1/tasks/:id/cancel

GET    /api/v1/tasks/:id/comments
POST   /api/v1/tasks/:id/comments
PATCH  /api/v1/tasks/:id/comments/:commentId
DELETE /api/v1/tasks/:id/comments/:commentId

POST   /api/v1/tasks/:id/attachments
GET    /api/v1/tasks/:id/attachments
DELETE /api/v1/tasks/:id/attachments/:attachmentId
```

---

# 23. KRA / PERFORMANCE

Workflow:

```text
Employee Self Rating
       ↓
HOD Rating
       ↓
Head/Director Rating
       ↓
Admin Finalization
```

APIs:

```text
GET    /api/v1/kra/cycles
POST   /api/v1/kra/cycles
PATCH  /api/v1/kra/cycles/:id
POST   /api/v1/kra/cycles/:id/close

GET    /api/v1/kra
POST   /api/v1/kra
GET    /api/v1/kra/:id
PATCH  /api/v1/kra/:id
DELETE /api/v1/kra/:id

POST   /api/v1/kra/:id/assign
GET    /api/v1/kra/my

GET    /api/v1/kra/:id/ratings
POST   /api/v1/kra/:id/self-rating
POST   /api/v1/kra/:id/hod-rating
POST   /api/v1/kra/:id/head-rating
POST   /api/v1/kra/:id/admin-finalize

GET    /api/v1/kra/history
GET    /api/v1/kra/reports
```

Use explicit state transitions.

---

# 24. KAIZEN

```text
GET    /api/v1/kaizens
GET    /api/v1/kaizens/:id
POST   /api/v1/kaizens
PATCH  /api/v1/kaizens/:id
DELETE /api/v1/kaizens/:id

POST   /api/v1/kaizens/:id/submit
POST   /api/v1/kaizens/:id/approve
POST   /api/v1/kaizens/:id/reject

POST   /api/v1/kaizens/:id/comments
GET    /api/v1/kaizens/:id/comments

POST   /api/v1/kaizens/:id/attachments
GET    /api/v1/kaizens/:id/attachments
DELETE /api/v1/kaizens/:id/attachments/:attachmentId
```

---

# 25. SOP

Workflow:

```text
Create
  ↓
HOD Approval
  ↓
Director Approval
  ↓
Published
```

APIs:

```text
GET    /api/v1/sops
GET    /api/v1/sops/:id
POST   /api/v1/sops
PATCH  /api/v1/sops/:id
DELETE /api/v1/sops/:id

POST   /api/v1/sops/:id/submit
POST   /api/v1/sops/:id/approve
POST   /api/v1/sops/:id/reject

GET    /api/v1/sops/:id/versions
POST   /api/v1/sops/:id/versions

GET    /api/v1/sops/:id/approvals
```

---

# 26. NOTICES

```text
GET    /api/v1/notices
GET    /api/v1/notices/:id
POST   /api/v1/notices
PATCH  /api/v1/notices/:id
DELETE /api/v1/notices/:id

POST   /api/v1/notices/:id/publish
POST   /api/v1/notices/:id/unpublish

GET    /api/v1/notices/:id/comments
POST   /api/v1/notices/:id/comments
DELETE /api/v1/notices/:id/comments/:commentId

POST   /api/v1/notices/:id/image
DELETE /api/v1/notices/:id/image
```

---

# 27. COMPLAINTS

```text
GET    /api/v1/complaints
GET    /api/v1/complaints/:id
POST   /api/v1/complaints
PATCH  /api/v1/complaints/:id

POST   /api/v1/complaints/:id/assign
POST   /api/v1/complaints/:id/investigate
POST   /api/v1/complaints/:id/resolve
POST   /api/v1/complaints/:id/reopen

GET    /api/v1/complaints/:id/updates
POST   /api/v1/complaints/:id/updates
```

---

# 28. TRAINING

```text
GET    /api/v1/trainings
GET    /api/v1/trainings/:id
POST   /api/v1/trainings
PATCH  /api/v1/trainings/:id
DELETE /api/v1/trainings/:id

POST   /api/v1/trainings/:id/participants
DELETE /api/v1/trainings/:id/participants/:employeeId

GET    /api/v1/trainings/:id/feedback
POST   /api/v1/trainings/:id/feedback

GET    /api/v1/trainings/:id/report
```

---

# 29. CHAT

Chat must be designed as a serious enterprise messaging system.

Support:

- direct messages
- groups
- group admins
- members
- replies
- forwarding
- editing
- deletion
- reactions
- pinning
- starring
- attachments
- read receipts
- unread counts
- typing
- presence
- search
- media gallery

REST:

```text
GET    /api/v1/chat/conversations
GET    /api/v1/chat/conversations/:id
POST   /api/v1/chat/conversations
PATCH  /api/v1/chat/conversations/:id
DELETE /api/v1/chat/conversations/:id

POST   /api/v1/chat/direct
GET    /api/v1/chat/direct/:employeeId

GET    /api/v1/chat/conversations/:id/messages
POST   /api/v1/chat/conversations/:id/messages

PATCH  /api/v1/chat/messages/:id
DELETE /api/v1/chat/messages/:id

POST   /api/v1/chat/messages/:id/reply
POST   /api/v1/chat/messages/:id/forward

POST   /api/v1/chat/messages/:id/star
DELETE /api/v1/chat/messages/:id/star

POST   /api/v1/chat/messages/:id/pin
DELETE /api/v1/chat/messages/:id/pin

POST   /api/v1/chat/messages/:id/reaction
DELETE /api/v1/chat/messages/:id/reaction

POST   /api/v1/chat/conversations/:id/read
GET    /api/v1/chat/unread

GET    /api/v1/chat/search
GET    /api/v1/chat/conversations/:id/media
```

---

# 30. GROUP CHAT

```text
POST   /api/v1/chat/groups
GET    /api/v1/chat/groups/:id
PATCH  /api/v1/chat/groups/:id
DELETE /api/v1/chat/groups/:id

GET    /api/v1/chat/groups/:id/members

POST   /api/v1/chat/groups/:id/members
DELETE /api/v1/chat/groups/:id/members/:employeeId

PATCH  /api/v1/chat/groups/:id/members/:employeeId/role

POST   /api/v1/chat/groups/:id/admins
DELETE /api/v1/chat/groups/:id/admins/:employeeId

POST   /api/v1/chat/groups/:id/leave
```

---

# 31. PRESENCE

REST recovery/support:

```text
GET  /api/v1/chat/presence
GET  /api/v1/chat/presence/:employeeId
POST /api/v1/chat/presence/heartbeat
```

Realtime:

```text
user:online
user:offline
user:typing
user:stopped_typing
message:new
message:read
message:updated
message:deleted
```

Do not depend entirely on WebSocket state. REST/database state must support recovery.

---

# 32. AUDIO / VIDEO CALLS

Use WebRTC.

Separate:

```text
Signaling
Media transport
Call state
Call history
```

REST:

```text
POST   /api/v1/calls
GET    /api/v1/calls
GET    /api/v1/calls/:id

POST   /api/v1/calls/:id/accept
POST   /api/v1/calls/:id/reject
POST   /api/v1/calls/:id/end
POST   /api/v1/calls/:id/cancel

GET    /api/v1/calls/history
```

Socket events:

```text
call:incoming
call:ringing
call:offer
call:answer
call:ice-candidate
call:accepted
call:rejected
call:ended
call:busy
```

Do NOT send WebRTC media through the Node.js application server.

---

# 33. NOTIFICATIONS

REST:

```text
GET    /api/v1/notifications
GET    /api/v1/notifications/unread

POST   /api/v1/notifications/:id/read
POST   /api/v1/notifications/read-all

DELETE /api/v1/notifications/:id

POST   /api/v1/devices/register
DELETE /api/v1/devices/:id

GET    /api/v1/notifications/preferences
PATCH  /api/v1/notifications/preferences
```

Notification event architecture:

```text
Business Event
    ↓
Notification Service
    ├── Mobile Push
    ├── Email
    ├── Telegram
    └── In-app notification
```

Events include:

```text
leave.applied
leave.approved
leave.rejected
task.assigned
task.completed
kra.submitted
kra.approved
kaizen.approved
sop.approved
complaint.updated
chat.message
call.incoming
```

---

# 34. FILE MANAGEMENT

Do not store large binary files directly in PostgreSQL.

Use object storage.

Metadata example:

```text
file_id
owner_id
filename
mime_type
size
storage_key
created_at
```

APIs:

```text
POST   /api/v1/files/upload
GET    /api/v1/files/:id
GET    /api/v1/files/:id/download
DELETE /api/v1/files/:id
```

Prefer signed URLs for large files.

Validate:

- MIME type
- size
- extension
- authorization
- filename
- storage access

Design for future virus scanning.

---

# 35. SEARCH

Central search:

```text
GET /api/v1/search?q=
```

Search authorized data across:

- employees
- tasks
- notices
- SOPs
- Kaizens
- complaints
- chat messages

Never return records the user is not authorized to see.

---

# 36. COMMENTS / MENTIONS

Reusable comment system:

```text
GET    /api/v1/comments
POST   /api/v1/comments
PATCH  /api/v1/comments/:id
DELETE /api/v1/comments/:id
```

Support mentions:

```text
@Employee
@HOD
@Director
```

Mentions should generate appropriate notifications.

---

# 37. APPROVAL / WORKFLOW ENGINE

Do not duplicate workflow logic separately in every module.

Create reusable workflow concepts.

```text
GET  /api/v1/workflows
GET  /api/v1/workflows/:id
POST /api/v1/workflows

GET  /api/v1/approvals/pending
GET  /api/v1/approvals/history

POST /api/v1/approvals/:id/approve
POST /api/v1/approvals/:id/reject
POST /api/v1/approvals/:id/delegate
```

Workflows can power:

- Leave
- KRA
- SOP
- Kaizen
- Complaints
- future ERP workflows

---

# 38. REMINDERS

```text
GET    /api/v1/reminders
POST   /api/v1/reminders
PATCH  /api/v1/reminders/:id
DELETE /api/v1/reminders/:id
```

Automated reminders:

- leave pending
- KRA pending
- task overdue
- training feedback pending
- SOP approval pending

---

# 39. REPORTING / ANALYTICS

Reports:

```text
GET /api/v1/reports/employees
GET /api/v1/reports/leave
GET /api/v1/reports/tasks
GET /api/v1/reports/kra
GET /api/v1/reports/kaizen
GET /api/v1/reports/sop
GET /api/v1/reports/complaints
GET /api/v1/reports/training
GET /api/v1/reports/chat
```

Analytics:

```text
GET /api/v1/analytics/headcount
GET /api/v1/analytics/attendance
GET /api/v1/analytics/leave
GET /api/v1/analytics/turnover
GET /api/v1/analytics/tasks
GET /api/v1/analytics/kra
GET /api/v1/analytics/kaizen
```

Do not run expensive analytics directly from mobile-facing transactional endpoints.

---

# 40. EXPORTS

Large exports should run as background jobs.

```text
POST /api/v1/exports
GET  /api/v1/exports
GET  /api/v1/exports/:id
GET  /api/v1/exports/:id/download
```

Supported formats may include:

- XLSX
- CSV
- PDF

Architecture:

```text
Request
  ↓
Queue
  ↓
Worker
  ↓
Generate
  ↓
Object Storage
  ↓
Download
```

---

# 41. IMPORTS

HR needs bulk operations.

```text
POST /api/v1/employees/import
GET  /api/v1/employees/import/:id
GET  /api/v1/employees/import/:id/errors

POST /api/v1/attendance/import
POST /api/v1/kra/import
POST /api/v1/leave/import
```

Use background processing for large imports.

---

# 42. DASHBOARDS

Employee:

```text
GET /api/v1/dashboard/employee
```

HOD:

```text
GET /api/v1/dashboard/hod
GET /api/v1/dashboard/hod/team
```

Director:

```text
GET /api/v1/dashboard/director
```

Admin:

```text
GET /api/v1/dashboard/admin
GET /api/v1/dashboard/admin/stats
GET /api/v1/dashboard/admin/activity
```

---

# 43. DIRECTOR / ADMIN SECURITY MODULE

This is a REQUIRED major module.

The system must provide authorized Director/Admin users with security visibility into:

- who logged in
- login timing
- logout timing
- sessions
- IP addresses
- devices
- login failures
- blocked users
- blocked IPs
- security events
- suspicious logins
- audit activity
- security reports

Security data must be restricted by permission.

---

# 44. LOGIN HISTORY

```text
GET /api/v1/security/login-history
GET /api/v1/security/login-history/:id
```

Filters:

```text
employeeId
username
ip
status
from
to
device
location
```

Record:

```text
employee
employee ID
login time
logout time
IP address
user agent
device
OS
app version
browser
login status
failure reason
session ID
```

---

# 45. LOGIN ATTEMPTS

Separate successful logins from attempts.

```text
GET /api/v1/security/login-attempts
```

Track:

```text
username/employee
IP
timestamp
success/failed
failure reason
device
user agent
```

Example:

```text
09:12 Employee SUCCESS
09:14 Unknown FAILED Wrong password
09:14 Unknown FAILED Wrong password
09:15 Unknown FAILED Wrong password
```

This supports brute-force detection.

---

# 46. ACTIVE SESSIONS

```text
GET    /api/v1/security/sessions
GET    /api/v1/security/sessions/:id
DELETE /api/v1/security/sessions/:id
POST   /api/v1/security/sessions/:id/revoke

POST /api/v1/security/users/:userId/revoke-all-sessions
```

Director/Admin can see:

```text
Employee
Status
Login time
Last activity
IP
Device
App version
Session duration
```

Authorized administrators can revoke sessions.

---

# 47. IP SECURITY

```text
GET    /api/v1/security/ip-addresses
GET    /api/v1/security/ip-addresses/:ip

POST   /api/v1/security/ip/block
POST   /api/v1/security/ip/unblock

GET    /api/v1/security/ip/blocked
```

Blocked IP record:

```text
IP
reason
blocked by
blocked at
expires at
permanent/temporary
```

Do not treat IP geolocation as exact physical location.

---

# 48. ACCOUNT BLOCKING

```text
GET  /api/v1/security/blocked-users

POST /api/v1/security/users/:id/block
POST /api/v1/security/users/:id/unblock
```

Support:

- temporary block
- permanent block
- automatic lockout
- manual admin block

Record:

```text
blocked_by
blocked_at
reason
expires_at
```

---

# 49. DEVICE MANAGEMENT

```text
GET    /api/v1/security/devices
GET    /api/v1/security/users/:id/devices

POST   /api/v1/security/devices/:id/block
POST   /api/v1/security/devices/:id/unblock
DELETE /api/v1/security/devices/:id
```

Track:

```text
device ID
employee
Android/iOS
model
OS version
app version
first seen
last seen
IP
last login
status
```

---

# 50. SECURITY EVENTS

```text
GET /api/v1/security/events
GET /api/v1/security/events/:id
```

Event types:

```text
LOGIN_SUCCESS
LOGIN_FAILED
LOGOUT
SESSION_CREATED
SESSION_REVOKED

PASSWORD_CHANGED
PASSWORD_RESET

OTP_REQUESTED
OTP_FAILED

ACCOUNT_BLOCKED
ACCOUNT_UNBLOCKED

IP_BLOCKED
IP_UNBLOCKED

ROLE_CHANGED
PERMISSION_CHANGED

DEVICE_REGISTERED
DEVICE_BLOCKED

SUSPICIOUS_LOGIN
```

---

# 51. SUSPICIOUS LOGIN DETECTION

Create security rules that can flag:

- new device
- new IP
- unusual country/location
- repeated failed attempts
- unusual login timing
- multiple simultaneous sessions
- suspicious access pattern
- other configurable anomalies

Example:

```text
Normal:
India / Office IP / Known Android

Suddenly:
Different country / Unknown device
```

Generate:

```text
SUSPICIOUS_LOGIN
```

and notify authorized security/admin users where appropriate.

Do not claim exact physical location from IP alone.

---

# 52. SECURITY DASHBOARD

Required endpoint:

```text
GET /api/v1/security/dashboard
```

Example metrics:

```text
Active Users
Active Sessions
Today's Logins
Failed Logins
Blocked Users
Blocked IPs
Suspicious Logins
```

Recent activity:

```text
Employee
Time
IP
Device
Status
```

---

# 53. LOGIN TIMING REPORTS

```text
GET /api/v1/security/reports/logins
```

Parameters:

```text
from
to
employee
department
location
status
```

Report fields:

```text
Employee
First Login
Last Login
Total Sessions
Total Login Time
Failed Attempts
IP Count
Device Count
```

---

# 54. EMPLOYEE SECURITY PROFILE

```text
GET /api/v1/security/users/:userId/overview
```

Show:

```text
Employee
Last Login
Last Logout
Current Session
Total Sessions
Known IPs
Known Devices
Failed Login Attempts
Blocked Attempts
Password Last Changed
Recent Security Events
```

---

# 55. SECURITY DATABASE TABLES

Recommended dedicated security tables:

```text
user_sessions
login_attempts
security_events
blocked_ips
blocked_users
user_devices
audit_logs
```

`user_sessions` should conceptually include:

```text
id
user_id
session_token_hash
ip_address
user_agent
device_id
created_at
last_activity_at
expires_at
revoked_at
logout_at
```

`login_attempts`:

```text
id
user_id
username_attempted
ip_address
user_agent
device_id
success
failure_reason
created_at
```

`security_events`:

```text
id
user_id
event_type
ip_address
device_id
metadata
severity
created_at
```

`blocked_ips`:

```text
id
ip_address
reason
blocked_by
blocked_at
expires_at
is_permanent
```

Never store raw passwords, raw refresh tokens or other secrets.

---

# 56. SECURITY VS AUDIT

Keep these as different concepts.

## Security log

Answers:

```text
Who accessed the system?
When?
From which IP?
Which device?
Was it successful?
```

## Audit log

Answers:

```text
What did the user do after login?
```

Example:

```text
09:12 Login
09:15 Opened employee record
09:17 Approved leave
09:20 Changed KRA rating
09:25 Downloaded report
09:31 Logout
```

Audit endpoint:

```text
GET /api/v1/audit-logs
GET /api/v1/audit-logs/:id
```

---

# 57. AUDIT EVENTS

Track important business/security actions:

```text
LOGIN
LOGOUT
EMPLOYEE_CREATED
EMPLOYEE_UPDATED

LEAVE_APPLIED
LEAVE_APPROVED
LEAVE_REJECTED

TASK_CREATED
TASK_ASSIGNED
TASK_COMPLETED

KRA_RATED
KRA_FINALIZED

NOTICE_PUBLISHED

COMPLAINT_RESOLVED

CHAT_MESSAGE_DELETED

REPORT_EXPORTED
```

Audit records should include actor, target/resource, action, timestamp and relevant metadata.

---

# 58. EMAIL

Use an internal email service rather than exposing unrestricted email functionality.

Templates can include:

```text
Welcome
Password Reset
Leave Approved
Task Assigned
KRA Reminder
Complaint Update
Training Invitation
```

Use background jobs for email.

---

# 59. TELEGRAM

Existing Telegram integration should be preserved where required.

Internal/service-level functionality may include:

```text
Telegram status
Telegram test
Telegram send
```

Do not expose bot credentials to the mobile client.

---

# 60. APP CONFIGURATION

Mobile application should be able to receive controlled configuration.

```text
GET /api/v1/app/config
GET /api/v1/app/version
GET /api/v1/app/maintenance
```

Example:

```json
{
  "minimumVersion": "1.0.0",
  "latestVersion": "1.0.0",
  "forceUpdate": false,
  "maintenance": false
}
```

This is useful for controlling mandatory Play Store updates.

---

# 61. FEATURE FLAGS

```text
GET   /api/v1/feature-flags
PATCH /api/v1/feature-flags/:id
```

Examples:

```text
chat_enabled
video_calls_enabled
kaizen_enabled
kra_enabled
maintenance_mode
```

Feature flag authorization must be enforced server-side.

---

# 62. SYSTEM HEALTH

Required:

```text
GET /health
GET /health/live
GET /health/ready
GET /version
```

Monitor:

- API latency
- HTTP errors
- database connections
- Redis
- WebSocket
- queues
- storage
- CPU
- RAM
- disk

Never expose sensitive infrastructure details publicly.

---

# 63. BACKGROUND JOBS

Use Redis + BullMQ for asynchronous workloads:

```text
email
push notifications
Telegram notifications
report generation
Excel exports
file processing
data migration
reminders
cleanup
```

Do not make large exports or long-running processing block HTTP requests.

---

# 64. MOBILE ARCHITECTURE

Recommended:

```text
mobile/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── employees/
│   │   ├── attendance/
│   │   ├── leave/
│   │   ├── tasks/
│   │   ├── kra/
│   │   ├── kaizen/
│   │   ├── sop/
│   │   ├── notices/
│   │   ├── complaints/
│   │   ├── training/
│   │   ├── chat/
│   │   ├── calls/
│   │   ├── security/
│   │   └── profile/
│   │
│   ├── components/
│   ├── navigation/
│   ├── services/
│   │   ├── api/
│   │   ├── socket/
│   │   ├── webrtc/
│   │   └── notifications/
│   ├── context/
│   ├── hooks/
│   ├── store/
│   ├── theme/
│   ├── types/
│   └── utils/
```

Keep API logic outside screens.

Use centralized API/client handling.

---

# 65. MOBILE UX

Every screen should handle:

```text
Loading
Success
Empty
Error
Offline
Permission denied
Retry
```

Use reusable:

- buttons
- inputs
- cards
- dialogs
- bottom sheets
- lists
- avatars
- badges
- status indicators
- skeleton loaders

The application should feel like a professional enterprise application.

---

# 66. ANDROID PRODUCTION BUILD

The production React Native application MUST support native Gradle builds.

Production package ID:

```text
com.srjsteel.hrms
```

Do not change this package ID after publication unless explicitly required.

## Release APK

From:

```text
mobile/android/
```

Windows:

```powershell
.\gradlew clean assembleRelease
```

Linux/macOS:

```bash
./gradlew clean assembleRelease
```

Expected:

```text
mobile/android/app/build/outputs/apk/release/app-release.apk
```

Use APK for:

- QA
- internal testing
- direct installation
- pilot deployment

## Play Store AAB

Windows:

```powershell
.\gradlew clean bundleRelease
```

Linux/macOS:

```bash
./gradlew clean bundleRelease
```

Expected:

```text
mobile/android/app/build/outputs/bundle/release/app-release.aab
```

Use AAB for Google Play Store.

Production must not depend on Expo Go.

Expo modules are allowed where useful, but native Gradle production builds are mandatory.

---

# 67. ANDROID SIGNING

Use a real production release keystore.

Never commit:

- keystore passwords
- signing passwords
- private credentials

Use secure environment variables / CI secrets:

```text
MYAPP_RELEASE_STORE_FILE
MYAPP_RELEASE_KEY_ALIAS
MYAPP_RELEASE_STORE_PASSWORD
MYAPP_RELEASE_KEY_PASSWORD
```

Preserve the production signing identity for future updates.

---

# 68. VERSIONING

Use:

```text
versionCode
versionName
```

Every Play Store release must increment `versionCode`.

Example:

```text
versionName = "1.0.0"
versionCode = 1
```

Next:

```text
versionName = "1.0.1"
versionCode = 2
```

Never reuse a published versionCode.

---

# 69. BUILD ENVIRONMENTS

Prefer:

```text
development
staging
production
```

Each environment should have explicit API configuration.

Production must point to:

```text
https://sarthi.srjsteel.in/api/v1
```

Production WebSocket should use the production domain and secure transport.

Never accidentally ship a build connected to development/staging.

---

# 70. RELEASE VALIDATION

Before production APK/AAB:

- TypeScript check
- tests
- Android Gradle build
- release signing
- application ID
- versionCode
- versionName
- production API URL
- production WebSocket URL
- push notification configuration
- deep links
- permissions
- R8/ProGuard configuration
- network security
- crash/error handling

---

# 71. CI/CD

Eventually automate:

```text
Git Push
   ↓
Lint
   ↓
Type Check
   ↓
Unit Tests
   ↓
Integration Tests
   ↓
Build
   ↓
Docker Build
   ↓
Docker Push
   ↓
Deploy
   ↓
Health Check
```

Android:

```text
Git Push
   ↓
Type Check
   ↓
Tests
   ↓
Gradle assembleRelease
   ↓
Gradle bundleRelease
   ↓
Artifacts
```

Do not deploy if health checks fail.

---

# 72. DOCKER DEPLOYMENT

Target service architecture:

```text
nginx
api
postgres
redis
worker
websocket
object-storage
```

Services can be combined only where there is a justified operational reason.

Do not expose PostgreSQL publicly.

Do not expose Redis publicly.

Use secrets/environment variables.

---

# 73. DATA MIGRATION FROM OLD SYSTEM

Old PHP/MySQL system is the source of existing business data.

Do not blindly copy tables.

Migration:

```text
Old MySQL
   ↓
Extract
   ↓
Transform
   ↓
Validate
   ↓
PostgreSQL
```

Migrate as required:

- employees
- users
- leave
- attendance if available
- tasks
- KRA
- Kaizen
- SOP
- notices
- complaints
- chat
- notifications

For every major migration, measure:

```text
old count
new count
failed records
duplicate records
missing records
```

Maintain reconciliation reports.

---

# 74. TESTING

Feature completion requires tests.

## Unit

- services
- business logic
- utilities

## Integration

- database
- API
- authentication
- workflows
- permissions

## E2E

Important journeys:

```text
Login
Apply Leave
Approve Leave
Create Task
Assign Task
Complete Task
Submit KRA
Approve KRA
Submit Kaizen
Approve Kaizen
Submit SOP
Approve SOP
Send Chat Message
Create Group
Make Call
Revoke Session
Block User
```

---

# 75. SECURITY PRINCIPLES

Implement:

- input validation
- SQL injection protection
- XSS protection
- CSRF protection where applicable
- rate limiting
- brute-force protection
- secure headers
- strict CORS
- JWT security
- refresh token security
- authorization
- upload validation
- audit logging
- secrets management
- encryption where appropriate

Assume the mobile client can be manipulated.

Backend must never trust client-supplied authorization.

---

# 76. OBSERVABILITY

Implement:

- structured logging
- request IDs
- error tracking
- health checks
- metrics architecture

Do not log:

- passwords
- access tokens
- refresh tokens
- OTPs
- sensitive personal information

---

# 77. PERFORMANCE

Use:

- database indexes
- pagination
- connection pooling
- selective queries
- caching where justified
- background jobs
- efficient WebSocket handling

Avoid N+1 queries.

Do not introduce Redis for everything. Use it where it has a clear purpose.

---

# 78. DEVELOPMENT PROCESS FOR EVERY FEATURE

Whenever the product owner asks to build a feature, follow this process.

## Step 1 — Understand

State what you understand.

## Step 2 — Analyze

Identify:

- business requirements
- hidden requirements
- dependencies
- database changes
- API changes
- frontend changes
- security implications
- permissions
- edge cases
- performance implications
- migration implications

## Step 3 — Design

Present the architecture before implementation if the change is significant.

## Step 4 — Implement

Write complete production-quality code.

## Step 5 — Validate

Check:

- TypeScript
- database
- APIs
- authorization
- edge cases
- mobile behavior

## Step 6 — Test

Provide and/or execute relevant tests.

## Step 7 — Deploy

Explain:

- migration
- build
- deployment
- verification
- rollback

---

# 79. DO NOT

Never:

- invent nonexistent files
- invent database columns
- assume APIs exist
- silently change business rules
- delete existing functionality
- duplicate business logic
- put secrets in source code
- bypass authorization
- use `any` everywhere
- ignore TypeScript errors
- ignore database constraints
- introduce unnecessary dependencies
- expose internal infrastructure
- create huge monolithic controllers
- make WebRTC media pass through the API server
- make huge reports synchronous
- store large files directly in PostgreSQL

If information is missing from the repository, ask for the actual relevant file rather than guessing.

---

# 80. WHEN YOU FIND A PROBLEM

Use:

```text
Problem
Why it happens
Impact
Recommended solution
Implementation
Migration
Rollback
```

If dangerous for production, explicitly state:

```text
DO NOT DEPLOY THIS YET.
```

---

# 81. ARCHITECTURE PRINCIPLE

Think through the full chain:

```text
Business Requirement
        ↓
Database
        ↓
Domain / Business Logic
        ↓
API
        ↓
Realtime
        ↓
State Management
        ↓
React Native UI
        ↓
Notifications
        ↓
Audit
        ↓
Security
        ↓
Testing
        ↓
Deployment
        ↓
Monitoring
```

A feature is not complete just because a screen works.

---

# 82. INITIAL PROJECT BUILD ORDER

Do NOT begin by creating random screens.

Build the foundation first.

## Phase 1 — Foundation

1. Monorepo
2. Node/NestJS
3. React Native
4. PostgreSQL
5. Prisma
6. Redis
7. Docker Compose
8. Environment configuration
9. Logging
10. Error handling
11. Validation
12. API versioning
13. Health checks
14. CI/CD foundation

## Phase 2 — Identity

15. Users
16. Employees
17. Organization
18. Departments
19. Designations
20. Roles
21. Permissions
22. Authentication
23. Sessions
24. Security logging

## Phase 3 — HR

25. Attendance
26. Shifts
27. Holidays
28. Leave
29. Employee documents
30. Employee lifecycle

## Phase 4 — Work / Performance

31. Tasks
32. KRA
33. Kaizen
34. SOP
35. Notices
36. Complaints
37. Training

## Phase 5 — Communication

38. Notifications
39. Chat
40. Groups
41. Presence
42. Audio/video calls

## Phase 6 — Management

43. Dashboards
44. Analytics
45. Reports
46. Exports
47. Imports
48. Search
49. Activity
50. Audit
51. Director/Admin security dashboard

## Phase 7 — Migration / Production

52. Data migration
53. Reconciliation
54. Staging
55. Performance testing
56. Security testing
57. Production deployment
58. Monitoring
59. Old-system cutover

---

# 83. INITIAL MONOREPO TARGET

Recommended:

```text
sarthi-hrms/
├── apps/
│   ├── api/
│   └── mobile/
│
├── packages/
│   ├── shared-types/
│   ├── config/
│   └── validation/
│
├── database/
├── infrastructure/
│   ├── docker/
│   └── nginx/
│
├── scripts/
├── docs/
├── .github/
│   └── workflows/
│
├── docker-compose.yml
├── package.json
└── CONTEXT.md
```

Use a shared package only where it genuinely reduces duplication.

Do not create a giant shared package that couples unrelated modules.

---

# 84. EXPECTED API SCALE

The application is expected to have approximately **250+ HTTP API operations** across its modules, plus realtime Socket.IO events.

This is normal for an HRMS/ERP of this scope.

Do not try to build every endpoint simultaneously.

Build the architecture and foundation first.

---

# 85. CURRENT REFERENCE FEATURES TO PRESERVE

The old Sarthi system already has functionality around:

- Employee Management
- Employee profiles
- Profile pictures
- Designations
- HOD/Director management
- Leave applications
- Leave balance
- Leave approval
- Personal/team/HOD/Director tasks
- Task attachments
- KRA
- Self/HOD/Head/Admin rating workflow
- KRA history/export
- Kaizen submissions
- Kaizen attachments
- HOD review
- SOP creation/upload/approval
- HOD → Director approval
- Notice board
- Notice images/comments
- Complaints
- Direct chat
- Group chat
- Chat administration
- Message reply
- Pin
- Star
- Edit
- Delete
- Forward
- Search
- Media gallery
- WebRTC calls
- Web Push
- Mobile push
- Telegram
- Training feedback
- Admin dashboard
- HOD dashboard
- Activity analytics

The new architecture should preserve these capabilities while improving implementation quality.

---

# 86. IMPORTANT LEGACY ISSUES

The old system has known inconsistencies, including:

- `chat_presence` currently has `user_id` and `last_seen` rather than a dedicated `is_online` field
- some chat columns were manually added on production
- the old project requires Docker image rebuilds for backend changes
- the old GitHub repository is private
- production deployment uses Docker/Nginx
- database migrations are tracked separately

Do NOT reproduce these weaknesses in the new architecture.

The new PostgreSQL schema must be migration-controlled.

---

# 87. FINAL DEVELOPMENT MINDSET

Treat the system as if you will personally own the architecture for the next five years.

Before implementing any feature, ask:

```text
Is the data model correct?
Is the authorization correct?
Is the workflow correct?
Can the user manipulate the client?
What happens if the network fails?
What happens if two users act simultaneously?
What happens if the request is duplicated?
What happens if the process crashes?
Can the feature scale?
Can we audit it?
Can we debug it?
Can we migrate it?
Can we roll it back?
```

The goal is not:

> “Make the feature work.”

The goal is:

> **Build the feature correctly so it remains reliable when Sarthi becomes a large enterprise HRMS/ERP platform.**

---

# 88. FIRST TASK FOR CLAUDE

Before writing application features:

1. Inspect the repository.
2. Understand the current codebase if it is available.
3. Create the new monorepo architecture.
4. Establish Node.js/NestJS.
5. Establish React Native.
6. Establish PostgreSQL.
7. Establish Prisma.
8. Establish Redis.
9. Establish Docker Compose.
10. Establish environment management.
11. Establish API versioning.
12. Establish authentication architecture.
13. Establish RBAC.
14. Establish security/session tables.
15. Establish logging/error handling.
16. Establish health endpoints.
17. Establish testing foundation.
18. Establish CI/CD.
19. Create architecture documentation.
20. Only then start building individual HRMS modules.

Do not generate hundreds of APIs and screens blindly.

**Foundation → Architecture → Database → Security → Core modules → Realtime → Reporting → Migration → Production.**

---

# 89. SUCCESS CRITERIA

The new Sarthi HRMS is successful when:

- React Native production APK builds through Gradle
- React Native production AAB builds through Gradle
- package ID remains `com.srjsteel.hrms`
- Node/NestJS backend is modular
- PostgreSQL schema is properly designed
- Prisma migrations are controlled
- RBAC is enforced server-side
- sessions are securely managed
- login/IP/device/security activity is auditable
- Director/Admin can monitor authorized security information
- HRMS workflows are state-safe
- chat is realtime and recoverable
- WebRTC signaling is reliable
- notifications work asynchronously
- large files use object storage
- reports use background jobs where necessary
- application is observable
- data migration is measurable
- CI/CD is reproducible
- production deployment is repeatable
- rollback is possible
- no secrets are committed
- no critical business logic is hidden inside UI code
- system can scale without a complete architectural rewrite

---

# 90. DIRECTIVE TO CLAUDE

**Read this CONTEXT.md completely before starting.**

Do not treat this as a request to immediately generate a large amount of code.

First establish a correct architecture.

When requirements conflict, prioritize:

1. Security
2. Data integrity
3. Correct business behavior
4. Maintainability
5. Reliability
6. Scalability
7. Performance
8. Developer convenience

When uncertain, inspect the actual repository and existing implementation before guessing.

You are the technical right hand of the SRJ Steel Sarthi HRMS product owner.

Build it like a serious enterprise platform.
