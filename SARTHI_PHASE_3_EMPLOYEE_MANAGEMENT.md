# SRJ Sarthi HRMS — Phase 3
# Employee Management, Organization, Documents, Import & Admin Configuration

## 1. Phase Objective

Phase 3 is the **Employee Management and Organization foundation**.

This phase creates the core employee and organizational data layer that later modules depend on:

```text
Employee Management
        ↓
Organization Structure
        ↓
Reporting Hierarchy
        ↓
User ↔ Employee Binding
        ↓
Documents
        ↓
Access / Role Assignment
        ↓
Leave / Attendance / Tasks / KRA / Kaizen / SOP / Reports
```

The phase must be implemented as a **production-grade, configuration-driven module**.

The goal is not just Employee CRUD.

The goal is to make employee and organizational configuration manageable from the **Admin application without repeatedly changing source code**.

---

# 2. Technology Context

The project is:

```text
React Native + TypeScript
Node.js + NestJS + TypeScript
PostgreSQL
Prisma
Redis
BullMQ
Docker
S3-compatible storage / MinIO
Socket.IO
Firebase
Nodemailer
```

Phase 1 foundation is complete.

Phase 2 establishes Authentication, Authorization, Security and Privacy architecture.

Phase 3 must integrate with those foundations.

---

# 3. Critical Principle — Configuration Driven

The application must be **configuration-driven** wherever business behavior is expected to change.

Admin should NOT need a developer or code deployment for normal configuration changes.

Examples:

```text
Add department
Add section
Add designation
Add job grade
Add employee status
Add employment type
Add employment category
Add document category
Make document mandatory
Add custom employee field
Change HOD
Change Sub-HOD
Change reporting manager
Assign employee to department
Assign employee to section
Assign employee to designation
Assign employee to job grade
Assign role
Change permission
Change organization scope
Create permission group
Enable/disable feature
Configure Excel import mapping
```

These should be managed from the Admin UI and persisted in PostgreSQL.

Only genuinely new capabilities should require source-code changes.

---

# 4. Phase 3 Scope

Phase 3 includes:

1. Employee CRUD
2. Employee lifecycle
3. Companies
4. Plants / Locations
5. Divisions
6. Departments
7. Sections
8. Designations
9. Job Grades
10. Employment Types
11. Employment Categories
12. Employee Statuses
13. Reporting hierarchy
14. Org tree
15. User ↔ Employee binding
16. Employee documents
17. Document categories
18. Document requirements
19. Employee search
20. Employee filters
21. Pagination
22. Employee export
23. Excel employee import
24. Import mappings
25. Import templates
26. Import preview
27. Import validation
28. Duplicate handling
29. Import confirmation/cancel
30. Bulk employee operations
31. Employee custom fields
32. Admin role/access assignment
33. Permission groups
34. Organization scope configuration
35. Effective access viewer
36. Audit of employee/configuration changes

---

# 5. Explicitly NOT in Phase 3

Do NOT implement these as employee-management logic:

```text
Leave balances
Attendance records
Salary / payroll
KRA scores
Performance calculations
Task workflow
Kaizen workflow
SOP workflow
Complaint workflow
Training workflow
```

Those modules will use Phase 3 employee/organization data later.

Phase 3 may create required reference/configuration structures, but must not duplicate downstream business logic.

---

# 6. Employee Entity

Employee is a core business entity.

Recommended conceptual fields:

```text
id
employee_code

first_name
last_name
display_name

date_of_birth
date_of_joining
date_of_exit

gender
marital_status

official_email
personal_email
mobile

profile_picture_file_id

company_id
location_id
division_id
department_id
section_id

designation_id
job_grade_id

employment_type_id
employment_category_id
employee_status_id

manager_id
hod_id
sub_hod_id

created_at
updated_at
deleted_at
```

Sensitive fields must receive appropriate authorization.

---

# 7. Employee CRUD APIs

```text
GET    /api/v1/employees
GET    /api/v1/employees/:id

POST   /api/v1/employees
PATCH  /api/v1/employees/:id

DELETE /api/v1/employees/:id
POST   /api/v1/employees/:id/restore
```

Deletion must normally be **soft deletion**.

Do not physically delete employee history unless an approved deletion/retention process requires it.

---

# 8. Employee Status

Do not use only `active` / `deleted`.

Support configurable lifecycle statuses.

Initial examples:

```text
DRAFT
ACTIVE
ON_NOTICE
SUSPENDED
ON_LEAVE
TRANSFERRED
RESIGNED
TERMINATED
EXITED
INACTIVE
```

These are examples and should be represented as configurable master data where practical.

APIs:

```text
GET    /api/v1/employee-statuses
GET    /api/v1/employee-statuses/:id

POST   /api/v1/employee-statuses
PATCH  /api/v1/employee-statuses/:id
DELETE /api/v1/employee-statuses/:id
```

System-critical statuses must not be casually deleted.

---

# 9. Employee Lifecycle Actions

Use explicit lifecycle actions instead of silently changing status.

```text
POST /api/v1/employees/:id/activate
POST /api/v1/employees/:id/suspend
POST /api/v1/employees/:id/transfer
POST /api/v1/employees/:id/promote
POST /api/v1/employees/:id/resign
POST /api/v1/employees/:id/terminate
POST /api/v1/employees/:id/exit
```

Every important lifecycle change must:

```text
validate permission
validate state transition
record actor
record timestamp
record previous state
record new state
write audit event
```

---

# 10. Organization Hierarchy

Canonical hierarchy:

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

The design must support future multi-company and multi-plant usage.

---

# 11. Company CRUD

```text
GET    /api/v1/companies
GET    /api/v1/companies/:id

POST   /api/v1/companies
PATCH  /api/v1/companies/:id
DELETE /api/v1/companies/:id

POST   /api/v1/companies/:id/activate
POST   /api/v1/companies/:id/deactivate
```

