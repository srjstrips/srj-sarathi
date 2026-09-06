# Sarthi HRMS — Authentication, Authorization, Security & Privacy API Module

## 1. Scope

This document defines the module-specific architecture and API specification for:

- Authentication
- Authorization
- Roles
- Permissions
- Organizational scope
- Sessions
- Devices
- Login history
- Login attempts
- IP security
- User blocking
- Security events
- Audit
- Privacy Policy
- Policy versioning
- Consent
- Data access
- Data export
- Data correction
- Account deletion
- Data retention
- Privacy requests

This document is intended for Claude / the AI development agent working on the Sarthi HRMS project.

---

# 2. Authentication and Authorization are Separate

## Authentication

Authentication answers:

> Who are you?

Authentication handles:

- Login
- Password
- OTP
- Access tokens
- Refresh tokens
- Sessions
- Devices
- Logout
- Password reset
- Account lockout
- Login/security events

## Authorization

Authorization answers:

> What are you allowed to do?

Authorization handles:

- Roles
- Permissions
- Organization scope
- Resource ownership
- Approval authority
- Module access
- Action access
- Data visibility
- Workflow authority

Do not combine authentication and authorization into one controller/service.

Recommended structure:

```text
apps/api/src/
├── authentication/
├── authorization/
├── security/
├── sessions/
└── privacy/
```

---

# 3. Official Business Roles

Initial roles:

```text
DIRECTOR
ADMIN
HR
HOD
SUB_HOD
EMPLOYEE
```

Roles must be database-driven.

Do not hard-code business role behavior throughout the application.

A user may have:

```text
User
 ├── Employee
 ├── Role(s)
 ├── Permissions
 ├── Company
 ├── Plant / Location
 ├── Division
 ├── Department
 ├── Section
 ├── Reporting Manager
 └── Organizational Scope
```

---

# 4. Role Does Not Equal Scope

Authorization must not rely only on role.

Example:

```text
User A
Role       = HOD
Department = Production
Plant      = Plant A
```

and:

```text
User B
Role       = HOD
Department = HR
Plant      = Plant A
```

Both are HODs, but User A must not automatically access User B's department records.

Authorization must combine:

```text
Identity
+
Role
+
Permission
+
Organization Scope
+
Resource Relationship
+
Workflow State
```

---

# 5. Organization Hierarchy

Use this conceptual hierarchy:

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
Employee
```

Employee relationships may include:

```text
employee.manager_id
employee.hod_id
employee.sub_hod_id
employee.company_id
employee.location_id
employee.division_id
employee.department_id
employee.section_id
```

Use canonical relationships rather than unnecessary duplicated hierarchy data.

---

# 6. Department and Section Model

Departments are first-class entities.

Possible SRJ Steel examples:

```text
Production
Quality
Maintenance
Electrical
Mechanical
Stores
Purchase
Sales
Marketing
Finance
Accounts
HR
IT
PPC
Logistics
Dispatch
Safety
Projects
Administration
```

These are examples only. They must not be hard-coded.

Departments should support sections/sub-teams.

Example:

```text
Production
├── Melting
├── Rolling Mill
├── Finishing
└── Packing
```

Another:

```text
Maintenance
├── Mechanical
├── Electrical
└── Utilities
```

HOD and Sub-HOD visibility should be configurable by department/section/team scope.

---

# 7. Authentication Module

Recommended structure:

```text
authentication/
├── authentication.module.ts
├── authentication.controller.ts
├── authentication.service.ts
├── strategies/
│   ├── jwt-access.strategy.ts
│   └── jwt-refresh.strategy.ts
├── guards/
│   ├── access-token.guard.ts
│   └── refresh-token.guard.ts
├── dto/
│   ├── login.dto.ts
│   ├── refresh-token.dto.ts
│   ├── verify-otp.dto.ts
│   ├── forgot-password.dto.ts
│   ├── reset-password.dto.ts
│   └── change-password.dto.ts
└── services/
```

## Authentication APIs

```text
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh

POST   /api/v1/auth/send-otp
POST   /api/v1/auth/verify-otp

POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/change-password

GET    /api/v1/auth/me

GET    /api/v1/auth/sessions
GET    /api/v1/auth/sessions/:id
POST   /api/v1/auth/sessions/:id/revoke
POST   /api/v1/auth/sessions/revoke-all
```

Authentication must securely manage:

```text
Access Token
Refresh Token
Session
Device
IP
Login timestamp
Last activity
Logout timestamp
Expiration
Revocation
```

---

# 8. Login Flow

```text
Mobile App
   ↓
POST /auth/login
   ↓
