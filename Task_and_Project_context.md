# SRJ Sarthi HRMS — Tasks & Projects Module Context

## 1. Purpose

The **Tasks & Projects module** is a centralized work-management system inside SRJ Sarthi HRMS.

It must support:

- Normal/personal task management
- Hierarchical task assignment
- Cross-department task assignment
- Project-based task management
- Checklists and subtasks
- Document attachments
- Comments and activity history
- Task CRUD operations
- Project CRUD operations
- Task ↔ Project relationships
- Task and project analytics
- Admin-wide visibility and analysis
- Simple and fast access from the HRMS

The system should be designed so that everyday users can create, view, update, and complete tasks with minimal clicks, while Admin and management users have complete organizational visibility.

---

# 2. Task Assignment Hierarchy

## Director

A Director can:

- Create tasks
- Assign tasks to any HOD
- Assign tasks to any employee
- Assign tasks across departments
- Assign tasks to self
- Reassign tasks
- Edit tasks
- Delete/archive tasks
- View all organizational tasks
- Monitor task progress
- Review task activity
- Connect tasks to projects

### Example

```text
Director
   │
   ├── Production HOD
   ├── Maintenance HOD
   ├── Quality HOD
   ├── Sales HOD
   └── Any Employee
```

---

# 3. HOD Task Assignment

HODs can assign tasks to employees.

**Important:** HOD assignment is NOT restricted to their own department.

An HOD can assign a task to:

- Employee in their own department
- Employee in another department
- Employee in a project team
- Self

Example:

```text
Production HOD
      │
      ├── Production Employee
      ├── Maintenance Employee
      ├── Quality Employee
      └── Electrical Employee
```

This supports cross-functional work.

---

# 4. Employee Tasks

Employees can:

- View assigned tasks
- Accept/acknowledge tasks
- Start tasks
- Update progress
- Complete checklist items
- Add comments
- Attach documents
- Submit tasks for review
- Create personal tasks
- Edit their own permitted personal tasks
- Complete/reopen personal tasks where permitted

Employees do not automatically receive organizational task-assignment authority.

---

# 5. Task Types

The system should support:

1. Assigned Task
2. Personal Task
3. Department Task
4. Project Task
5. Subtask
6. Checklist Task
7. Recurring Task
8. Follow-up Task
9. Approval Task
10. Meeting Action Item

The task type should be configurable and extensible.

---

# 6. Task CRUD

Every task should support standard CRUD operations.

## Create

Users with permission can create a task with:

- Title
- Description
- Task type
- Assignee
- Department
- Project
- Parent task
- Priority
- Status
- Start date
- Due date
- Progress
- Checklist
- Attachments
- Comments
- Approval requirement

## Read

Users can view tasks according to their permissions.

Task details should include:

- Basic information
- Assignment
- Project
- Status
- Progress
- Checklist
- Attachments
- Comments
- Activity history
- Related tasks

## Update

Authorized users can edit:

- Title
- Description
- Assignee
- Department
- Project
- Priority
- Dates
- Status
- Progress
- Checklist
- Other configurable task fields

Every important change should be recorded in the activity log.

## Delete

Tasks should preferably use **soft delete/archive** rather than permanent deletion.

The system should preserve the audit history.

## Additional actions

- Duplicate task
- Reassign
- Complete
- Reopen
- Archive
- Restore

---

# 7. Task Status

Recommended task lifecycle:

```text
Draft
  ↓
Assigned
  ↓
Acknowledged
  ↓
In Progress
  ↓
Submitted for Review
  ↓
Approved
  ↓
Completed
```

Alternative states:

```text
Pending
On Hold
Rework
Overdue
Cancelled
Reopened
```

Status transitions should be permission-controlled.

---

# 8. Task Priority

Support:

```text
Critical
High
Medium
Low
```

Priority should be visually identifiable throughout the system.

---

# 9. Task Progress

Every task should support progress percentage:

```text
0%
25%
50%
75%
100%
```

Example:

```text
Production Report

Progress
██████████████░░░░ 75%
```

For tasks containing subtasks/checklists, progress can optionally be calculated automatically.

---

# 10. Checklists

Tasks must support checklists.

Example:

```text
Prepare Production Report

Checklist                     3 / 5

☑ Collect RM production data
☑ Collect finishing data
☑ Verify quantities
☐ Prepare Excel report
☐ Submit report
```

Users with permission can:

- Add checklist items
- Edit checklist items
- Delete checklist items
- Mark items complete
- Reopen items
- Assign checklist items
- Add due dates
- Add attachments/comments

Checklist completion can contribute to overall task progress.

---

# 11. Subtasks

A task can contain multiple subtasks.

```text
Main Task
│
├── Subtask 1
├── Subtask 2
├── Subtask 3
└── Subtask 4
```

Each subtask can have:

- Assignee
- Status
- Priority
- Due date
- Progress
- Checklist
- Attachments
- Comments

---

# 12. Task Attachments / Documents

Every task can contain documents.

Supported file categories should include:

- PDF
- Word documents
- Excel files
- PowerPoint files
- Images
- ZIP files
- Other configured business documents

Example:

```text
Attachments (4)

📄 Production_Report.xlsx
📄 RM_Data.pdf
🖼 Machine.jpg
📄 Instructions.docx

[ + Attach Files ]
```

Attachment actions:

- Upload
- Preview
- Download
- Delete
- Replace
- Version

Attachment metadata:

- File name
- File size
- Uploaded by
- Uploaded date
- Version
- Related task

---

# 13. Comments

Tasks should support comments.

```text
HOD:
Please complete the report before 5 PM.

Employee:
RM data has been completed. Uploading the file now.

📎 RM_Report.xlsx
```

Comments should include:

- User
- Message
- Timestamp
- Attachments
- Edit/delete according to permissions

---

# 14. Task Activity / Audit History

Every important task action should be logged.

Example:

```text
29 Aug 10:32
Director assigned task to Production HOD

29 Aug 11:15
Production HOD assigned task to Rahul

29 Aug 12:05
Rahul changed status:
Pending → In Progress

29 Aug 15:42
Rahul uploaded Production_Report.xlsx

29 Aug 17:10
HOD approved task
```

Activity events can include:

- Created
- Assigned
- Reassigned
- Edited
- Status changed
- Priority changed
- Due date changed
- Checklist updated
- File uploaded
- File deleted
- Comment added
- Completed
- Reopened
- Archived

---

# 15. Projects

Projects are the organizational container for larger work.

A project can contain:

- Tasks
- Subtasks
- Project team
- Documents
- Timeline
- Project progress
- Project activity
- Related tasks

Example:

```text
Project
New Rolling Mill Installation
│
├── Civil Work
├── Electrical Installation
├── PLC Configuration
│    ├── PLC Setup
│    └── PLC Testing
├── Trial Production
└── Final Commissioning
```

---

# 16. Project CRUD

Projects must support:

### Create

- Project name
- Description
- Project manager
- Team members
- Department
- Start date
- End date
- Priority
- Status
- Project documents

### View

Project dashboard should show:

- Overview
- Progress
- Tasks
- Team
- Documents
- Timeline
- Activity

### Edit

Authorized users can update project information and team members.

### Delete

Use soft delete/archive.

### Additional

- Duplicate
- Archive
- Restore
- Close project
- Reopen project

---

# 17. Project Status

Recommended:

```text
Planning
Active
On Hold
At Risk
Completed
Cancelled
Archived
```

---

# 18. Project Progress

Project progress should be visible clearly.

```text
New Rolling Mill Installation

Overall Progress
██████████████░░░░ 67%

Tasks
82 Total
54 Completed
20 In Progress
8 Pending
```

Project progress can optionally be calculated from its tasks.

---

# 19. Project Team

Each project can have multiple users.

Example:

```text
PROJECT TEAM

Production HOD
Maintenance HOD
Quality Engineer
Rahul Patil
Suresh Pawar
Electrical Engineer
```

Team members can have project-level permissions such as:

- Project Manager
- Contributor
- Viewer
- Task Manager

---

# 20. Task ↔ Project Connection

A task can optionally belong to a project.

```text
Project
   ↓
Task
   ↓
Subtask
   ↓
Checklist
```

Example:

```text
Project:
New Rolling Mill Installation

Task:
PLC Configuration

Subtasks:
├── PLC setup
├── Signal testing
└── Production trial
```

A task should also be able to exist independently as a normal task.

Therefore:

```text
Project Task     → Connected to Project
Normal Task      → No Project
Personal Task    → No Project
```

---

# 21. Task Dependencies

Projects and tasks should support relationships such as:

```text
Blocked By
Blocks
Related To
Duplicate Of
Parent Of
Subtask Of
```

Example:

```text
Electrical Installation
        ↓
   Blocks
        ↓
PLC Configuration
        ↓
   Blocks
        ↓
Trial Production
```

---

# 22. Project Documents

Projects should have their own document center.

```text
PROJECT FILES

📁 Drawings
📁 Reports
📁 Purchase Documents
📁 Technical Documents
📁 Photos
📁 Completion Documents
```

Documents can also be connected directly to individual tasks.

---

# 23. Easy Access

The module should prioritize speed.

Main HRMS navigation:

```text
Dashboard
Employees
Attendance
Leave
Payroll

📝 Tasks
📁 Projects
```

Global quick action:

```text
[ + Create ]
```

Options:

```text
+ Create Task
+ Personal Task
+ Create Project
```

---

# 24. My Tasks

Every user should have a simple personal task dashboard.

```text
MY TASKS

Total       Pending      Due Today      Overdue
  24           11            5             3

────────────────────────────────────────────

🔴 Production Report
Due Today
██████████████░░ 75%

🟡 Machine Inspection
Due Tomorrow
██████░░░░░░░░░ 40%

🔵 Dealer Follow-up
Due 02 Sep
░░░░░░░░░░░░░░░ 0%
```

Filters:

- All
- Pending
- In Progress
- Due Today
- Due Soon
- Overdue
- Completed
- Created by Me
- Assigned by Me

---

# 25. Admin — All Tasks

Admin should have global visibility.

```text
ADMIN → TASKS

Total Tasks        1,248
Completed            842
In Progress          312
Pending              156
Overdue               94
```

Admin can:

- View all tasks
- Search
- Filter
- Edit
- Reassign
- Archive
- View activity
- View attachments
- View project relationships
- Analyze performance

---

# 26. Admin Task Filters

Admin should be able to filter by:

```text
Department
HOD
Employee
Task Creator
Task Assignee
Project
Task Type
Status
Priority
Date
Due Date
Overdue
Cross-Department
```

Filters should be combinable.

Example:

```text
Department: Maintenance
Status: Overdue
Priority: High
Project: Plant Maintenance
```

---

# 27. Admin Task Analytics

Admin dashboard should show:

```text
TOTAL TASKS
COMPLETED
IN PROGRESS
PENDING
OVERDUE
CANCELLED
REOPENED

Completion Rate
On-Time Completion Rate
Average Completion Time
Average Delay
```

### Department analysis

```text
Department       Tasks   Completed   Overdue   Rate

Production        182       158         12      87%
Sales             126       104         15      82%
Maintenance       143       101         21      71%
Quality            94        88          3      94%
HR                 74        71          1      96%
```

---

# 28. HOD Analysis

Admin should be able to analyze HOD task management.

```text
HOD
│
├── Tasks Assigned
├── Tasks Completed
├── Tasks Overdue
├── Completion Rate
├── Average Completion Time
└── Cross-Department Assignments
```

---

# 29. Employee Task Analysis

Admin can open an employee and see:

```text
Employee: Rahul Patil

Tasks                 42
Completed             38
In Progress             2
Overdue                 2

Completion Rate       90%
Average Completion    3.2 Days

Projects                4
```