Suggested fields:

```text
id
code
name
legal_name
description
status
created_at
updated_at
```

---

# 12. Location / Plant CRUD

```text
GET    /api/v1/locations
GET    /api/v1/locations/:id

POST   /api/v1/locations
PATCH  /api/v1/locations/:id
DELETE /api/v1/locations/:id

POST   /api/v1/locations/:id/activate
POST   /api/v1/locations/:id/deactivate
```

Fields may include:

```text
company_id
code
name
address
city
state
country
status
```

---

# 13. Division CRUD

```text
GET    /api/v1/divisions
GET    /api/v1/divisions/:id

POST   /api/v1/divisions
PATCH  /api/v1/divisions/:id
DELETE /api/v1/divisions/:id
```

Support company/location association.

---

# 14. Department CRUD

```text
GET    /api/v1/departments
GET    /api/v1/departments/:id

POST   /api/v1/departments
PATCH  /api/v1/departments/:id
DELETE /api/v1/departments/:id

POST   /api/v1/departments/:id/activate
POST   /api/v1/departments/:id/deactivate
```

Admin-configurable fields:

```text
Department Code
Department Name
Company
Plant
Division
Parent Department, where required
HOD
Status
Display Order
```

Do not hard-code department names.

---

# 15. Section CRUD

```text
GET    /api/v1/sections
GET    /api/v1/sections/:id

POST   /api/v1/sections
PATCH  /api/v1/sections/:id
DELETE /api/v1/sections/:id
```

Normal relationship:

```text
Department
   ↓
Section
   ↓
Sub-HOD / Team
   ↓
Employees
```

---

# 16. Designation CRUD

```text
GET    /api/v1/designations
GET    /api/v1/designations/:id

POST   /api/v1/designations
PATCH  /api/v1/designations/:id
DELETE /api/v1/designations/:id
```

Admin configuration:

```text
Designation Name
Code
Description
Level
Job Grade
Applicable Departments
Status
Display Order
```

---

# 17. Job Grade CRUD

```text
GET    /api/v1/job-grades
GET    /api/v1/job-grades/:id

POST   /api/v1/job-grades
PATCH  /api/v1/job-grades/:id
DELETE /api/v1/job-grades/:id
```

Do not hard-code values such as:

```text
G1
G2
G3
M1
M2
D1
```

These are examples only.

---

# 18. Employment Type CRUD

```text
GET    /api/v1/employment-types
GET    /api/v1/employment-types/:id

POST   /api/v1/employment-types
PATCH  /api/v1/employment-types/:id
DELETE /api/v1/employment-types/:id
```

Examples:

```text
Permanent
Contract
Trainee
Apprentice
Intern
Consultant
```

Admin controls these values.

---

# 19. Employment Category CRUD

```text
GET    /api/v1/employment-categories
GET    /api/v1/employment-categories/:id

POST   /api/v1/employment-categories
PATCH  /api/v1/employment-categories/:id
DELETE /api/v1/employment-categories/:id
```

---

# 20. Organization Assignment

Employee assignment endpoints:

```text
PATCH /api/v1/employees/:id/company
PATCH /api/v1/employees/:id/location
PATCH /api/v1/employees/:id/division
PATCH /api/v1/employees/:id/department
PATCH /api/v1/employees/:id/section
PATCH /api/v1/employees/:id/designation
PATCH /api/v1/employees/:id/job-grade
PATCH /api/v1/employees/:id/employment-type
PATCH /api/v1/employees/:id/employment-category
PATCH /api/v1/employees/:id/status
```

Every change should create a historical/audit record.

---

# 21. Reporting Hierarchy

Support:

```text
Employee → Reporting Manager
Employee → Functional Manager where needed
Employee → HOD
Employee → Sub-HOD
```

Do not assume every organization relationship is identical.

---

# 22. Reporting Hierarchy APIs

```text
GET  /api/v1/employees/:id/reporting-chain
GET  /api/v1/employees/:id/subordinates
GET  /api/v1/employees/:id/manager

POST /api/v1/employees/:id/manager
POST /api/v1/employees/:id/hod
POST /api/v1/employees/:id/sub-hod
```

Validate that relationships do not create cycles.

Example invalid:

```text
A reports to B
B reports to C
C reports to A
```

Such relationships must be rejected.

---

# 23. Org Tree API

```text
GET /api/v1/organization/tree
GET /api/v1/organization/tree?companyId=
GET /api/v1/organization/tree?locationId=
GET /api/v1/organization/tree?divisionId=
GET /api/v1/organization/tree?departmentId=
GET /api/v1/organization/tree?sectionId=
```

Example:

```text
SRJ Steel
│
├── Plant A
│   ├── Production
│   │   ├── Rolling Mill
│   │   │   ├── HOD
│   │   │   ├── Sub-HOD
│   │   │   └── Employees
│   │   └── Finishing
│   │
│   ├── Maintenance
│   └── Quality
│
└── Plant B
```

---

# 24. User ↔ Employee Binding

User account and employee master record are separate concepts.

Relationship:

```text
User
  ↕
Employee
```

APIs:

```text
GET    /api/v1/employees/:id/user
POST   /api/v1/employees/:id/user
PATCH  /api/v1/employees/:id/user
DELETE /api/v1/employees/:id/user

GET    /api/v1/users/:id/employee
```

Admin should be able to:

```text
Create Employee
Create User
Link User ↔ Employee
Unlink
Replace binding
```

The relationship should have clear uniqueness rules.

Normally:

```text
One Employee → zero/one User
One User → zero/one Employee
```

unless the business explicitly requires another model.

---

# 25. Employee Access & Roles