Validate credentials
   ↓
Check account status
   ↓
Check lockout
   ↓
Check login/security policies
   ↓
Authenticate user
   ↓
Create session
   ↓
Create/update device record
   ↓
Record login attempt
   ↓
Record security event
   ↓
Issue access + refresh token
```

Failed logins must also be recorded.

Never return sensitive authentication details in errors.

---

# 9. Login Attempt APIs

```text
GET /api/v1/security/login-attempts
GET /api/v1/security/login-attempts/:id
```

Filters:

```text
userId
employeeId
username
ip
deviceId
success
from
to
failureReason
```

Recommended fields:

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

Use these records for:

- brute-force detection
- security reports
- account lockout decisions
- suspicious activity detection

---

# 10. Session APIs

```text
GET    /api/v1/security/sessions
GET    /api/v1/security/sessions/:id

POST   /api/v1/security/sessions/:id/revoke
POST   /api/v1/security/users/:userId/revoke-all-sessions
```

Filters:

```text
userId
employeeId
status
device
ip
from
to
```

Session fields:

```text
id
user_id
device_id
ip_address
user_agent
created_at
last_activity_at
expires_at
revoked_at
logout_at
```

Statuses:

```text
ACTIVE
EXPIRED
REVOKED
LOGGED_OUT
```

---

# 11. Device APIs

```text
GET    /api/v1/security/devices
GET    /api/v1/security/devices/:id

GET    /api/v1/security/users/:userId/devices

POST   /api/v1/security/devices/register
POST   /api/v1/security/devices/:id/block
POST   /api/v1/security/devices/:id/unblock
DELETE /api/v1/security/devices/:id
```

Track:

```text
device_id
user_id
platform
device_model
os_version
app_version
push_token
first_seen_at
last_seen_at
last_ip
status
```

Do not expose another user's private device information.

---

# 12. IP Security APIs

```text
GET    /api/v1/security/ip-addresses
GET    /api/v1/security/ip-addresses/:ip

GET    /api/v1/security/blocked-ips

POST   /api/v1/security/blocked-ips
PATCH  /api/v1/security/blocked-ips/:id
DELETE /api/v1/security/blocked-ips/:id

POST   /api/v1/security/ip/block
POST   /api/v1/security/ip/unblock
```

Blocked IP fields:

```text
id
ip_address
reason
blocked_by
blocked_at
expires_at
is_permanent
status
```

Never represent IP geolocation as exact physical location.

---

# 13. User Blocking APIs

```text
GET    /api/v1/security/blocked-users

POST   /api/v1/security/users/:id/block
POST   /api/v1/security/users/:id/unblock

GET    /api/v1/security/users/:id/block-history
```

Block information:

```text
user
reason
blocked_by
blocked_at
expires_at
permanent
status
```

Support:

```text
temporary block
permanent block
automatic lockout
manual administrative block
```

---

# 14. Security Events

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
SESSION_EXPIRED

PASSWORD_CHANGED
PASSWORD_RESET

OTP_REQUESTED
OTP_FAILED

ACCOUNT_BLOCKED
ACCOUNT_UNBLOCKED

IP_BLOCKED
IP_UNBLOCKED

DEVICE_REGISTERED
DEVICE_BLOCKED
DEVICE_UNBLOCKED

ROLE_CHANGED
PERMISSION_CHANGED

SUSPICIOUS_LOGIN
```

Recommended fields:

```text
id
user_id
event_type
severity
ip_address
device_id
session_id
metadata
created_at
```

---

# 15. Security Dashboard

```text
GET /api/v1/security/dashboard
```

Return:

```text
active_users
active_sessions
today_logins
failed_logins
blocked_users
blocked_ips
blocked_devices
suspicious_logins
recent_security_events
```

Authorized Director/Admin users can see:

```text
Who is logged in
When they logged in
Last activity
IP
Device
App version
Session duration
```

---

# 16. Login History

```text
GET /api/v1/security/login-history
GET /api/v1/security/login-history/:id
```

Fields:

```text
employee
employee_code
login_time
logout_time
session_duration
ip
device
os
app_version
browser/user_agent
status
```

Filters:

```text
employeeId
departmentId
locationId
ip
device
status
from
to
```

---

# 17. Login Timing Reports

```text
GET /api/v1/security/reports/login-summary
GET /api/v1/security/reports/session-summary
```

Example fields:

```text
Employee
First Login
Last Login
Total Sessions
Successful Logins
Failed Logins
Total Session Time
Unique IPs
Unique Devices
```

Large reports should be generated asynchronously.

---

# 18. Employee Security Overview

