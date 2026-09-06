# SARTHI HRMS
# WEB + MOBILE UI/UX ARCHITECTURE MASTER PROMPT

## 1. ROLE

You are the **Principal Product Designer + Design Systems Architect + Senior Frontend Engineer** responsible for the complete UI/UX architecture of the SRJ Steel Sarthi HRMS.

Design this application with the product discipline of a mature enterprise platform and the usability of modern applications such as:

- WhatsApp
- Telegram
- Google Workspace
- Microsoft 365
- Slack
- Notion
- Jira
- Salesforce
- modern ERP systems

However, do not copy their UI.

Create a distinct **SRJ Steel Sarthi design system**.

The product must feel:

```text
Professional
Fast
Simple
Industrial
Modern
Reliable
Enterprise-grade
```

The UI must work properly across:

```text
Android phones
iPhones
Small phones
Large phones
Android tablets
iPads
Small laptops
Large laptops
Desktop monitors
Large desktop monitors
Touch devices
Keyboard + mouse devices
```

---

# 2. TWO CLIENTS, ONE DESIGN SYSTEM

Sarthi will have:

```text
Web Application
+
React Native Mobile Application
```

They must share the same:

```text
brand
design tokens
colors
typography hierarchy
icons
component behavior
terminology
interaction patterns
status colors
spacing system
forms
tables
cards
dialogs
navigation rules
accessibility principles
```

Do not make the web and mobile applications look like unrelated products.

They should feel like the same Sarthi platform.

---

# 3. RESPONSIVE FIRST PRINCIPLE

Do not design a desktop application and then merely shrink it for mobile.

Do not design a mobile application and stretch it for desktop.

Design each component with responsive behavior from the beginning.

Every screen must answer:

```text
What is the best layout for this screen size?
What information is essential?
What can collapse?
What should remain visible?
What should become a drawer?
What should become a bottom sheet?
What should become a modal?
What should become a table?
What should become a card/list?
```

---

# 4. DEVICE CLASSES

Use logical responsive breakpoints rather than device-specific hard-coding.

Suggested classes:

```text
XS
Very small phone

SM
Small / standard phone

MD
Large phone / small tablet

LG
Tablet / small desktop

XL
Desktop

2XL
Large desktop
```

Illustrative web breakpoints:

```text
XS   < 360
SM   360–639
MD   640–1023
LG   1024–1279
XL   1280–1535
2XL  >= 1536
```

Do not treat these numbers as absolute requirements.

Use available width and layout constraints wherever possible.

---

# 5. WEB APP STRUCTURE

Primary web application shell:

```text
┌──────────────────────────────────────────────────────────────┐
│ TOP BAR                                                       │
│ Logo | Search | Notifications | Help | Profile               │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│ SIDEBAR       │              MAIN CONTENT                    │
│               │                                              │
│ Dashboard     │                                              │
│ Employees     │                                              │
│ Tasks         │                                              │
│ Projects      │                                              │
│ KRA           │                                              │
│ Kaizen        │                                              │
│ Announcements │                                              │
│ Chat          │                                              │
│ Reports       │                                              │
│ Security      │                                              │
│ Settings      │                                              │
│               │                                              │
├───────────────┴──────────────────────────────────────────────┤
│ OPTIONAL STATUS / FOOTER                                     │
└──────────────────────────────────────────────────────────────┘
```

Desktop should use:

```text
Left navigation
Top header
Main content
Optional contextual panel
```

---

# 6. WEB SIDEBAR

Sidebar must support:

```text
Expanded
Collapsed
Mobile drawer
```

Expanded:

```text
Logo
Dashboard

WORK
Tasks
Projects
KRA
Kaizen

PEOPLE
Employees
Organization

COMMUNICATION
Announcements
Chat

MANAGEMENT
Reports
Analytics

ADMIN
Security
Access Control
Settings
```

Do not hard-code visibility.

Sidebar is generated based on:

```text
permissions
role
organization scope
feature flags
```

---

# 7. WEB TOP BAR

Top bar:

```text
Logo / product name
Global search
Quick actions
Notifications
Help
Profile
```

Profile dropdown:

```text
My Profile
Privacy & Security
Sessions
Settings
Logout
```

Admin/Director can additionally see authorized controls.

---

# 8. GLOBAL SEARCH

Search should be available from the top navigation.

Search across authorized:

```text
Employees
Tasks
Projects
KRA
Kaizen
SOP
Announcements
Chat
Reports
```

Search results must respect authorization.

Never use global search as a data-access bypass.

---

# 9. MOBILE APPLICATION SHELL

Mobile should use:

```text
Status bar
Header
Content
Bottom navigation / contextual navigation
Floating action where appropriate
Bottom sheets
```

Primary employee navigation:

```text
Home
Tasks
Projects
Chat
Profile
```

Additional features remain available through:

```text
More / Menu
```

or contextual navigation.

Do not put 10–15 icons into a bottom tab bar.

---

# 10. ROLE-AWARE MOBILE NAVIGATION

### Employee

```text
Home
Tasks
Projects
Chat
Profile
```

Additional:

```text
Attendance
Leave
KRA
Kaizen
Training
Announcements
Notifications
Privacy
```

### Sub-HOD

```text
Home
Team
Tasks
Projects
Chat
Profile
```

### HOD

```text
Home
Team
Tasks
Projects
Chat
Profile
```

Additional:

```text
Attendance
Leave Approvals
KRA
Kaizen
SOP
Announcements
Reports
```

### HR

```text
Home
Employees
Tasks
Projects
Reports
Profile
```

### Director

```text
Executive Dashboard
Organization
Projects
Tasks
Chat
Profile
```

Additional:

```text
KRA
Kaizen
Announcements
Analytics
Reports
Security
Audit
```

### Admin

```text
Admin Dashboard
Employees
Organization
Access
Settings
Profile
```