From the Admin Employee screen:

```text
Employee
   ↓
Access & Roles
```

Display:

```text
User Account
Account Status

Primary Role
Additional Roles

Permission Groups
Organization Scope

Effective Permissions
```

Actions:

```text
Assign Role
Remove Role
Set Primary Role
Change Scope
View Effective Access
Revoke Access
```

All changes must use Phase 2 Authorization services.

---

# 26. Employee Documents

Document metadata is stored in PostgreSQL.

Actual files are stored in:

```text
S3-compatible storage / MinIO
```

APIs:

```text
GET    /api/v1/employees/:id/documents
GET    /api/v1/employees/:id/documents/:documentId

POST   /api/v1/employees/:id/documents
PATCH  /api/v1/employees/:id/documents/:documentId
DELETE /api/v1/employees/:id/documents/:documentId
```

---

# 27. Document Metadata

Recommended:

```text
id
employee_id
category_id
filename
mime_type
size
storage_key
document_number, if applicable
issue_date, if applicable
expiry_date, if applicable
verification_status
uploaded_by
created_at
updated_at
deleted_at
```

Never expose the internal storage key directly unless appropriately protected.

---

# 28. Document Categories CRUD

```text
GET    /api/v1/document-categories
GET    /api/v1/document-categories/:id

POST   /api/v1/document-categories
PATCH  /api/v1/document-categories/:id
DELETE /api/v1/document-categories/:id
```

Examples:

```text
Aadhaar
PAN
Passport
Driving License
Offer Letter
Appointment Letter
Joining Documents
Education Certificate
Experience Letter
Bank Document
Photo
Other
```

These are configurable and must not be hard-coded.

---

# 29. Document Category Configuration

Admin can configure:

```text
Category Name
Code
Required / Optional
Who can view
Who can upload
Who can verify
Allowed file types
Maximum file size
Issue date required
Expiry date required
Verification required
Active
```

---

# 30. Employee Document Requirements

Allow administrators to define which employee categories require specific documents.

Example:

```text
Permanent Employee
    Aadhaar → Required
    PAN → Required
    Offer Letter → Required

Contract Employee
    Aadhaar → Required
    PAN → Optional
    Contract Document → Required
```

Possible API:

```text
GET  /api/v1/document-requirements
POST /api/v1/document-requirements
PATCH /api/v1/document-requirements/:id
DELETE /api/v1/document-requirements/:id
```

Requirements can be scoped to:

```text
Company
Plant
Department
Employment Type
Employment Category
Designation
```

---

# 31. Document Verification

If verification is enabled:

```text
POST /api/v1/employees/:id/documents/:documentId/verify
POST /api/v1/employees/:id/documents/:documentId/reject
```

Record:

```text
verified_by
verified_at
verification_status
verification_note
```

Statuses:

```text
PENDING
VERIFIED
REJECTED
EXPIRED
```

---

# 32. File Upload Security

For employee documents:

- validate MIME type
- validate extension
- validate file size
- generate safe storage keys
- never trust original filenames for filesystem paths
- authorize upload
- authorize download
- audit access
- use private storage
- use signed/controlled download URLs
- prepare architecture for malware/virus scanning

---

# 33. Employee Search API

Primary endpoint:

```text
GET /api/v1/employees
```

Filters:

```text
search=
employeeCode=
departmentId=
sectionId=
designationId=
jobGradeId=
companyId=
locationId=
divisionId=
managerId=
hodId=
subHodId=
status=
employmentType=
employmentCategory=
joiningFrom=
joiningTo=
```

Pagination:

```text
page=
limit=
sortBy=
sortOrder=
```

---

# 34. Advanced Search

Optional dedicated endpoint:

```text
GET /api/v1/employees/search
```

Search:

```text
name
employeeCode
email
mobile
designation
department
```

Always apply authorization and field visibility.

---

# 35. Employee List Response

Do not return every field by default.

The list API should return a lightweight projection.

Example:

```text
id
employeeCode
displayName
profilePicture
department
designation
jobGrade
status
manager
```

Sensitive information such as bank details should require specific permissions.

---

# 36. Employee Profile API

```text
GET /api/v1/employees/:id
```

The profile endpoint should return sections according to the caller's authorization.

Example sections:

```text
Basic Information
Employment
Organization
Reporting
Contact
Emergency Contact
Documents
Account
Access
```

Do not return sensitive fields to unauthorized roles.

---

# 37. Sensitive Employee Information

Potentially sensitive:

```text
date of birth
personal email
personal mobile
emergency contact
bank account
IFSC
government document information
employee documents
```

Authorization must be field-aware where practical.

Never expose these fields simply because the caller can access the employee record.

---

# 38. Emergency Contacts

Store structured emergency contact information.

Possible fields:

```text
name
relationship
phone
alternate_phone
address
priority
```

APIs:

```text
GET    /api/v1/employees/:id/emergency-contacts
POST   /api/v1/employees/:id/emergency-contacts
PATCH  /api/v1/employees/:id/emergency-contacts/:contactId
DELETE /api/v1/employees/:id/emergency-contacts/:contactId
```

Access should be restricted.

---

# 39. Bank Details

Bank details should be treated as sensitive information.

Possible fields:

```text
account_name
account_number
ifsc
bank_name
branch
```

APIs:

```text
GET /api/v1/employees/:id/bank-details
PUT /api/v1/employees/:id/bank-details
```

Access requires explicit authorization.

Do not include full bank details in generic employee list APIs.

---

# 40. Employee Custom Fields

Because HR requirements can change, create configurable employee fields.

Admin can create:

```text
Field Name
Field Code
Data Type
Required?
Visible To
Editable By
Default Value
Validation
Display Order
Active
```

Supported types:

```text
TEXT
LONG_TEXT
NUMBER
DECIMAL
DATE
BOOLEAN
SELECT
MULTI_SELECT
EMAIL
PHONE
```

---

# 41. Custom Field APIs

```text
GET    /api/v1/employee-fields
GET    /api/v1/employee-fields/:id

POST   /api/v1/employee-fields
PATCH  /api/v1/employee-fields/:id
DELETE /api/v1/employee-fields/:id

GET    /api/v1/employees/:id/custom-fields
PATCH  /api/v1/employees/:id/custom-fields
```

Do not require a code deployment for normal custom employee fields.

---

# 42. Excel Employee Import — REQUIRED

Admin must be able to import employee master data via Excel.

APIs:

```text
POST /api/v1/employees/import

GET  /api/v1/employees/import
GET  /api/v1/employees/import/:id
GET  /api/v1/employees/import/:id/preview
GET  /api/v1/employees/import/:id/errors

POST /api/v1/employees/import/:id/validate
POST /api/v1/employees/import/:id/confirm
POST /api/v1/employees/import/:id/cancel
```

---

# 43. Excel Import Workflow

```text
Upload Excel
     ↓
Create Import Job
     ↓
Select / Detect Mapping
     ↓
Parse Workbook
     ↓
Validate Rows
     ↓
Preview
     ↓
Show Errors + Warnings
     ↓
Admin Confirmation
     ↓
Background Processing
     ↓
Create / Update Employees
     ↓
Generate Result
     ↓
Audit
```

Do not immediately write all rows to production before validation and confirmation.

---

# 44. Import Required Fields

Initial required fields:

```text
employeeCode
firstName
lastName
dateOfJoining
```

Additional fields are optional unless configured otherwise.

Examples:

```text
displayName
dateOfBirth
gender
maritalStatus
officialEmail
personalEmail
mobile
company
plant
division
department
section
designation
jobGrade
employmentType
employmentCategory
manager
hod
subHod
status
```

---

# 45. Documents and Roles During Import

Documents and role assignment are optional.

Excel import must NOT require document files or user roles for every employee.

Optional columns can include:

```text
role
document category
document path / reference
```

These should only be processed when explicitly configured.

Documents can also be uploaded later from the Employee profile.

---

# 46. Excel Import Mapping UI

Never assume one permanent Excel heading structure.

Example source:

```text
Emp ID
Name
Dept
Post
Manager
Mobile No
```

Admin maps:

```text
Emp ID      → employeeCode
Name        → displayName
Dept        → department
Post        → designation
Manager     → reportingManager
Mobile No   → mobile
```

Save mappings as templates.

---

# 47. Import Mapping APIs

```text
GET    /api/v1/import-templates
GET    /api/v1/import-templates/:id

POST   /api/v1/import-templates
PATCH  /api/v1/import-templates/:id
DELETE /api/v1/import-templates/:id

GET    /api/v1/import-templates/:id/mappings
PUT    /api/v1/import-templates/:id/mappings
```

---

# 48. Import Templates

Examples:

```text
Employee Master Import
Employee Bulk Update
Employee Organization Update
Employee Access Update
```

Template should contain:

```text
source_column
target_field
transformation
required
default_value
validation_rule
```

---

# 49. Import Validation

Validate before commit:

```text
Missing employee code
Duplicate employee code
Unknown department
Unknown section
Unknown designation
Unknown grade
Unknown manager
Unknown HOD
Unknown Sub-HOD
Invalid date
Invalid email
Invalid mobile
Invalid status
Invalid role
Invalid company
Invalid location
Invalid relationship
```

Show errors by row and column.

---

# 50. Duplicate Handling

Primary matching key:

```text
employeeCode
```

Optional secondary matching:

```text
officialEmail
mobile
```

Admin can choose:

```text
SKIP
UPDATE
REJECT
```

Do not use ambiguous names as the primary matching key.

---

# 51. Import Preview

Before commit, show:

```text
Total Rows
Valid Rows
Warning Rows
Invalid Rows
Duplicates
New Employees
Potential Updates
Skipped Rows
```

Row-level preview:

```text
Row 12
Employee Code: SRJ0012
Department: Production
Designation: Supervisor
Status: ACTIVE
Result: VALID
```

---

# 52. Import Confirmation

Only an authorized Admin/HR user may confirm an import.

Confirmation must:

```text
record actor
record timestamp
record template
record source file
record row counts
create import audit event
```

---

# 53. Import Job Architecture

Large imports must be asynchronous.

Use:

```text
BullMQ + Redis
```

Architecture:

```text
Admin
 ↓
Upload
 ↓
Import Job
 ↓
Queue
 ↓
Worker
 ↓
Validate / Transform
 ↓
Transaction-safe batches
 ↓
Result
```

Do not keep an HTTP request open for thousands of rows.

---

# 54. Import Result

Provide:

```text
Created
Updated
Skipped
Rejected
Failed
Warnings
```

Allow download of an error/result Excel file:

```text
POST /api/v1/employees/import/:id/result-export
GET  /api/v1/employees/import/:id/result-download
```

---

# 55. Employee Export

Provide:

```text
POST /api/v1/employees/export
GET  /api/v1/employees/exports
GET  /api/v1/employees/exports/:id
GET  /api/v1/employees/exports/:id/download
```

Large exports must be background jobs.

Sensitive columns require permission.

Every export should be audited.

---

# 56. Employee Bulk Operations

Authorized Admin/HR users can perform:

```text
POST /api/v1/employees/bulk/activate
POST /api/v1/employees/bulk/deactivate
POST /api/v1/employees/bulk/transfer
POST /api/v1/employees/bulk/assign-company
POST /api/v1/employees/bulk/assign-location
POST /api/v1/employees/bulk/assign-department
POST /api/v1/employees/bulk/assign-section
POST /api/v1/employees/bulk/assign-designation
POST /api/v1/employees/bulk/assign-grade
POST /api/v1/employees/bulk/assign-manager
POST /api/v1/employees/bulk/assign-role
```