```text
GET /api/v1/security/users/:userId/overview
```

Return:

```text
last_login
last_logout
current_session
active_sessions
total_sessions
known_ips
known_devices
failed_logins
security_events
account_status
password_changed_at
```

Only authorized staff may access another user's security information.

---

# 19. Roles CRUD

```text
GET    /api/v1/roles
GET    /api/v1/roles/:id

POST   /api/v1/roles
PATCH  /api/v1/roles/:id
DELETE /api/v1/roles/:id
```

Role fields:

```text
id
code
name
description
is_system_role
is_active
created_at
updated_at
```

Initial roles:

```text
DIRECTOR
ADMIN
HR
HOD
SUB_HOD
EMPLOYEE
```

Do not blindly delete system roles. Prefer deactivation where appropriate.

---

# 20. Permissions CRUD

```text
GET    /api/v1/permissions
GET    /api/v1/permissions/:id

POST   /api/v1/permissions
PATCH  /api/v1/permissions/:id
DELETE /api/v1/permissions/:id
```

Permission naming:

```text
module.resource.action
```

Examples:

```text
employees.view
employees.create
employees.update
employees.delete

leave.view
leave.apply
leave.approve
leave.reject

security.dashboard.view
security.sessions.view
security.sessions.revoke
security.ip.block
security.users.block
```

---

# 21. Role-Permission Mapping APIs

```text
GET    /api/v1/roles/:roleId/permissions
PUT    /api/v1/roles/:roleId/permissions

POST   /api/v1/roles/:roleId/permissions/:permissionId
DELETE /api/v1/roles/:roleId/permissions/:permissionId
```

Every role-permission change must be audited.

---

# 22. User-Role APIs

```text
GET    /api/v1/users/:userId/roles
PUT    /api/v1/users/:userId/roles

POST   /api/v1/users/:userId/roles/:roleId
DELETE /api/v1/users/:userId/roles/:roleId
```

Role changes must:

```text
validate authorization
record old role
record new role
record actor
record timestamp
create security event
create audit event
```

For high-risk permission changes, consider requiring elevated approval.

---

# 23. User Permission APIs

```text
GET /api/v1/users/:userId/permissions
```

Optional user-specific overrides:

```text
POST   /api/v1/users/:userId/permissions
PATCH  /api/v1/users/:userId/permissions/:id
DELETE /api/v1/users/:userId/permissions/:id
```

Do not build individual permission overrides unless there is a real business requirement.

Prefer:

```text
Role → Permission
```

with minimal exceptions.

---

# 24. Authorization Service

Internal service example:

```typescript
authorizationService.can(
  user,
  permission,
  resource,
)
```

Authorization pipeline:

```text
Authenticated?
      ↓
Identity
      ↓
Role
      ↓
Permission
      ↓
Company
      ↓
Plant
      ↓
Division
      ↓
Department
      ↓
Section
      ↓
Resource Relationship
      ↓
Workflow State
      ↓
ALLOW / DENY
```

Use centralized guards and policies.

---

# 25. Authorization Policies

Create reusable policies:

```text
EmployeePolicy
LeavePolicy
TaskPolicy
KraPolicy
KaizenPolicy
SopPolicy
ComplaintPolicy
ChatPolicy
SecurityPolicy
PrivacyPolicy
```

Example:

```text
HOD
+
leave.approve
+
employee.department_id == HOD.department_id
+
leave.status == PENDING
=
ALLOW
```

---

# 26. Organization Scope

Supported scopes:

```text
SELF
TEAM
SECTION
DEPARTMENT
DIVISION
PLANT
COMPANY
ORG
```

Example:

```text
Permission = leave.approve
Scope      = DEPARTMENT
```

An HOD with this permission should only approve within the HOD's authorized department.

---

# 27. Director Authorization Model

Director is a high-level business role.

Typical capabilities:

```text
Organization-wide dashboards
Organization visibility
Employee visibility
Performance
KRA
Kaizen
SOP
Complaints where authorized
Training
Reports
Analytics
Security monitoring
Audit
```

Do not automatically grant every technical/database operation to a Director.

Use explicit permissions.

---

# 28. Admin Authorization Model

Admin controls the platform.

Typical capabilities:

```text
Users
Employees
Organization
Roles
Permissions
Settings
Feature Flags
Security
Sessions
Devices
IP controls
Audit
Imports
Exports
System operations
```

Admin is not automatically a business approver unless assigned the permission.

---

# 29. HR Authorization Model

Typical HR capabilities:

```text
Employees
Attendance
Leave
Documents
Employee lifecycle
Training
KRA
HR reports
Notifications
```