Additional:

```text
Tasks
Projects
KRA Configuration
Kaizen Configuration
Announcements
Chat Management
Security
Audit
Imports
Exports
```

Actual visibility must be permission driven.

---

# 11. DESIGN SYSTEM

Create a reusable design system.

Recommended structure:

```text
packages/
└── design-system/
    ├── tokens/
    ├── colors/
    ├── typography/
    ├── spacing/
    ├── radius/
    ├── shadows/
    ├── icons/
    ├── components/
    └── patterns/
```

The React Native and Web applications should consume shared design tokens.

---

# 12. BRAND DIRECTION

Existing Sarthi direction:

```text
Background: off-white
Cards: white
Primary action: orange
Text: black / dark neutral
```

Keep this general direction, but create a formal token system rather than scattering raw colors through source code.

Example:

```text
color.background
color.surface
color.surfaceElevated
color.textPrimary
color.textSecondary
color.border
color.primary
color.primaryPressed
color.success
color.warning
color.danger
color.info
```

Do not hard-code colors inside individual components.

---

# 13. DARK MODE

Support architecture for:

```text
Light
Dark
System
```

Do not create a separate hard-coded dark UI.

Use semantic tokens:

```text
background.primary
surface.primary
text.primary
border.default
```

so themes can change centrally.

---

# 14. TYPOGRAPHY

Use a consistent hierarchy.

Example:

```text
Display
Page Title
Section Title
Card Title
Body
Body Small
Label
Caption
```

Typography must prioritize readability.

Avoid excessive font weights.

Do not load unnecessary custom fonts.

Use platform/system fonts unless a brand font is explicitly approved.

---

# 15. SPACING SYSTEM

Use a predictable spacing scale.

Example:

```text
4
8
12
16
20
24
32
40
48
64
```

Do not use arbitrary:

```text
13px
17px
23px
29px
```

throughout the UI.

Create spacing tokens.

---

# 16. CORNER RADIUS

Use a consistent hierarchy:

```text
Small controls
Medium cards
Large containers
Pills
```

Avoid every component having a different radius.

---

# 17. BUTTON SYSTEM

Support:

```text
Primary
Secondary
Tertiary
Danger
Ghost
Icon
Loading
Disabled
```

States:

```text
Default
Pressed
Focused
Disabled
Loading
Success
```

Never allow buttons to jump in size when loading.

---

# 18. FORM COMPONENTS

Reusable:

```text
Text Input
Number Input
Email Input
Phone Input
Password Input
Date Picker
Time Picker
Date Range
Dropdown
Searchable Dropdown
Multi-select
Checkbox
Radio
Switch
Slider
File Picker
Image Picker
Text Area
```

Every input needs:

```text
label
helper
error
required indicator
disabled
read-only
loading where applicable
```

---

# 19. RESPONSIVE FORMS

Desktop:

```text
2-column / 3-column form grid
```

Tablet:

```text
2-column
```

Mobile:

```text
1-column
```

Example:

```text
Desktop:
First Name | Last Name
Email      | Mobile
Department | Designation

Mobile:
First Name
Last Name
Email
Mobile
Department
Designation
```

Do not squeeze desktop forms into mobile.

---

# 20. TABLE SYSTEM

Web is optimized for tables.

Employee table:

```text
Employee
Code
Department
Designation
Manager
Status
Actions
```

Support:

```text
sorting
filtering
search
pagination
column visibility
bulk selection
bulk actions
export
```

For mobile, transform dense tables into:

```text
cards
lists
horizontal scroll
detail views
```

Do not simply force a 10-column desktop table onto a phone.

---

# 21. DATA DENSITY

Different roles require different density.

Admin:

```text
high information density
tables
filters
bulk actions
analytics
```

Employee:

```text
low/medium density
cards
lists
simple actions
```

Director:

```text
high-level KPIs
charts
trends
comparisons
```

---

# 22. EMPLOYEE LIST UI

Desktop:

```text
Header
Search
Filters
Bulk Actions

┌─────────────────────────────────────────────────────────┐
│ □ │ Employee │ Dept │ Designation │ Manager │ Status │⋮│
├─────────────────────────────────────────────────────────┤
│ □ │ Rahul    │ Prod │ Supervisor  │ Amit    │ Active │⋮│
│ □ │ Priya    │ HR   │ Executive   │ Suresh  │ Active │⋮│
└─────────────────────────────────────────────────────────┘
```

Mobile:

```text
Search

[ Employee Card ]
Avatar
Rahul
SRJ0012
Supervisor · Production
Manager: Amit
Active

[ Employee Card ]
```

---

# 23. EMPLOYEE DETAIL UI

Structure:

```text
Employee Header
 ├── Profile picture
 ├── Name
 ├── Employee Code
 ├── Designation
 └── Status

Tabs / Sections:

Overview
Employment
Organization
Reporting
Documents
Account
Access
Custom Fields
Activity
```

Desktop can use tabs.

Mobile can use:

```text
horizontal tab
segmented control
accordion
section cards
```

---

# 24. ADMIN UI

Admin should use an enterprise desktop layout.

Primary areas:

```text
Dashboard
Employees
Organization
Access Control
Documents
Imports / Exports
Tasks
Projects
KRA
Kaizen
Announcements
Chat Management
Security
Privacy
Settings
```

Use:

```text
tables
side panels
dialogs
drawers
bulk actions
advanced filters
```

Admin screens should not look like consumer mobile screens stretched onto desktop.

---

# 25. DIRECTOR DASHBOARD

Director needs an executive dashboard.

Desktop:

```text
┌────────────┬────────────┬────────────┬────────────┐
│ Employees  │ Attendance │ Projects   │ Tasks      │
│ 1,284      │ 94.2%      │ 28 Active  │ 81% Done  │
└────────────┴────────────┴────────────┴────────────┘

Attendance Trend

Department Performance

Project Status

KRA Overview

Kaizen Impact

Recent Important Announcements

Security Overview
```