Bulk operations must have:

```text
authorization
validation
preview where appropriate
audit
result summary
failure handling
```

---

# 57. Access Control Configuration

Phase 2 provides the authorization engine.

Phase 3 provides the Admin UI to configure it.

Admin area:

```text
Admin
  ↓
Access Control
  ├── Roles
  ├── Permissions
  ├── Permission Groups
  ├── User Access
  ├── Module Access
  ├── Organization Scope
  └── Effective Access
```

---

# 58. Role Assignment

Admin selects employee:

```text
Employee
 ↓
Access & Roles
```

Then:

```text
Primary Role
Additional Roles
Permission Groups
Scope
```

Initial business roles:

```text
DIRECTOR
ADMIN
HR
HOD
SUB_HOD
EMPLOYEE
```

Use Phase 2 authorization services.

---

# 59. Permission Groups

Permission groups make administration easier.

Examples:

```text
HR Manager
HOD Manager
Employee Standard
Report Viewer
Security Administrator
Employee Administrator
```

CRUD:

```text
GET    /api/v1/permission-groups
GET    /api/v1/permission-groups/:id

POST   /api/v1/permission-groups
PATCH  /api/v1/permission-groups/:id
DELETE /api/v1/permission-groups/:id

GET    /api/v1/permission-groups/:id/permissions
PUT    /api/v1/permission-groups/:id/permissions
```

---

# 60. Module Access Configuration

Admin should be able to configure module access.

Modules include:

```text
Employee Management
Attendance
Leave
Tasks
KRA
Kaizen
SOP
Notices
Complaints
Training
Chat
Calls
Reports
Analytics
Security
Privacy
Settings
```

Actions:

```text
View
Create
Update
Delete
Approve
Export
Manage
```

Do not rely on frontend hiding.

Backend authorization is final.

---

# 61. Scope Configuration

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
Permission:
employees.view

Role:
HOD

Scope:
DEPARTMENT
```

Another:

```text
Permission:
employees.view

Role:
HR

Scope:
COMPANY
```

---

# 62. Effective Access Viewer

Admin must be able to diagnose a user's effective access.

API:

```text
GET /api/v1/users/:userId/effective-access
```

Example:

```text
Employee: Rahul
Role: HOD
Department: Production
Section: Rolling Mill

Roles:
HOD

Permission Groups:
HOD Manager

Permissions:
✓ employees.view
✓ employees.update
✓ tasks.create
✓ leave.approve
✓ kra.rate
✕ system.settings
✕ security.ip.block

Scope:
Department = Production
```

Display why a permission exists:

```text
Granted by:
HOD Manager

Scope:
Production Department
```

This is important for Admin troubleshooting.

---

# 63. Field-Level Employee Access

Where practical, support field visibility.

Example:

| Field | Employee | Sub-HOD | HOD | HR | Director | Admin |
|---|---|---|---|---|---|---|
| Name | SELF | TEAM | DEPT | ORG | ORG | ORG |
| DOB | SELF | LIMITED | LIMITED | ORG | AUTHORIZED | AUTHORIZED |
| Personal Mobile | SELF | TEAM | DEPT | ORG | AUTHORIZED | AUTHORIZED |
| Bank Details | SELF | NO | NO | FULL | AUTHORIZED | AUTHORIZED |
| Government IDs | SELF | NO | NO | FULL | LIMITED | AUTHORIZED |

This is an initial policy example. Final access must be configurable.

---

# 64. Admin Configuration Area

Phase 3 Admin UI should contain:

```text
Admin
│
├── Employee Management
│   ├── Employees
│   ├── Add Employee
│   ├── Import Excel
│   ├── Export
│   ├── Bulk Actions
│   └── Employee Fields
│
├── Organization
│   ├── Companies
│   ├── Plants / Locations
│   ├── Divisions
│   ├── Departments
│   ├── Sections
│   ├── Designations
│   ├── Job Grades
│   ├── Employment Types
│   └── Employment Categories
│
├── Documents
│   ├── Document Categories
│   ├── Requirements
│   └── Verification Rules
│
└── Access Control
    ├── Roles
    ├── Permissions
    ├── Permission Groups
    ├── User Access
    ├── Scope
    └── Effective Access
```

---

# 65. Admin Configurability Boundary

### Should require NO code deployment:

```text
Department
Section
Designation
Job Grade
Employment Type
Employment Category
Employee Status
Document Category
Document Requirement
Employee Custom Field
HOD
Sub-HOD
Reporting Manager
Employee organization assignment
Role assignment
Permission assignment
Permission groups
Scope
Import mapping
Feature configuration
```

### Should normally require code:

```text
New fundamental business capability
New external integration
New security mechanism
New database behavior that cannot be represented through configuration
New architectural capability
```

Do not turn the Admin panel into a source-code/configuration editor.

---

# 66. Audit Requirements

Audit every important action:

```text
EMPLOYEE_CREATED
EMPLOYEE_UPDATED
EMPLOYEE_DELETED
EMPLOYEE_RESTORED

EMPLOYEE_STATUS_CHANGED
EMPLOYEE_TRANSFERRED
EMPLOYEE_PROMOTED
EMPLOYEE_RESIGNED
EMPLOYEE_EXITED

DEPARTMENT_CREATED
DEPARTMENT_UPDATED
DEPARTMENT_DELETED

DESIGNATION_CREATED
DESIGNATION_UPDATED
DESIGNATION_DELETED