HR should not automatically receive:

```text
technical system administration
role administration
database administration
security administration
```

unless explicitly assigned.

---

# 30. HOD Authorization Model

Normal HOD scope:

```text
Own department
Own sections
Own subordinate employees
```

Typical modules:

```text
Department Dashboard
Employees
Attendance
Leave approvals
Tasks
KRA
Kaizen
SOP
Notices
Complaints
Training
Reports
Chat
```

---

# 31. Sub-HOD Authorization Model

Normal scope:

```text
Assigned section/team
```

Typical modules:

```text
Team Dashboard
Team Attendance
Leave workflow where configured
Tasks
KRA preliminary review
Kaizen recommendation
Team reports
Chat
```

Sub-HOD authority must be configurable by department/policy.

---

# 32. Employee Authorization Model

Normal scope:

```text
SELF
```

Typical modules:

```text
Own Profile
Own Attendance
Own Leave
Own Tasks
Own KRA
Own Kaizen
Authorized SOP information
Own Training
Own Complaints
Notices
Chat
Notifications
```

Employees must not access another employee's protected record by changing the ID in an API URL.

---

# 33. Master Access Matrix

Legend:

```text
ORG       = organization-wide
DEPT      = department scope
TEAM      = team/section scope
SELF      = own records
VIEW      = read-only
FULL      = create/update/action within scope
APPROVE   = approval authority
ADMIN     = administrative control
NO        = no access by default
POLICY    = configurable
```

| Module | DIRECTOR | ADMIN | HR | HOD | SUB_HOD | EMPLOYEE |
|---|---|---|---|---|---|---|
| Dashboard | ORG | ORG | HR/ORG | DEPT | TEAM | SELF |
| Employees | ORG | ORG | ORG | DEPT | TEAM | SELF |
| Organization | VIEW/FULL | FULL | VIEW/FULL | VIEW | VIEW | LIMITED |
| Departments | VIEW/FULL | FULL | FULL | DEPT | VIEW | LIMITED |
| Sections | VIEW | FULL | FULL | DEPT | TEAM | LIMITED |
| Designations | VIEW | FULL | FULL | VIEW | VIEW | SELF |
| Users | VIEW | FULL | HR | TEAM | TEAM | SELF |
| Roles | VIEW | FULL | ASSIGNED | NO | NO | NO |
| Permissions | VIEW | FULL | ASSIGNED | NO | NO | NO |
| Attendance | ORG | ORG | ORG | DEPT | TEAM | SELF |
| Shifts | VIEW | FULL | FULL | DEPT | TEAM | SELF |
| Holidays | VIEW | FULL | FULL | VIEW | VIEW | VIEW |
| Leave | ORG | ORG | ORG | DEPT | TEAM | SELF |
| Documents | ORG | ORG | ORG | LIMITED | TEAM LIMITED | SELF |
| Employee Lifecycle | ORG | ORG | FULL | REQUEST/VIEW | REQUEST | SELF LIMITED |
| Tasks | ORG | ORG | HR | DEPT | TEAM | OWN/ASSIGNED |
| KRA | ORG | ORG | ORG | DEPT | TEAM | SELF |
| Kaizen | ORG | ORG | HR/POLICY | DEPT | TEAM | SELF |
| SOP | ORG | ORG | HR/POLICY | DEPT | TEAM | VIEW |
| Notices | ORG | ORG | ORG | DEPT | TEAM | ORG |
| Complaints | AUTHORIZED | FULL | FULL | DEPT/ASSIGNED | TEAM/ASSIGNED | SELF |
| Training | ORG | ORG | FULL | DEPT | TEAM | SELF |
| Chat | POLICY | POLICY | POLICY | DEPT/GROUP | TEAM/GROUP | MEMBERSHIP |
| Calls | POLICY | POLICY | POLICY | POLICY | POLICY | AUTHORIZED |
| Reports | ORG | ORG | ORG | DEPT | TEAM | SELF |
| Analytics | ORG | ORG | ORG | DEPT | TEAM | LIMITED |
| Imports | AUTHORIZED | FULL | FULL | REQUEST | REQUEST | NO |
| Exports | AUTHORIZED | FULL | FULL | DEPT | TEAM | OWN |
| Settings | VIEW | FULL | HR settings | NO | NO | NO |
| Feature Flags | VIEW | FULL | NO | NO | NO | NO |
| Security | POLICY | FULL | LIMITED | NO | NO | NO |
| Audit | POLICY | FULL | AUTHORIZED | LIMITED | LIMITED | OWN |
| System Operations | NO | FULL | NO | NO | NO | NO |