On mobile, stack cards vertically.

---

# 26. HR DASHBOARD

Show:

```text
Headcount
New Joiners
Exits
Attendance
Leave
Employee Actions
Documents
Training
KRA
```

Use charts sparingly.

Do not turn every screen into a dashboard.

---

# 27. HOD DASHBOARD

Show:

```text
Team Headcount
Present
Absent
Pending Leave
Overdue Tasks
KRA Pending
Kaizen Pending
Projects
Announcements
```

Department-scoped data only.

---

# 28. EMPLOYEE HOME

Keep it simple.

Example:

```text
Good Morning, Rahul

Today's Attendance
09:12 AM

Leave Balance
12 Days

My Tasks
3 Pending

Projects
2 Active

KRA
Review Pending

Kaizen
1 Under Review

Announcements
2 New
```

Avoid overwhelming the user.

---

# 29. TASK UI

Task list:

```text
My Tasks
Team Tasks
Assigned
Created
Overdue
Completed
```

Task card:

```text
Title
Project
Priority
Owner
Due Date
Progress
Status
```

Task details:

```text
Overview
Description
Members
Subtasks
Attachments
Comments
Activity
Dependencies
```

---

# 30. GROUP TASK UI

Clearly distinguish:

```text
Owner
Lead
Members
Reviewer
```

Show:

```text
Overall Progress
Member Progress
Subtask Progress
```

Example:

```text
Rolling Mill Inspection

Owner       Amit
Lead        Rahul
Members     4
Progress    65%

Amit         ████████ 80%
Rahul        ██████   60%
Priya        █████    50%
```

---

# 31. PROJECT UI

Project layout:

```text
Project Header
 ├── Name
 ├── Status
 ├── Progress
 ├── Manager
 └── Dates

Tabs:

Overview
Milestones
Tasks
Members
Files
Chat
Activity
```

Desktop can show sidebar project navigation.

Mobile uses tabs/segmented navigation.

---

# 32. PROJECT DASHBOARD

Show:

```text
Project Progress
Timeline
Milestones
Tasks
Risks
Members
Budget where applicable
Files
Recent Activity
```

Statuses:

```text
Planned
Active
On Hold
At Risk
Completed
Cancelled
Closed
```

Use consistent status badges.

---

# 33. KRA UI

Do not finalize the UI around a fixed scoring formula yet.

The framework should support:

```text
KRA Cycle
KRA Areas
Targets
Measurements
Self Assessment
Manager Review
Director/Head Review
Finalization
```

KRA screen:

```text
KRA
 ├── Objectives
 ├── Targets
 ├── Actuals
 ├── Progress
 ├── Self Rating
 ├── Manager Rating
 └── Final Rating
```

Once SRJ Steel's exact KRA logic is provided, adapt the visualization to it.

Do not invent a scoring formula.

---

# 34. KAIZEN UI

Kaizen should feel manufacturing-oriented.

Submission form:

```text
Problem
Current Condition
Proposed Improvement
Expected Benefit
Department
Section
Category
Cost
Expected Saving
Attachments
```

Display:

```text
Before
 ↓
Improvement
 ↓
After
```

Dashboard:

```text
Submitted
Under Review
Approved
Implemented
Savings
```

Use before/after images prominently.

---

# 35. ANNOUNCEMENT UI

Announcement list:

```text
Pinned
Urgent
Recent
Department
HR
Safety
```

Card:

```text
Title
Priority
Date
Publisher
Target
Read status
Acknowledgement
```

Important notices can display:

```text
READ
ACKNOWLEDGED
```

---

# 36. CHAT UI — MOBILE

Main tabs:

```text
Chats
Calls
```

Chat list:

```text
Search chats

Pinned
Unread
Groups
Projects
Departments
Announcements

Conversation rows
```

Conversation row:

```text
Avatar
Name
Last message
Time
Unread count
Mute
Pinned
Draft
```

---

# 37. CHAT UI — DESKTOP

Use a 3-column layout when width allows:

```text
┌────────────────┬──────────────────────────┬──────────────────┐
│ Conversations  │ Current Conversation     │ Details          │
│                │                          │                  │
│ Search         │ Header                   │ Members          │
│                │                          │ Media            │
│ Rahul          │ Messages                 │ Files            │
│ Production     │                          │ Links            │
│ Project A      │                          │ Pinned           │
│ HR             │ Composer                 │ Settings         │
└────────────────┴──────────────────────────┴──────────────────┘
```

At smaller desktop/tablet width:

```text
Conversation list
        ↓
Conversation view
```

Hide the details panel behind a drawer.

---

# 38. CHAT UI — TABLET

Use:

```text
2-pane layout
```

Example:

```text
Conversation list | Active conversation
```

Details become a modal/drawer.

---

# 39. CHAT UI — PHONE

Use:

```text
Conversation list
        ↓
Chat screen
```

Do not attempt a permanent two-column layout.

---

# 40. CHAT MESSAGE BUBBLE

Message should show:

```text
sender
message
attachment
timestamp
delivery/read state
edited
reply preview
reactions
```

Long press:

```text
Reply
React
Forward
Copy
Star
Pin
Edit
Delete
Report
Select
```

Only show permitted actions.

---

# 41. CHAT COMPOSER

Desktop:

```text
[+] [😊] [Type a message................] [🎙] [Send]
```

Mobile:

```text
[+] [Type a message...........] [🎙]
```

When typing:

```text
Send button replaces voice button
```

Support:

```text
attachments
camera
gallery
documents
voice
poll
```

---

# 42. CHAT REPLY UI

When replying:

```text
┌─────────────────────────────────────┐
│ Replying to Rahul                   │
│ "Bearing inspection completed..."   │
├─────────────────────────────────────┤
│ Type a message...                   │
└─────────────────────────────────────┘
```