ROLE_ASSIGNED
ROLE_REMOVED
PERMISSION_GRANTED
PERMISSION_REVOKED
SCOPE_CHANGED

USER_EMPLOYEE_BOUND
USER_EMPLOYEE_UNBOUND

DOCUMENT_UPLOADED
DOCUMENT_UPDATED
DOCUMENT_DELETED
DOCUMENT_VERIFIED

IMPORT_STARTED
IMPORT_CONFIRMED
IMPORT_COMPLETED
IMPORT_CANCELLED

EMPLOYEE_EXPORT_REQUESTED
EMPLOYEE_EXPORT_DOWNLOADED
```

Audit records:

```text
actor
action
resource
resource_id
old_value where appropriate
new_value where appropriate
timestamp
organization context
IP where appropriate
session/device where appropriate
metadata
```

Never place unnecessary sensitive document contents into audit logs.

---

# 67. Organization History

Important organization assignments should be historically traceable.

Example:

```text
Employee
  ↓
Production
  ↓
Maintenance
  ↓
Quality
```

Store organizational changes in an appropriate history model or audit/event model.

Useful fields:

```text
employee_id
change_type
old_value
new_value
effective_from
effective_to
changed_by
created_at
```

Do not rely only on current employee columns if future reports need historical organization state.

---

# 68. Security and Authorization Integration

For every employee API:

```text
Authentication
      ↓
Permission
      ↓
Organization Scope
      ↓
Resource Policy
      ↓
Field Access
      ↓
Action
```

Example:

```text
HOD
+
employees.view
+
Department = Production
+
Employee belongs to Production
=
ALLOW
```

Another:

```text
HOD
+
employees.view
+
Employee belongs to HR
=
DENY
```

Frontend checks are never enough.

---

# 69. Data Validation

Employee validation must include:

```text
employeeCode uniqueness
email format
mobile validation
date consistency
DOJ <= DOE where DOE exists
DOB < DOJ where policy requires
valid organization relationships
valid manager
valid HOD
valid Sub-HOD
valid designation
valid grade
valid status
```

Do not assume all relationships are valid simply because IDs exist.

---

# 70. Database Constraints

Use PostgreSQL constraints for critical invariants.

Examples:

```text
unique employeeCode
unique role code
unique department code within required scope
foreign keys
check constraints
unique user ↔ employee binding where applicable
```

Application validation and database constraints should complement each other.

---

# 71. Transactions

Use database transactions for operations such as:

```text
Employee creation + user binding
Employee transfer
Bulk employee update
Role assignment
Department reassignment
Import batches
Document metadata + related state updates
```

Do not allow partially completed state where consistency matters.

---

# 72. API Error Standards

Use the project's standard error structure.

Examples:

```text
EMPLOYEE_CODE_ALREADY_EXISTS
INVALID_DEPARTMENT
INVALID_MANAGER
REPORTING_CYCLE_DETECTED
DOCUMENT_CATEGORY_NOT_FOUND
IMPORT_VALIDATION_FAILED
IMPORT_ALREADY_CONFIRMED
UNAUTHORIZED_FIELD_ACCESS
```

Return appropriate HTTP status codes.

Do not expose SQL errors.

---

# 73. Search Performance

Employee search can become a high-traffic endpoint.

Use:

```text
proper indexes
pagination
selective projections
parameterized queries
efficient filtering
```

Index likely search/filter fields such as:

```text
employee_code
name fields where appropriate
department_id
section_id
designation_id
job_grade_id
company_id
location_id
status
manager_id
```

Verify indexes against actual query patterns rather than adding unnecessary indexes.

---

# 74. Employee List Sorting

Support:

```text
sortBy
sortOrder
```

Examples:

```text
name ASC
employeeCode ASC
joiningDate DESC
department ASC
```

Use a whitelist of allowed sortable fields.

Never accept raw SQL/order expressions from the client.

---

# 75. Employee Profile Picture

Use the central file storage architecture.

API:

```text
POST   /api/v1/employees/:id/profile-picture
DELETE /api/v1/employees/:id/profile-picture
```

Store file metadata, not binary data in PostgreSQL.

Validate:

```text
MIME
size
extension
authorization
```

---

# 76. Data Import Security

Excel files are untrusted input.

Requirements:

- validate file type
- validate size
- store uploads outside executable paths
- parse safely
- reject malformed files
- validate every cell
- protect against formula-related export/import issues
- prevent path traversal
- audit importer
- never trust embedded macros or active content

Only authorized users may import.

---

# 77. Employee Export Security

Exports can contain sensitive HR information.

Require:

```text
permission
scope
field-level filtering
audit
```

Admin should not automatically allow every employee field to every role.

---

# 78. Admin UI Principles

Admin configuration screens must show:

```text
Create
Edit
Delete / Deactivate
Search
Filter
Status
Display order
Dependencies
Audit history
```

Avoid destructive operations when dependent records exist.

Example:

A department with 500 employees should normally not be hard-deleted.

Instead:

```text
Deactivate
```

or require reassignment before deletion.

---

# 79. Dependency Safety

Before deleting master data, check references.

Example:

```text
Department
  ↓
Employees
  ↓
Leave
  ↓
Tasks
  ↓