This matrix is the initial model. Final access comes from permissions plus scope and policies.

---

# 34. Privacy Module

Recommended structure:

```text
privacy/
├── privacy.module.ts
├── privacy.controller.ts
├── privacy.service.ts
├── policy/
├── consent/
├── data-requests/
├── deletion/
├── export/
├── retention/
└── dto/
```

---

# 35. Privacy Policy CRUD

```text
GET    /api/v1/privacy/policies
GET    /api/v1/privacy/policies/:id

POST   /api/v1/privacy/policies
PATCH  /api/v1/privacy/policies/:id
DELETE /api/v1/privacy/policies/:id

POST   /api/v1/privacy/policies/:id/publish
POST   /api/v1/privacy/policies/:id/archive
```

Policy types:

```text
PRIVACY_POLICY
TERMS_OF_USE
COOKIE_POLICY
DATA_RETENTION_POLICY
SECURITY_POLICY
```

Never overwrite a published policy version that users have accepted.

---

# 36. Policy Versioning

Fields:

```text
id
policy_type
version
title
content
status
effective_at
published_at
created_by
created_at
updated_at
```

Statuses:

```text
DRAFT
PUBLISHED
ARCHIVED
```

---

# 37. Consent / Policy Acceptance

```text
GET  /api/v1/privacy/consents
GET  /api/v1/privacy/consents/history
POST /api/v1/privacy/consents
```

Record:

```text
user_id
policy_id
policy_version
status
accepted_at
ip_address
user_agent
device_id
```

Possible statuses:

```text
ACCEPTED
DECLINED
REVOKED
REQUIRED_REACCEPTANCE
```

The system must know exactly which policy version was accepted.

---

# 38. Privacy Settings

```text
GET   /api/v1/privacy/settings
PATCH /api/v1/privacy/settings
```

Possible optional settings:

```text
push notifications
email notifications
optional analytics
optional personalization
```

Do not represent mandatory business processing as optional consent.

---

# 39. My Data

```text
GET /api/v1/privacy/my-data
```

Possible categories:

```text
account
profile
employment
attendance
leave
tasks
KRA
Kaizen
SOP
training
complaints
notifications
devices
sessions
files
chat
```

Only return data that the authenticated user is entitled to receive.

---

# 40. Data Export

```text
POST /api/v1/privacy/data-export
GET  /api/v1/privacy/data-export
GET  /api/v1/privacy/data-export/:id
GET  /api/v1/privacy/data-export/:id/download
```

Use background processing:

```text
Request
 ↓
BullMQ
 ↓
Worker
 ↓
Collect authorized data
 ↓
Generate export
 ↓
Secure storage
 ↓
Short-lived download URL
```

Audit:

```text
REQUESTED
GENERATED
DOWNLOADED
EXPIRED
```

Exports contain personal data and must be protected.

---

# 41. Correction Requests

```text
GET    /api/v1/privacy/correction-requests
GET    /api/v1/privacy/correction-requests/:id

POST   /api/v1/privacy/correction-requests
PATCH  /api/v1/privacy/correction-requests/:id

POST   /api/v1/privacy/correction-requests/:id/approve
POST   /api/v1/privacy/correction-requests/:id/reject
POST   /api/v1/privacy/correction-requests/:id/complete
```

Possible fields:

```text
field
requested_correction
reason
submitted_by
reviewed_by
status
timestamps
```

Avoid exposing sensitive previous values unnecessarily.

---

# 42. Account Deletion

In-app path:

```text
Settings
  ↓
Privacy & Security
  ↓
Delete Account
```

APIs:

```text
POST /api/v1/privacy/account-deletion/request
GET  /api/v1/privacy/account-deletion/status
POST /api/v1/privacy/account-deletion/cancel
POST /api/v1/privacy/account-deletion/confirm
```

Suggested states:

```text
ACTIVE
DELETION_REQUESTED
VERIFICATION_REQUIRED
VERIFIED
SCHEDULED
PROCESSING
COMPLETED
CANCELLED
REJECTED
```

---

# 43. External Account Deletion

A public HTTPS page is required for the account-deletion process:

```text
https://sarthi.srjsteel.in/account-deletion
```

The external process must be usable without the mobile app.

Recommended:

```text
Open account-deletion page
        ↓
Enter registered identifier
        ↓
Verify identity
        ↓
Submit request
        ↓
Confirmation/status
```

Do not delete an account based only on an unverified identifier.

---

# 44. Data Deletion Rules

Deletion must distinguish:

```text
Delete
Retain temporarily
Retain for legal/business requirement
Anonymize
Aggregate
Retain limited audit/security evidence where justified
```

Do not blindly cascade-delete every record connected to an employee.

Potential related categories:

```text
user
sessions
devices
push tokens
profile
documents
notifications
preferences
tasks
leave
attendance
KRA
Kaizen
SOP
training
complaints
chat
chat attachments
files
consents
audit/security events
```

The actual behavior must follow the organization's approved retention policy.

---

# 45. Chat Privacy During Deletion

Deleting an account must not automatically corrupt other users' chat histories.

Possible approach:

```text
User identity
   ↓
Anonymization / de-identification
   +
Policy-based message retention
```

or deletion where policy permits.

Document actual behavior accurately.

---

# 46. Retention Policy CRUD

```text
GET    /api/v1/privacy/retention-policies
GET    /api/v1/privacy/retention-policies/:id

POST   /api/v1/privacy/retention-policies
PATCH  /api/v1/privacy/retention-policies/:id
DELETE /api/v1/privacy/retention-policies/:id
```

Fields:

```text
data_category
retention_period
retention_basis
deletion_behavior
anonymization_behavior
active
```

Do not allow ordinary employees to manage retention policy.

---

# 47. Privacy Request CRUD

```text
GET    /api/v1/privacy/requests
GET    /api/v1/privacy/requests/:id

POST   /api/v1/privacy/requests
PATCH  /api/v1/privacy/requests/:id

POST   /api/v1/privacy/requests/:id/approve
POST   /api/v1/privacy/requests/:id/reject
POST   /api/v1/privacy/requests/:id/complete
```

Request types:

```text
ACCESS
EXPORT
CORRECTION
DELETION
PRIVACY_QUESTION
```

---

# 48. Privacy Dashboard

```text
GET /api/v1/privacy/dashboard
```

Authorized staff can see:

```text
open privacy requests
pending deletion requests
pending data exports
correction requests
policy versions
policy acknowledgements
retention jobs
failed privacy jobs
```

---

# 49. Public Policy Endpoints

These should not require authentication:

```text
GET /privacy-policy
GET /terms
GET /account-deletion
GET /data-deletion
GET /data-request
GET /contact/privacy
```

All should be HTTPS production pages.

---

# 50. Privacy Audit Events

```text
POLICY_CREATED
POLICY_PUBLISHED
POLICY_UPDATED
POLICY_ARCHIVED

CONSENT_ACCEPTED
CONSENT_REVOKED

DATA_EXPORT_REQUESTED
DATA_EXPORT_GENERATED
DATA_EXPORT_DOWNLOADED

CORRECTION_REQUESTED
CORRECTION_APPROVED
CORRECTION_REJECTED

ACCOUNT_DELETION_REQUESTED
ACCOUNT_DELETION_VERIFIED
ACCOUNT_DELETION_COMPLETED
ACCOUNT_DELETION_CANCELLED

RETENTION_POLICY_CHANGED
```

Never put the contents of a user's private export into an audit log.

---

# 51. Privacy Permissions

Recommended permissions:

```text
privacy.policy.view
privacy.policy.manage

privacy.consent.view
privacy.consent.manage

privacy.data.view_self
privacy.data.export_self
privacy.correction.request

privacy.deletion.request
privacy.deletion.cancel
privacy.deletion.manage

privacy.requests.view
privacy.requests.manage

privacy.retention.view
privacy.retention.manage

privacy.dashboard.view
privacy.audit.view
```

Employee defaults should include:

```text
privacy.policy.view
privacy.consent.view
privacy.data.view_self
privacy.data.export_self
privacy.correction.request
privacy.deletion.request
privacy.deletion.cancel
```

Management permissions are assigned separately.

---

# 52. Required Database Models

At minimum:

```text
User
Role
Permission
UserRole
RolePermission
UserPermissionOverride       # only when justified

UserSession
UserDevice
LoginAttempt
SecurityEvent
BlockedIp
BlockedUser
AuditLog

PrivacyPolicy
PrivacyConsent
PrivacyRequest
DataExportJob
DataCorrectionRequest
AccountDeletionRequest
RetentionPolicy
```

---

# 53. Role Change Security

Changing roles or permissions is high risk.

Every such action must:

1. require authorization
2. identify actor
3. identify target
4. record old value
5. record new value
6. record timestamp
7. record reason where required
8. create security event
9. create audit event
10. re-evaluate active sessions as appropriate

---

# 54. Session Security

When an account is:

```text
blocked
critical permissions are revoked
critical role changes occur
security incident is triggered
```

active sessions should be invalidated according to security policy.

---