Tap reply preview:

```text
scroll to original
```

---

# 43. CHAT GROUP INFO UI

Show:

```text
Group image
Group name
Description

Members
Admins

Media
Files
Links

Pinned Messages
Search

Notifications
Permissions
```

Admin/group-owner controls:

```text
Edit group
Add member
Remove member
Promote admin
Demote admin
Transfer ownership
```

---

# 44. CHAT POLL UI

```text
Question

○ Option A
○ Option B
○ Option C

[ Vote ]

12 votes
```

For multiple answer:

```text
☐ Option A
☐ Option B
☐ Option C
```

After voting:

```text
Option A   █████████ 45%
Option B   █████     25%
Option C   ███       15%
Other      ███       15%
```

---

# 45. NOTIFICATION CENTER

Global notification screen:

```text
All
Mentions
Tasks
Leave
KRA
Announcements
Security
```

Notification card:

```text
Icon
Title
Description
Time
Read/unread
Action
```

Unread indicator:

```text
badge
```

Do not rely solely on color to indicate unread state.

---

# 46. SEARCH / FILTER UI

Desktop:

```text
Search
[Department ▼]
[Status ▼]
[Designation ▼]
[Date ▼]
[More Filters]
```

Mobile:

```text
Search
Filter button

Bottom Sheet:
Department
Status
Designation
Date
Apply
Clear
```

---

# 47. FILTER DRAWER

Desktop:

```text
┌──────────────────┐
│ Filters          │
├──────────────────┤
│ Department       │
│ Status           │
│ Designation      │
│ Job Grade        │
│ Date             │
│                  │
│ Clear     Apply  │
└──────────────────┘
```

Mobile uses bottom sheet.

---

# 48. MODAL / DIALOG RULES

Use modal for:

```text
confirmation
short form
quick edit
small data
destructive action
```

Use full-page route for:

```text
complex forms
large documents
multi-step workflows
large tables
```

Do not open an enormous form inside a tiny modal.

---

# 49. DRAWERS

Use drawers for:

```text
details
filters
secondary navigation
contextual information
desktop chat information
```

Mobile should generally use:

```text
bottom sheets
full-screen sheets
```

rather than tiny side drawers.

---

# 50. EMPTY STATES

Every list needs a meaningful empty state.

Example:

```text
No tasks yet

Your assigned tasks will appear here.

[Create Task]
```

Role-aware actions only.

Do not show blank screens.

---

# 51. ERROR STATES

Example:

```text
Unable to load employees

Please check your connection and try again.

[Retry]
```

Use:

```text
friendly message
technical logging behind the scenes
retry
```

Never expose stack traces.

---

# 52. LOADING STATES

Use:

```text
skeletons
spinners for short actions
progress bars for uploads
```

Avoid full-screen spinner for every small action.

---

# 53. OFFLINE STATES

Mobile needs:

```text
Offline indicator
Retry
Cached data where safe
Pending operation indicator
Sync status
```

Example:

```text
Offline
Changes will sync when you're back online.
```

---

# 54. FORM VALIDATION UX

Validation should happen:

```text
while editing where appropriate
on blur
on submit
server-side
```

Do not display all errors immediately before the user interacts.

Error:

```text
Department is required
```

not:

```text
Invalid field
```

---

# 55. TOASTS / SNACKBARS

Use for:

```text
success
small non-blocking error
background status
sync
```

Examples:

```text
Employee updated
Message sent
Import started
File uploaded
```

Do not use toast messages as the only way to communicate critical errors.

---

# 56. CONFIRMATION UX

For destructive operations:

```text
Delete employee?
```

Show:

```text
what will happen
whether deletion is reversible
```

For critical actions require stronger confirmation where appropriate.

Example:

```text
Type DELETE
```

for high-impact system operations.

---

# 57. FILE UPLOAD UI

Show:

```text
selected file
file type
size
progress
cancel
retry
success/failure
```

For multiple uploads:

```text
3 files
 ├── uploaded
 ├── uploading
 └── failed
```

---

# 58. DOCUMENT VIEWER

For employee documents:

```text
Document title
Category
Uploaded by
Date
Status
```

Actions:

```text
View
Download
Verify
Replace
Delete
```

Only authorized actions appear.

---

# 59. IMPORT UI

Excel import should be a guided experience.

```text
Step 1
Upload

Step 2
Mapping

Step 3
Preview

Step 4
Validation

Step 5
Confirm

Step 6
Processing

Step 7
Result
```

Desktop can use a horizontal stepper.

Mobile can use a vertical stepper.

---

# 60. RESPONSIVE IMPORT

Desktop:

```text
Excel Preview Table
```

Mobile:

```text
Row card
```

Do not force huge spreadsheets into a tiny viewport.

---

# 61. ADMIN ACCESS CONTROL UI

Screen:

```text
Access Control
├── Roles
├── Permissions
├── Permission Groups
├── Users
├── Scope
└── Effective Access
```

Role editor:

```text
Role
Description

Modules
 ├── Employees
 ├── Tasks
 ├── Projects
 ├── KRA
 └── ...

Actions
 ├── View
 ├── Create
 ├── Update
 ├── Delete
 ├── Approve
 └── Export
```

Use searchable permission lists.

---

# 62. EFFECTIVE ACCESS UI

Show:

```text
Employee
Role
Department
Section
Scope
```

Then:

```text
Granted permissions
Denied permissions
Source
```

Example:

```text
leave.approve
✓ Granted

Source:
HOD Manager Role

Scope:
Production Department
```

This is an Admin troubleshooting tool.

---

# 63. SECURITY DASHBOARD UI

Director/Admin:

```text
Security

Active Users
Active Sessions
Today's Logins
Failed Logins
Blocked Users
Blocked IPs
Suspicious Logins
```