KRA
```

Do not allow deletion that would break references.

Use messages such as:

```text
DEPARTMENT_HAS_ACTIVE_EMPLOYEES
DESIGNATION_IN_USE
JOB_GRADE_IN_USE
DOCUMENT_CATEGORY_IN_USE
```

---

# 80. Employee UI Access by Role

## Employee

Can normally see:

```text
Own profile
Own documents
Own employment information
Own limited organization data
```

## Sub-HOD

Can normally see:

```text
Own team employees
Authorized employee fields
Reporting relationships
```

## HOD

Can normally see:

```text
Department employees
Department structure
Authorized employee fields
```

## HR

Can normally see:

```text
Organization-wide HR records according to permission
```

## Director

Can normally see:

```text
Organization-wide management information according to permission
```

## Admin

Can manage:

```text
Employee master
Organization master
User binding
Access control
Configuration
```

Backend remains authoritative.

---

# 81. Phase 3 API Groups

## Employees

```text
GET    /api/v1/employees
GET    /api/v1/employees/:id
POST   /api/v1/employees
PATCH  /api/v1/employees/:id
DELETE /api/v1/employees/:id
POST   /api/v1/employees/:id/restore
```

## Organization

```text
/api/v1/companies
/api/v1/locations
/api/v1/divisions
/api/v1/departments
/api/v1/sections
/api/v1/designations
/api/v1/job-grades
/api/v1/employment-types
/api/v1/employment-categories
/api/v1/employee-statuses
```

All support appropriate CRUD.

## Hierarchy

```text
GET  /api/v1/organization/tree
GET  /api/v1/employees/:id/reporting-chain
GET  /api/v1/employees/:id/subordinates
POST /api/v1/employees/:id/manager
POST /api/v1/employees/:id/hod
POST /api/v1/employees/:id/sub-hod
```

## Documents

```text
/api/v1/document-categories
/api/v1/document-requirements
/api/v1/employees/:id/documents
```

## User Binding

```text
/api/v1/employees/:id/user
/api/v1/users/:id/employee
```

## Custom Fields

```text
/api/v1/employee-fields
/api/v1/employees/:id/custom-fields
```

## Import / Export

```text
/api/v1/employees/import
/api/v1/import-templates
/api/v1/employees/export
```

## Access

```text
/api/v1/users/:id/effective-access
/api/v1/roles
/api/v1/permissions
/api/v1/permission-groups
```

---

# 82. Database Models

At minimum, Phase 3 should verify/create appropriate models for:

```text
Company
Location
Division
Department
Section
Designation
JobGrade
EmploymentType
EmploymentCategory
EmployeeStatus

Employee
EmployeeCustomField
EmployeeCustomFieldValue

EmergencyContact
EmployeeBankDetails

EmployeeReportingRelationship
EmployeeOrganizationHistory

DocumentCategory
DocumentRequirement
EmployeeDocument

UserEmployeeBinding

ImportTemplate
ImportTemplateMapping
EmployeeImportJob
EmployeeImportRow
EmployeeExportJob
```

Use actual Prisma naming conventions consistent with the existing codebase.

Do not create redundant tables where the existing Phase 1 schema already provides the correct model.

---

# 83. API Security by Module

## Employee APIs

Require appropriate:

```text
employees.view
employees.create
employees.update
employees.delete
```

plus scope.

## Organization master

Require:

```text
organization.view
organization.manage
```

or equivalent granular permissions.

## Documents

Require:

```text
employee.documents.view
employee.documents.upload
employee.documents.update
employee.documents.delete
employee.documents.verify
```

## Imports

Require:

```text
employees.import
employees.import.confirm
```

## Exports

Require:

```text
employees.export
```

## Access management

Require Phase 2 authorization permissions.

---

# 84. Phase 3 Frontend Screens

Recommended React Native screens:

```text
screens/
├── employees/
│   ├── EmployeeListScreen
│   ├── EmployeeDetailScreen
│   ├── EmployeeCreateScreen
│   ├── EmployeeEditScreen
│   ├── EmployeeOrganizationScreen
│   ├── EmployeeReportingScreen
│   ├── EmployeeDocumentsScreen
│   ├── EmployeeAccessScreen
│   ├── EmployeeCustomFieldsScreen
│   ├── EmployeeImportScreen
│   └── EmployeeExportScreen
│
├── organization/
│   ├── OrganizationTreeScreen
│   ├── CompanyManagementScreen
│   ├── LocationManagementScreen
│   ├── DivisionManagementScreen
│   ├── DepartmentManagementScreen
│   ├── SectionManagementScreen
│   ├── DesignationManagementScreen
│   └── JobGradeManagementScreen
│
└── admin/
    ├── EmployeeFieldManagementScreen
    ├── DocumentCategoryScreen
    ├── DocumentRequirementScreen
    ├── ImportTemplateScreen
    ├── RoleManagementScreen
    ├── PermissionGroupScreen
    └── EffectiveAccessScreen
```

Actual naming should follow project conventions.

---

# 85. Employee Detail Layout

Recommended sections:

```text
Header
 ├── Profile picture
 ├── Name
 ├── Employee Code
 ├── Designation
 └── Status

Basic Information

Employment

Organization

Reporting Structure

Contact

Emergency Contacts

Documents

User Account

Access & Roles

Custom Fields

Activity / Audit where authorized
```

Do not show every section to every role.

---

# 86. Employee Create Form

Organize fields into sections:

```text
Personal
Employment
Organization
Reporting
Contact
Emergency
Bank
Documents
Custom Fields
Account
Access
```

Required field indicators should come from configuration where appropriate.

---

# 87. Dynamic Form Behavior

Admin-configured fields should automatically appear.

Example:

Admin creates:

```text
UAN Number
Type = TEXT
Required = HR
```

Employee form should render it without a code change.

Similarly:

```text
Worker Category
Type = SELECT
Options = Permanent / Contract / Trainee
```

Options come from configuration.

---

# 88. Excel Import UI

Admin flow:

```text
Import Employees
     ↓
Upload Excel
     ↓
Select Mapping Template
     ↓
Map Columns if needed
     ↓
Preview
     ↓
Validation Results
     ↓
Fix/replace file
     ↓
Confirm Import
     ↓
Processing
     ↓
Result
```

Display progress for large imports.

---

# 89. Import UI Result

Show:

```text
Import ID
File
Started
Completed
By
Status