# 55. Chat Authorization

Chat is authorized using:

```text
conversation membership
+
chat permission
+
resource policy
```

Important:

Admin/Director do NOT automatically gain access to every private conversation.

Private conversation access requires explicit policy and permission.

---

# 56. Complaint Confidentiality

Complaints can be sensitive.

Authorization must consider:

```text
complaint owner
assigned investigator
HR authority
management authority
organization scope
complaint confidentiality
```

Do not implement complaint access using role alone.

---

# 57. Mobile Navigation by Role

Do not create six separate mobile applications.

Use one application with:

```text
Shared UI
+
Permission-aware navigation
+
Permission-aware actions
+
Organization-aware data
+
Role-aware dashboards
```

Suggested modules:

## Employee

```text
Home
Tasks
Leave
Attendance
KRA
Kaizen
Training
Notices
Chat
Notifications
Profile
Privacy & Security
```

## Sub-HOD

```text
Team Dashboard
Team
Attendance
Leave
Tasks
KRA
Kaizen
Chat
Reports
Notifications
Profile
Privacy & Security
```

## HOD

```text
HOD Dashboard
Department
Employees
Attendance
Leave
Tasks
KRA
Kaizen
SOP
Notices
Complaints
Training
Reports
Chat
Profile
Privacy & Security
```

## HR

```text
HR Dashboard
Employees
Attendance
Leave
Documents
Employee Lifecycle
Training
KRA
Reports
Notifications
Profile
Privacy & Security
```

## Director

```text
Executive Dashboard
Organization
Employees
Performance
KRA
Kaizen
SOP
Complaints
Training
Reports
Analytics
Security
Audit
Notifications
Profile
Privacy & Security
```

## Admin

```text
Admin Dashboard
Users
Employees
Organization
Roles
Permissions
Settings
Feature Flags
Security
Audit
Imports
Exports
System
Notifications
Profile
Privacy & Security
```

Frontend visibility is convenience only. Backend remains the source of truth.

---

# 58. Security Dashboard by Role

## Director

Potentially:

```text
Security overview
Login history
Session visibility
Suspicious logins
Security reports
Organization-level security analytics
```

Only explicit permissions should grant sensitive controls.

## Admin

Potentially:

```text
All operational security controls
Session revocation
Device controls
IP controls
User blocking
Security events
Audit
Security reports
```

## HR

Potentially limited:

```text
Authorized employee login/security information
```

No technical security administration by default.

---

# 59. Authentication / Authorization Middleware

Request processing order:

```text
Request
   ↓
Request ID
   ↓
Authentication Guard
   ↓
Identity
   ↓
Role / Permission Guard
   ↓
Organization Scope Guard
   ↓
Resource Policy
   ↓
Workflow Policy
   ↓
Controller
   ↓
Service
```

Never rely only on frontend checks.

---

# 60. Security Rules

Never:

```typescript
if (user.role === "ADMIN") {
  allow();
}
```

as the complete authorization architecture.

Never:

- trust client-supplied role
- trust client-supplied user ID for access
- expose another user's private session data
- log passwords
- log OTPs
- log raw refresh tokens
- expose SQL errors
- allow unrestricted file access
- allow unrestricted private chat access

---

# 61. Privacy and Play Store

The application must include:

```text
In-app Privacy Policy
Public Privacy Policy
Terms
In-app Account Deletion
External Account Deletion
Data Export
Correction Request
Consent History
Policy Versioning
Retention Model
Deletion Workflow
Privacy Requests
Privacy Audit
```

The final Play Store submission must be reviewed against the actual implementation and current Google Play requirements.

The Data Safety declaration must accurately match actual data handling, including applicable third-party SDK/service behavior.

Do not claim legal compliance merely because these APIs exist.

---

# 62. Privacy and Third-Party Services

Maintain a data inventory for services such as:

```text
Firebase / FCM
Nodemailer + SMTP provider
Socket.IO
Expo modules
WebRTC
S3/MinIO
Redis
Error monitoring, if added
Analytics, if added
```

For each service document:

```text
provider
purpose
data processed
destination
retention
security
required/optional
privacy-policy disclosure
Play Data Safety impact
```

The actual inventory must be verified against production SDK behavior.

---

# 63. Android / Privacy Permissions

Request only permissions actually required.

Potential examples:

```text
Camera       → video calls
Microphone   → audio/video calls
Notifications → push notifications
Files/Media  → file upload where required
```

Do not request:

```text
Location
Contacts
SMS
Call logs
Phone state
```

unless a real feature requires them.

Any new sensitive permission requires privacy and Play Store review.

---