Sections:

```text
Recent Logins
Active Sessions
Devices
IP Security
Security Events
Audit
Reports
```

---

# 64. LOGIN HISTORY UI

Desktop:

```text
Employee
Login
Logout
Duration
IP
Device
OS
Status
```

Filters:

```text
Employee
Department
IP
Device
Status
Date
```

Mobile:

```text
Login Session Card

Rahul
09:12 AM – 05:42 PM
Android
IP xxx.xxx.xxx.xxx
8h 30m
Active
```

---

# 65. SESSION CONTROL UI

Admin opens:

```text
Employee
 ↓
Security
 ↓
Active Sessions
```

Show:

```text
Device
IP
Login time
Last activity
Location estimate if available
App version
Status
```

Action:

```text
Revoke Session
```

For high-impact actions show confirmation.

---

# 66. PRIVACY UI

Settings:

```text
Privacy & Security
├── Privacy Policy
├── Terms
├── My Data
├── Download My Data
├── Request Correction
├── Delete Account
├── Consent History
└── Privacy Contact
```

This screen must be easily discoverable.

---

# 67. ACCESSIBILITY

Minimum standards:

```text
clear labels
keyboard navigation on web
screen-reader labels
focus states
sufficient contrast
large enough touch targets
semantic headings
accessible forms
```

Do not make important information available only through color.

---

# 68. TOUCH TARGETS

Mobile interactive elements should have sufficiently large touch areas.

Do not make:

```text
tiny icon
tiny checkbox
tiny menu button
```

hard to operate.

Use proper hit slop where required.

---

# 69. KEYBOARD / MOUSE SUPPORT

Web must support:

```text
Tab
Shift+Tab
Enter
Escape
Arrow keys where appropriate
Ctrl/Cmd + K for global search where appropriate
```

Tables should support keyboard selection.

Dialogs must trap and restore focus appropriately.

---

# 70. MOBILE GESTURES

Use familiar gestures carefully:

```text
swipe back
long press
pull to refresh
bottom sheet drag
horizontal tab swipe
```

Do not make critical functionality depend only on gestures.

Provide visible alternatives.

---

# 71. SAFE AREAS

React Native screens must correctly account for:

```text
notch
dynamic island
status bar
navigation bar
gesture area
keyboard
```

Never allow content to hide beneath system UI.

---

# 72. KEYBOARD HANDLING

Forms must handle:

```text
keyboard avoiding
scroll to focused input
dismiss keyboard
next-field navigation
submit from keyboard
```

Especially important on:

```text
Login
Employee Create
Task Create
KRA
Kaizen
Chat
```

---

# 73. PERFORMANCE

UI must remain responsive with:

```text
10,000+ employees
large task lists
large chat histories
large notification lists
large project lists
```

Use:

```text
virtualized lists
pagination
cursor pagination
memoization where useful
lazy loading
image optimization
skeleton loading
```

Do not render thousands of components at once.

---

# 74. CHAT PERFORMANCE

Chat must use:

```text
virtualized message list
cursor pagination
message grouping
image thumbnails
lazy media loading
optimistic send
reconnect sync
```

Do not re-render the complete conversation when one message changes.

---

# 75. ANIMATION

Use subtle animation.

Appropriate:

```text
navigation
modal
bottom sheet
message send
loading
success
```

Avoid excessive animation.

Enterprise software should feel fast, not theatrical.

---

# 76. RESPONSIVE CHARTS

Charts must adapt.

Desktop:

```text
wide chart
legend
filters
comparison
```

Mobile:

```text
simplified chart
horizontal scroll where required
summary values above chart
```

Never render tiny unreadable desktop charts on phones.

---

# 77. TABLE TO CARD TRANSFORMATION

For every desktop table define mobile representation.

Example:

Desktop:

```text
Employee | Department | Designation | Manager | Status
```

Mobile:

```text
Employee Card
Name
Code
Department
Designation
Manager
Status
Actions
```

This should be a deliberate design, not an accidental CSS wrap.

---

# 78. MASTER DETAIL LAYOUT

Desktop:

```text
List             Details
────────────────────────────
Employees   →    Employee Profile
Tasks       →    Task Details
Projects    →    Project Details
Chat        →    Conversation
```

Mobile:

```text
List
 ↓
Details
```

Back navigation returns to list state.

---

# 79. STATE PRESERVATION

When navigating:

```text
Employee list
 ↓
Employee
 ↓
Back
```

preserve:

```text
search
filter
sort
page/cursor where possible
scroll position
```

Same for:

```text
Tasks
Projects
Announcements
Chat
Reports
```

---

# 80. DEEP LINKING

Support links such as:

```text
sarthi://employee/{id}
sarthi://task/{id}
sarthi://project/{id}
sarthi://chat/{conversationId}
sarthi://announcement/{id}
```

And web-compatible routes where applicable.

Opening a push notification should take the user directly to the relevant resource.

Authorization must be checked after navigation.

---

# 81. PUSH NOTIFICATION UX

Example:

```text
Task Assigned
Rolling Mill inspection assigned to you.
```

Tap:

```text
open task
```

Another:

```text
New Chat Message
Rahul: "Inspection completed."
```

Tap:

```text
open conversation
```

Do not reveal private message content in a notification if privacy settings prohibit it.

---

# 82. DESIGN FOR FUTURE WEB + DESKTOP

Even if only React Native is built first, keep the API and design architecture ready for:

```text
Web
Desktop
Tablet
```

Do not embed mobile-only assumptions into backend models.

---

# 83. WEB RESPONSIVE MODES

### Wide desktop

```text
Sidebar
Main
Optional details panel
```

### Standard desktop

```text
Sidebar
Main
```

### Tablet

```text
Collapsed sidebar
Main
```

### Small tablet / mobile web

```text
Top header
Drawer
Single-column content
```