Total Rows
Created
Updated
Skipped
Rejected
Failed
Warnings
```

Allow result download.

---

# 90. Admin Organization UI

Admin should be able to visually manage:

```text
Company
 └── Plant
      └── Division
           └── Department
                └── Section
```

Provide counts:

```text
Employees
HOD
Sub-HOD
Active
Inactive
```

Avoid unnecessarily complicated drag-and-drop unless it provides actual value.

---

# 91. Org Tree Safety

When changing organization relationships:

```text
Validate cycle
Validate role authority
Validate organization membership
Validate existing approvals/dependencies where applicable
Audit change
```

Do not silently reassign hundreds of employees.

For bulk hierarchy changes, provide preview/confirmation.

---

# 92. Phase 3 Testing

## Unit tests

Test:

```text
employee validation
status transitions
manager cycle detection
organization validation
document rules
custom field validation
import mapping
duplicate matching
```

## Integration tests

Test:

```text
employee CRUD
organization CRUD
document upload metadata
user ↔ employee binding
role assignment
scope assignment
import workflow
export permissions
```

## Authorization tests

For each role:

```text
DIRECTOR
ADMIN
HR
HOD
SUB_HOD
EMPLOYEE
```

Test:

```text
ALLOWED
DENIED
OUT-OF-SCOPE
FIELD-FORBIDDEN
INVALID WORKFLOW STATE
```

---

# 93. Phase 3 Security Tests

Specifically test:

```text
Employee A cannot access Employee B sensitive records
HOD cannot access unrelated department employees
Sub-HOD cannot access unrelated sections
Employee cannot change their role
Employee cannot change another employee's role
Employee cannot upload to another employee without permission
Unauthorized user cannot download private documents
Unauthorized user cannot confirm imports
Unauthorized user cannot export sensitive employee fields
```

---

# 94. Performance Tests

Test at realistic volume.

Minimum recommended test datasets:

```text
10,000 employees
100 departments
500 sections
500 designations
100 job grades
```

Test:

```text
employee list
employee search
organization tree
department filtering
imports
exports
document listing
```

Optimize based on real query plans.

---

# 95. Phase 3 Definition of Done

Phase 3 is complete only when:

```text
[ ] Employee CRUD
[ ] Soft delete
[ ] Restore
[ ] Lifecycle statuses
[ ] Lifecycle actions
[ ] Companies
[ ] Plants / Locations
[ ] Divisions
[ ] Departments
[ ] Sections
[ ] Designations
[ ] Job Grades
[ ] Employment Types
[ ] Employment Categories
[ ] Reporting hierarchy
[ ] Org tree

[ ] User ↔ Employee binding
[ ] Role assignment integration
[ ] Permission group integration
[ ] Scope assignment
[ ] Effective access viewer

[ ] Employee documents
[ ] Document category CRUD
[ ] Document requirements
[ ] Document verification
[ ] Secure file storage

[ ] Employee search
[ ] Filters
[ ] Pagination
[ ] Sorting
[ ] Bulk operations
[ ] Employee export

[ ] Excel import
[ ] Mapping
[ ] Templates
[ ] Preview
[ ] Validation
[ ] Duplicate handling
[ ] Confirm/cancel
[ ] Background processing
[ ] Error/result export

[ ] Employee custom fields
[ ] Dynamic fields
[ ] Field permissions

[ ] Audit
[ ] Security authorization
[ ] Transaction safety
[ ] Integration tests
[ ] Authorization tests
[ ] Performance validation
```

---

# 96. Key Architectural Outcome

After Phase 3:

```text
                         ADMIN
                           │
          ┌────────────────┴────────────────┐
          ▼                                 ▼
   ORGANIZATION MASTER                 ACCESS CONTROL
          │                                 │
          ▼                                 ▼
 Company / Plant / Division          Roles / Permissions
 Department / Section                Permission Groups
 Designation / Grade                 Scope
          │                                 │
          └────────────────┬────────────────┘
                           ▼
                       EMPLOYEE
                           │
       ┌───────────────────┼────────────────────┐
       ▼                   ▼                    ▼
   REPORTING           DOCUMENTS          USER ACCOUNT
   HOD/Sub-HOD                              Binding
   Manager
       │
       ▼
 Future Modules
 ├── Attendance
 ├── Leave
 ├── Tasks
 ├── KRA
 ├── Kaizen
 ├── SOP
 ├── Training
 ├── Complaints
 ├── Reports
 └── Analytics
```

---

# 97. Final Directive to Claude

Build Phase 3 as an **Admin-configurable Employee and Organization Management platform**, not as a collection of hard-coded CRUD screens.

The core rule is:

```text
BUSINESS CONFIGURATION
        ↓
DATABASE
        ↓
ADMIN UI
        ↓
AUTHORIZATION
        ↓
EMPLOYEE / ORGANIZATION
        ↓
FUTURE HRMS MODULES
```

The Admin must be able to make ordinary organizational and access changes without source-code modification or a new deployment.

However:

```text
Admin configuration ≠ unrestricted system access
```

Every administrative operation still requires:

```text
Authentication
+
Authorization
+
Organization Scope
+
Validation
+
Audit
```

Never bypass Phase 2 security architecture.

Never store employee documents directly in PostgreSQL.

Never commit an Excel import directly before validation/preview/confirmation.

Never expose sensitive employee fields by default.

Never allow organization hierarchy cycles.

Never hard-code departments, designations, grades, document categories, or normal configurable business values.

The Phase 3 implementation should leave the platform ready for:

```text
Attendance
Leave
Tasks
KRA
Kaizen
SOP
Training
Complaints
Chat
Reports
Analytics
```

Build the data layer once, correctly, so every subsequent HRMS module can depend on it safely.