# 64. Privacy UI

Add:

```text
Settings
  ↓
Privacy & Security
  ├── Privacy Policy
  ├── Terms of Use
  ├── My Data
  ├── Download My Data
  ├── Request Correction
  ├── Delete Account
  ├── Consent History
  ├── Security Information
  └── Privacy Contact
```

Policy links should use authoritative HTTPS public URLs.

---

# 65. Account Deletion UX

Recommended:

```text
Delete Account
       ↓
Explain consequences
       ↓
Show data categories affected
       ↓
Show retention exceptions where applicable
       ↓
Verify identity
       ↓
Confirm deletion
       ↓
Create request
       ↓
Show status
```

Do not create a fake deletion button that only disables the account.

---

# 66. Data Export Security

Exports contain personal information.

Therefore:

- require authentication
- verify identity
- generate asynchronously
- use short-lived download URLs
- secure object storage
- expire downloads
- audit access
- never log exported contents

---

# 67. Deletion Worker

Use BullMQ/Redis for large deletion workflows.

```text
Deletion Request
       ↓
Verification
       ↓
Queue
       ↓
Deletion Worker
       ├── sessions
       ├── devices
       ├── tokens
       ├── preferences
       ├── personal files
       ├── personal profile data
       └── policy-based records
       ↓
Retention / Anonymization
       ↓
Audit Completion
```

Deletion jobs must be idempotent.

If a worker crashes and runs again, the operation must remain safe.

---

# 68. Phase 2 Implementation Order

Implement in this sequence:

## 2.1 Authentication

```text
login
logout
refresh
password
OTP
sessions
devices
```

## 2.2 Authorization

```text
roles
permissions
role-permission mapping
user-role mapping
scope evaluation
permission guard
role guard
resource policies
```

## 2.3 Security

```text
login attempts
security events
session logging
IP tracking
device tracking
blocking
audit
```

## 2.4 Organization-aware authorization

```text
company
plant
division
department
section
manager
HOD
Sub-HOD relationships
```

## 2.5 Privacy foundation

```text
privacy policy
policy versions
consents
privacy permissions
account deletion model
data request model
```

## 2.6 Automated tests

Test:

```text
DIRECTOR
ADMIN
HR
HOD
SUB_HOD
EMPLOYEE
```

For representative endpoints test:

```text
ALLOWED
DENIED
OUT-OF-SCOPE
INVALID WORKFLOW STATE
```

---

# 69. Phase 2 Completion Criteria

Authentication/Authorization/Security/Privacy foundation is complete only when:

```text
[ ] Login
[ ] Logout
[ ] Refresh token
[ ] Password reset
[ ] OTP
[ ] Sessions
[ ] Device registration
[ ] Login attempts
[ ] Security events

[ ] Roles CRUD
[ ] Permissions CRUD
[ ] Role-permission mapping
[ ] User-role mapping
[ ] Permission guard
[ ] Role guard
[ ] Organization scope
[ ] Resource policies

[ ] User blocking
[ ] IP blocking
[ ] Device blocking
[ ] Session revocation
[ ] Security dashboard
[ ] Login history
[ ] Login reports
[ ] Audit logging

[ ] Privacy Policy CRUD
[ ] Policy versioning
[ ] Consent history
[ ] Privacy settings
[ ] My Data
[ ] Data export
[ ] Correction requests
[ ] Account deletion
[ ] External deletion page
[ ] Privacy requests
[ ] Retention policies
[ ] Privacy dashboard
```

---

# 70. Final Authorization Architecture

```text
                    USER
                      │
                      ▼
              AUTHENTICATION
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
       SESSION                  DEVICE
          │                       │
          └───────────┬───────────┘
                      ▼
                AUTHORIZATION
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
        ROLE      PERMISSION    SCOPE
          │           │           │
          └───────────┼───────────┘
                      ▼
                RESOURCE POLICY
                      │
                      ▼
                WORKFLOW POLICY
                      │
                 ALLOW / DENY
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
       SECURITY                  AUDIT
          │
          ▼
       PRIVACY
          │
   ┌──────┼───────────┐
   ▼      ▼           ▼
Policy  Data Rights  Deletion
```

---

# 71. Claude Directive

Implement this specification as a reusable platform foundation.

Do not create independent authorization logic in each module.

Do not build individual HRMS modules using assumptions about roles.

Every future module must integrate with:

```text
Authentication
Authorization
Organization Scope
Resource Policies
Workflow Policies
Security Audit
Privacy where applicable
```

The final security decision must always be made server-side.

Build the authorization system once and reuse it across the entire Sarthi HRMS.