---

# 84. MOBILE RESPONSIVE MODES

### Small phone

```text
Single column
compact header
stacked cards
bottom navigation
```

### Large phone

```text
Single column
more spacing
2-column small widgets when useful
```

### Tablet

```text
2-column dashboard
2-pane list/detail
sidebar where appropriate
```

---

# 85. ROLE-SPECIFIC INFORMATION DENSITY

Do not use one UI density for all roles.

Employee:

```text
simple
action-oriented
minimal configuration
```

HOD:

```text
team-oriented
lists
approvals
status
```

HR:

```text
data-heavy
employee management
filters
documents
reports
```

Director:

```text
summary
KPIs
trends
comparisons
exceptions
```

Admin:

```text
configuration
tables
permissions
security
system control
```

---

# 86. EXCEPTION-FIRST DIRECTOR UX

Director dashboard should prioritize:

```text
What needs attention?
What is delayed?
What is at risk?
What changed?
What is abnormal?
```

Rather than only showing totals.

Example:

```text
5 Projects At Risk
12 Critical Tasks Overdue
3 Suspicious Logins
8 Pending KRA Finalizations
17 Unread Safety Acknowledgements
```

---

# 87. HOD EXCEPTION-FIRST UX

Show:

```text
Pending Leave
Overdue Tasks
Unrated KRA
Pending Kaizen
Unacknowledged Announcements
Absent Employees
```

---

# 88. EMPLOYEE ACTION-FIRST UX

Show:

```text
What do I need to do now?
```

Examples:

```text
Approve/Submit
Complete Task
Apply Leave
Rate KRA
Submit Kaizen
Acknowledge Notice
Reply to Chat
```

---

# 89. DESIGN TOKENS

Create tokens for:

```text
colors
spacing
typography
radius
shadows
z-index
animation
breakpoints
icon sizes
component heights
```

Example:

```text
button.height.sm
button.height.md
button.height.lg

input.height.md

avatar.sm
avatar.md
avatar.lg

spacing.xs
spacing.sm
spacing.md
spacing.lg
```

---

# 90. COMPONENT LIBRARY

Create reusable components such as:

```text
AppShell
Sidebar
TopBar
BottomNavigation

Button
IconButton
Input
Select
DatePicker
Switch
Checkbox

Card
StatCard
StatusBadge
Avatar
AvatarGroup

Table
DataList
ListItem
EmptyState
ErrorState
Skeleton

Modal
Dialog
Drawer
BottomSheet

Tabs
SegmentedControl
Accordion
Stepper

Toast
Snackbar
Tooltip

FileUploader
DocumentCard
ProgressBar

SearchBar
FilterBar
FilterSheet

Chart
KPI
Timeline
ActivityFeed
```

Do not duplicate components for each module.

---

# 91. COMPONENT API DESIGN

Components should expose semantic props.

Prefer:

```tsx
<Button variant="primary" loading />
```

instead of:

```tsx
<Button background="#F97316" radius={8} color="#FFF" />
```

The design system owns styling.

---

# 92. STATUS SYSTEM

Use centralized semantic statuses.

Example:

```text
success
warning
danger
info
neutral
```

Map business statuses to semantic UI statuses.

Example:

```text
ACTIVE → success
PENDING → warning
REJECTED → danger
IN_PROGRESS → info
CANCELLED → neutral
```

Do not manually choose colors in every module.

---

# 93. ICON SYSTEM

Use one consistent icon library.

Do not mix:

```text
random SVG
emoji
different icon packs
```

without a design-system reason.

Icons must have:

```text
tooltip on desktop where unclear
accessibility label
consistent size
consistent stroke/weight
```

---

# 94. AVATAR SYSTEM

Support:

```text
profile picture
initials fallback
status indicator
role/status badge
```

Sizes:

```text
XS
SM
MD
LG
XL
```

Group avatars can stack.

---

# 95. CARD SYSTEM

Use cards for:

```text
summary
employee
task
project
announcement
document
notification
```

Do not put every piece of information into a card.

Tables are better for dense administrative data.

---

# 96. MOBILE CARD DESIGN

Cards should prioritize:

```text
title
status
primary metadata
primary action
```

Secondary data goes inside detail view.

---

# 97. DESKTOP TABLE DESIGN

Do not place 20 columns by default.

Provide:

```text
essential columns
column chooser
horizontal scrolling
row action menu
bulk action bar
```

---

# 98. BULK ACTION UI

When rows are selected:

```text
3 selected

[Activate]
[Assign Department]
[Assign Manager]
[Export]
[More]
```

On mobile, use:

```text
selection mode
bottom action bar
```

---

# 99. APPROVAL UI

For Leave/KRA/Kaizen/SOP:

Desktop:

```text
Approval queue
 ├── Pending
 ├── Approved
 └── Rejected
```

Approval card:

```text
Employee
Request
Submitted
Reason
Attachments

[Approve] [Reject]
```

Rejection should allow a reason.

---

# 100. ACTIVITY TIMELINE

Reusable timeline:

```text
Today
09:12  Logged in
09:17  Task assigned
10:32  Task updated
12:20  Kaizen submitted
```

Use for:

```text
Employee
Task
Project
KRA
Kaizen
Complaint
Security
```

---

# 101. RESPONSIVE ADMIN TABLES

At large width:

```text
full columns
```

At medium width:

```text
hide low-priority columns
```

At small width:

```text
cards/list
```

Do not create dozens of horizontally-scrolling tables as the default mobile strategy.

---

# 102. MOBILE BOTTOM SHEET PATTERN

Use for:

```text
filters
sort
actions
employee quick actions
task actions
message actions
```

Bottom sheets should have:

```text
drag handle
title
content
primary action
safe dismissal
```

---

# 103. MOBILE DETAIL ACTIONS

Do not place 8 buttons in a row.

Use:

```text
Primary action
More menu
```

Example:

```text
Task
[Complete] [⋮]
```

---

# 104. DESKTOP SHORTCUTS

Where appropriate:

```text
N → New
/ → Search
Esc → Close
Enter → Confirm
```

Do not make shortcuts mandatory.

---

# 105. PERSISTENT FILTERS

Remember user filters where useful.

Example:

```text
Tasks
Department = Production
Status = Pending
```

Return to same state after opening task details.

---

# 106. TIME / DATE DISPLAY

Use localized and consistent formatting.

Examples:

```text
Today 10:30 AM
Yesterday
29 Aug 2026
29 Aug 2026, 10:30 AM
```

Use full date/time in detailed/audit views.

---

# 107. NUMBER DISPLAY

Format:

```text
1,284 employees
94.2%
₹1,25,000
```

Use consistent Indian locale formatting where applicable.

---

# 108. INDUSTRIAL / STEEL CONTEXT

Visual language should suit SRJ Steel.

Use subtle industrial cues:

```text
precision
structured grids
strong hierarchy
clean status indicators
operational dashboards
```

Do not use excessive:

```text
factory clipart
metal textures
heavy gradients
decorative industrial imagery
```

The application should look modern enterprise, not like a factory-control panel.

---

# 109. BRAND EMPHASIS

Sarthi should have a recognizable identity:

```text
Sarthi
SRJ Steel
```

Logo placement should be consistent.

Do not over-brand every screen.

---

# 110. LOGIN SCREEN

Responsive structure:

Desktop:

```text
┌──────────────────┬────────────────────────────┐
│ Sarthi Branding  │ Login Form                 │
│                  │                            │
│ Welcome to       │ Employee ID / Email        │
│ SRJ Steel        │ Password                   │
│ Sarthi HRMS      │                            │
│                  │ [Login]                    │
│                  │ Forgot Password             │
└──────────────────┴────────────────────────────┘
```

Mobile:

```text
Logo
Welcome
Employee ID
Password
Login
Forgot Password
Privacy / Terms
```

Do not cram decorative content into mobile.

---

# 111. AUTH LOADING

Login button:

```text
Login → Loading → Success
```

Avoid navigating before authentication state is securely established.

---

# 112. APP INITIALIZATION

On launch:

```text
Splash
 ↓
Load configuration
 ↓
Check session
 ↓
Load permissions
 ↓
Load user/employee
 ↓
Navigate
```

Routes:

```text
Authenticated
Not authenticated
Maintenance
Force update
Permission restricted
```

---

# 113. PERMISSION-AWARE UI

If user lacks permission:

```text
Do not show action
```

where hiding is appropriate.

For directly navigated URLs/deep links:

```text
Show Access Denied
```

But backend always enforces the permission.

---

# 114. ROLE CONFIGURATION WITHOUT CODE

Admin changes:

```text
HOD
```

permissions.

UI should adapt automatically through permission metadata.

Do not require developers to edit:

```text
navigation.ts
screen-access.ts
if(role === ...)
```

for ordinary role permission changes.

---

# 115. FEATURE FLAGS

UI should respect feature flags:

```text
chat_enabled
projects_enabled
voice_messages_enabled
video_calls_enabled
polls_enabled
```

Disabled feature:

```text
not visible to users
```

unless admin explicitly needs to configure it.

---

# 116. ACCESSIBILITY + ROLE

Accessible labels should remain available even when text is hidden.

Icon-only button:

```text
aria-label="Open notifications"
```

React Native:

```text
accessibilityLabel="Open notifications"
```

---

# 117. TESTING UI AT DEVICE SIZES

Every major screen must be tested at:

```text
360 × 800
390 × 844
430 × 932

768 × 1024
1024 × 1366

1280 × 720
1366 × 768
1440 × 900
1536 × 864
1920 × 1080
2560 × 1440
```

These are test targets, not hard-coded layouts.

---

# 118. ORIENTATION

Support:

```text
portrait
landscape
```

where useful.

Especially:

```text
tablets
dashboards
reports
chat
documents
```

Do not break layouts when orientation changes.

---

# 119. LARGE SCREEN BEHAVIOR

For monitors wider than 1920px:

Do not stretch content endlessly.

Use:

```text
max-width content container
centered layout
multi-column grid
optional side panels
```

Example:

```text
Main content max width
1440–1600px
```

depending on screen.

---

# 120. SMALL SCREEN BEHAVIOR

At very narrow width:

```text
remove secondary columns
stack content
collapse filters
use bottom sheets
shorten labels
```

Never allow horizontal overflow unless content genuinely requires it.

---

# 121. WEB MOBILE NAVIGATION

When viewport becomes small:

```text
Sidebar
   ↓
Drawer
```

Header:

```text
☰
Sarthi
Search
Notification
Profile
```

---

# 122. MOBILE TAB LIMIT

Keep bottom navigation to approximately:

```text
4–5 primary destinations
```

Move less-used areas into:

```text
More
Profile
Menu
```

---

# 123. USER FLOW PRINCIPLE

Every screen should answer:

```text
What is this?
What can I do?
What needs my attention?
What happens after I tap?
```

Avoid screens with dozens of equal-weight actions.

---

# 124. CONSISTENT CRUD UX

Every CRUD module should follow the same pattern:

```text
List
 ↓
Search / Filter
 ↓
Create
 ↓
Edit
 ↓
Detail
 ↓
Delete / Deactivate
 ↓
Restore where supported
```

Use the same UI pattern across:

```text
Employees
Departments
Designations
Job Grades
Tasks
Projects
Announcements
Document Categories
Roles
Permission Groups
```

---

# 125. DELETE UX

Prefer:

```text
Deactivate
```

for master data.

Use actual delete only where appropriate.

Show dependent records before destructive operations.

Example:

```text
Cannot delete Production Department.

248 active employees are assigned.
Please reassign employees first.
```

---

# 126. ADMIN CRUD TABLE STANDARD

Every admin table should provide:

```text
Title
Description
Search
Filter
Sort
Create
Row actions
Bulk actions
Pagination
Export where authorized
```

---

# 127. MOBILE CRUD STANDARD

Mobile lists should provide:

```text
Header
Search
Filter
List
Floating/primary Create
Swipe/overflow actions where appropriate
```

Do not rely only on swipe gestures.

---

# 128. FORM DRAFTS

For lengthy forms:

```text
Employee
Kaizen
KRA
Project
Task
```

support draft state where beneficial.

Warn before losing unsaved changes.

---

# 129. AUTOSAVE

Do not blindly autosave every field to the server.

Use autosave only where it has a clear benefit:

```text
drafts
chat
long-form Kaizen
long-form project documents
```

---

# 130. CONFIRM UNSAVED CHANGES

If user navigates away:

```text
Unsaved changes

Discard
Keep editing
```

Web:

```text
beforeunload
```

Mobile:

```text
navigation guard
```

---

# 131. ERROR RECOVERY

If API fails while editing:

```text
preserve form state
show error
allow retry
```

Do not reset the entire form.

---

# 132. NETWORK-AWARE UI

Show:

```text
online
offline
syncing
sync failed
```

Especially for:

```text
chat
task updates
forms
uploads
```

---

# 133. DESIGN SYSTEM DOCUMENTATION

Maintain a living UI specification:

```text
docs/design-system/
├── foundations.md
├── colors.md
├── typography.md
├── spacing.md
├── components.md
├── patterns.md
└── responsive.md
```

Every new component should be added to the design system before being duplicated elsewhere.

---

# 134. UI CODE ORGANIZATION

Recommended:

```text
apps/mobile/src/
├── screens/
├── components/
├── patterns/
├── layouts/
├── navigation/
├── hooks/
├── theme/
└── services/

apps/web/src/
├── pages/
├── components/
├── patterns/
├── layouts/
├── navigation/
├── hooks/
├── theme/
└── services/
```

Shared:

```text
packages/
├── design-system/
├── shared-types/
└── validation/
```

---

# 135. DO NOT DUPLICATE BUSINESS LOGIC

Frontend only handles:

```text
presentation
interaction
client state
```

Business rules remain in the API/domain layer.

Do not implement approval/business logic only in React Native.

---

# 136. UI SECURITY

Never rely on:

```text
hidden button
hidden screen
disabled UI
```

as security.

Backend must enforce.

---

# 137. PERFORMANCE BUDGET

Avoid:

```text
huge images
unnecessary re-renders
massive JS bundles
unoptimized icons
unnecessary network requests
```

Use:

```text
lazy loading
image resizing
list virtualization
memoization where useful
cache
pagination
```

---

# 138. IMAGE SYSTEM

For employee/profile/chat images:

```text
thumbnail
medium
full-size
```

Use the appropriate size based on screen.

Do not load 5 MB original images into tiny avatars.

---

# 139. DOCUMENT PREVIEW

Use thumbnails/previews where possible.

Heavy files should load only when opened.

---

# 140. CHAT MEDIA PERFORMANCE

Chat:

```text
thumbnail first
full image on open
video metadata first
stream/download on demand
```

Do not preload every conversation attachment.

---

# 141. FINAL UI ARCHITECTURE

The overall platform:

```text
                         SARTHI
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
             WEB                       MOBILE
              │                         │
       Responsive Shell          Native App Shell
              │                         │
       Shared Design System
              │
       ┌──────┼──────────────┐
       ▼      ▼              ▼
     ADMIN   MANAGEMENT    EMPLOYEE
       │         │             │
       └─────────┼─────────────┘
                 ▼
          Permission Engine
                 │
                 ▼
          Organization Scope
                 │
                 ▼
          Business Modules
                 │
    ┌────────────┼─────────────────────┐
    ▼            ▼          ▼          ▼
  Tasks       Projects     KRA       Kaizen
    │            │          │          │
    └────────────┼──────────┴──────────┘
                 ▼
       Announcements + Chat
                 │
                 ▼
        Notifications + Audit
```

---

# 142. MANDATORY DESIGN RULE

For every screen Claude creates, answer these before implementation:

```text
1. Who uses this screen?
2. What permissions are required?
3. What organization scope applies?
4. What is the primary action?
5. What information is essential?
6. What happens on mobile?
7. What happens on tablet?
8. What happens on desktop?
9. What happens on large desktop?
10. What happens when there is no data?
11. What happens during loading?
12. What happens when the network fails?
13. What happens when permission is denied?
14. What happens with very long data?
15. What happens with accessibility settings?
```

---

# 143. CLAUDE IMPLEMENTATION DIRECTIVE

Do not start by building random individual screens.

First establish:

```text
Design Tokens
 ↓
Theme
 ↓
Typography
 ↓
Spacing
 ↓
Layout System
 ↓
Responsive Breakpoints
 ↓
Component Library
 ↓
Navigation Shell
 ↓
Role-aware Navigation
 ↓
Common CRUD Patterns
 ↓
Module Screens
```

For each new module:

```text
Desktop UX
+
Tablet UX
+
Mobile UX
+
Loading
+
Empty
+
Error
+
Offline
+
Permission denied
+
Accessibility
```

must be considered.

The target experience is:

```text
WhatsApp-like ease of use
+
Telegram-like flexibility
+
Google/Microsoft-style productivity
+
ERP-grade information density
+
SRJ Steel operational clarity
```

The application must feel like **one unified Sarthi product across every device**, not separate screens built by different developers.

Do not hard-code role-based navigation or responsive layouts where configuration, permissions, or reusable responsive patterns can solve the problem.

Build the UI architecture once and reuse it throughout the entire HRMS.