---

# 30. Cross-Department Analysis

Because HODs can assign employees across departments, Admin should specifically track cross-department work.

Example:

```text
Production HOD
      ↓
Maintenance Employee     18 tasks
Quality Employee           9 tasks
Electrical Employee        7 tasks
```

This helps management understand interdepartmental workload.

---

# 31. Project Analytics

Admin should see:

```text
PROJECT ANALYTICS

Project                     Tasks   Completed   Progress
────────────────────────────────────────────────────────
Rolling Mill Installation     82       54         66%
Plant Maintenance             46       39         85%
Dealer Expansion              31       18         58%
HRMS Implementation           74       61         82%
```

Project-level analytics should include:

- Task completion
- Overdue tasks
- Team workload
- Project progress
- Completion rate
- Delayed tasks
- Activity
- Documents

---

# 32. Global Search

The module should provide one global search.

Search should support:

```text
Task name
Project name
Employee
HOD
Department
Task ID
Project ID
Document name
```

Example:

Search:

```text
Rahul Patil
```

Result:

```text
Rahul Patil

Tasks: 42
Projects: 4

Active Tasks
Completed Tasks
Overdue Tasks

Projects
Recent Activity
Documents
```

---

# 33. Permissions

Task and Project permissions should be configurable.

Recommended permissions:

```text
TASK_CREATE
TASK_VIEW
TASK_EDIT
TASK_DELETE
TASK_ASSIGN
TASK_REASSIGN
TASK_COMPLETE
TASK_REOPEN
TASK_ARCHIVE
TASK_COMMENT
TASK_ATTACH
TASK_VIEW_ALL
TASK_VIEW_TEAM

PROJECT_CREATE
PROJECT_VIEW
PROJECT_EDIT
PROJECT_DELETE
PROJECT_ARCHIVE
PROJECT_MANAGE_TEAM
PROJECT_MANAGE_TASKS
PROJECT_VIEW_ALL
```

Assignment scope:

```text
Director
→ Any HOD
→ Any Employee

HOD
→ Any Employee
→ Cross Department Allowed

Employee
→ Personal Tasks
```

The exact scope should be configurable from Admin settings.

---

# 34. Recommended Data Model

Core entities:

```text
User
Department

Task
TaskAssignee
TaskChecklist
TaskComment
TaskAttachment
TaskActivity
TaskDependency
TaskReminder
TaskWatcher

Project
ProjectMember
ProjectTask
ProjectAttachment
ProjectActivity
```

Relationships:

```text
Project 1 ───── * Task

Task 1 ───── * ChecklistItem

Task 1 ───── * Comment

Task 1 ───── * Attachment

Task 1 ───── * Activity

Task * ───── * User

Project * ───── * User
```

---

# 35. Recommended Module Navigation

## User

```text
Tasks
├── My Tasks
├── Assigned by Me
├── Personal
├── Projects
└── Overdue
```

## Admin

```text
Tasks & Projects
├── Overview
├── All Tasks
├── Projects
├── Employees
├── HOD Analysis
├── Department Analysis
├── Project Analysis
├── Reports
├── Documents
└── Activity Log
```

---

# 36. Core Design Principle

The system should use **one unified Task engine**.

Do not create separate technical systems for:

- Director Tasks
- HOD Tasks
- Employee Tasks
- Personal Tasks
- Project Tasks

Instead:

```text
                         TASK ENGINE
                              │
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
       Organizational       Personal        Project
           Tasks             Tasks           Tasks
             │                                  │
      ┌──────┴──────┐                           │
      ↓             ↓                           ↓
   Director        HOD                      Project
      │             │                           │
      └──────┬──────┘                           │
             ↓                                  │
         Employee ──────────────────────────────┘
```

Permissions determine **who can create, assign, edit, view, and manage** tasks.

Projects provide the organizational structure for larger work.

This architecture keeps the system simple for users while providing Admin with complete visibility and analytics.