# SARTHI HRMS — CHAT MODULE
## Production-Grade Enterprise Messaging System

You are building the **Chat module of SRJ Steel Sarthi HRMS**.

Treat this as a serious enterprise messaging platform inspired by the best interaction patterns of **WhatsApp and Telegram**, but designed specifically for:

- Employees
- Sub-HODs
- HODs
- HR
- Directors
- Admins
- Departments
- Sections
- Projects
- Tasks
- Company announcements
- Plant operations

Do not build a simple CRUD chat.

Build a **realtime, reliable, scalable, secure enterprise communication system**.

The chat must work naturally on the React Native mobile application and be architected so that a future web/desktop client can use the same backend.

---

# 1. PRIMARY OBJECTIVE

The Chat module should support:

```text
1-to-1 Messaging
Group Messaging
Department Chat
Section/Team Chat
Project Chat
Task Discussion
Announcements / Broadcast
Media Sharing
Documents
Voice Messages
Audio Calls
Video Calls
Reactions
Replies
Mentions
Forwarding
Editing
Deletion
Pinning
Starred Messages
Search
Read Receipts
Delivery Receipts
Typing Indicators
Presence
Disappearing Messages
Scheduled Messages
Polls
Links
Previews
Message Sharing
Drafts
Unread Counts
Notifications
Message Notifications
Admin Moderation
Security
Audit
Retention
Privacy Controls
```

The architecture must remain modular so new messaging features can be added without rewriting the entire chat system.

---

# 2. CORE ARCHITECTURE

Use:

```text
React Native
      ↓
API Client
      ↓
NestJS REST API
      +
Socket.IO Realtime
      ↓
Chat Services
      ↓
PostgreSQL
      +
Redis
      +
BullMQ
      +
MinIO / S3
```

Responsibilities:

### REST

Use REST for:

```text
conversation history
message history
search
media listing
conversation settings
group administration
message recovery
pagination
poll results
scheduled messages
drafts
preferences
```

### Socket.IO

Use realtime WebSocket events for:

```text
new message
message edit
message delete
typing
presence
delivery
read
reaction
group changes
call signaling
```

Never make the mobile app dependent exclusively on a WebSocket connection.

When WebSocket disconnects:

```text
App
 ↓
Reconnect
 ↓
Authenticate
 ↓
Get last known cursor
 ↓
Synchronize missed messages/events
```

---

# 3. CHAT TYPES

Support:

```text
DIRECT
GROUP
DEPARTMENT
SECTION
PROJECT
TASK
ANNOUNCEMENT_CHANNEL
```

---

# 4. DIRECT CHAT

Example:

```text
Employee A
     ↕
Employee B
```

Features:

```text
Text
Emoji
GIF
Sticker
Image
Video
Audio
Voice Message
Document
Contact-like employee reference
Location only if explicitly required
Poll
Link
Reply
Forward
Edit
Delete
React
Pin
Star
Copy
Share
Search
Read
Delivery
Typing
Presence
```

Direct conversations require authorization.

Do not assume employees can message everybody if business rules restrict communication.

---

# 5. GROUP CHAT

Example:

```text
Production Maintenance Team

Owner
 ├── HOD
 ├── Sub-HOD
 ├── Employee A
 ├── Employee B
 └── Employee C
```

Support:

```text
Group name
Group description
Group image
Group owner
Multiple admins
Members
Member roles
Join/leave
Add/remove members
Promote/demote admin
Transfer ownership
Mute
Archive
Pin group
Group search
Group media
Group files
Group links
Group permissions
```

---

# 6. GROUP MEMBER ROLES

Support:

```text
OWNER
ADMIN
MODERATOR
MEMBER
OBSERVER
```

Group permissions:

```text
send_messages
send_media
send_documents
send_polls
add_members
remove_members
edit_group
pin_messages
delete_messages
change_group_image
change_group_name
manage_admins
```

Permissions are configurable.

---

# 7. DEPARTMENT CHAT

Support system-managed or manually-created department conversations.

Example:

```text
Production
Maintenance
Quality
HR
Stores
Purchase
Finance
IT
```

Membership may be driven by:

```text
employee.department_id
employee.section_id
```

Admin/HOD may configure whether employees are automatically added/removed when organizational assignments change.

Do not silently expose private departmental conversations to administrators unless policy grants it.

---

# 8. SECTION / TEAM CHAT

Example:

```text
Production
  ↓
Rolling Mill
  ↓
Rolling Mill Team Chat
```

Membership should follow the configured section/team scope.

---

# 9. PROJECT CHAT

Every project can optionally have an associated conversation.

```text
Project
   ↓
Project Chat
   ↓
Project Members
```

Only project members and authorized managers can access it.

When a project member is added:

```text
Project member added
       ↓
Project chat access granted
```

When membership is removed:

```text
Project member removed
       ↓
Chat access updated
```

Existing message retention should follow policy.

---

# 10. TASK DISCUSSION CHAT

Tasks can have a discussion thread.

Example:

```text
Task
Rolling Mill Bearing Inspection
        ↓
Discussion
```

Task discussion participants:

```text
Owner
Members
Reviewer
Managers where authorized
```

Task discussion must inherit task authorization.

---

# 11. ANNOUNCEMENT CHANNELS

Provide a one-way communication model for organizational broadcasting.

Possible channels:

```text
Company
Plant
Department
Safety
HR
Training
Production
Emergency
```

Followers/readers should not automatically be able to reply.

They may support:

```text
Reaction
Poll vote
Read
Acknowledge
```

WhatsApp similarly separates Channels from normal two-way chats and supports text, images, video, stickers, links, audio and polls in channel updates.

Sarthi announcement channels should integrate with the separate Announcement module instead of duplicating announcement data.

---

# 12. MESSAGE TYPES

Support:

```text
TEXT
IMAGE
VIDEO
AUDIO
VOICE
DOCUMENT
GIF
STICKER
POLL
LOCATION
LINK
CONTACT
SYSTEM
CALL
ANNOUNCEMENT
FILE
```

Only enable message types that are actually required.

---

# 13. MESSAGE DATABASE MODEL

Recommended conceptual model:

```text
ChatMessage
├── id
├── conversation_id
├── sender_id
├── type
├── text
├── reply_to_id
├── forwarded_from_id
├── created_at
├── updated_at
├── edited_at
├── deleted_at
├── scheduled_at
├── expires_at
├── metadata
```

Do not put all optional data into uncontrolled JSON if a strongly relational model provides better integrity/querying.

---

# 14. MESSAGE DELIVERY STATES

Support:

```text
SENDING
SENT
DELIVERED
READ
FAILED
DELETED
EXPIRED
```

For mobile UX:

```text
Sending → ✓
Sent → ✓
Delivered → ✓✓
Read → ✓✓
```

The exact visual treatment can use the Sarthi design system.

---

# 15. MESSAGE IDs AND IDEMPOTENCY

Every client-generated message submission should have an idempotency/client identifier.

Example:

```text
client_message_id
```

This prevents duplicate messages when:

```text
network retries
WebSocket reconnects
mobile app retries HTTP request
```

Server must safely return the already-created message rather than creating duplicates.

---

# 16. REPLY TO MESSAGE

Support:

```text
Reply
Reply preview
Jump to original message
```

API:

```text
POST /api/v1/chat/messages/:id/reply
```

Realtime event:

```text
chat:message:new
```

Message should contain:

```text
reply_to_id
```

Do not duplicate the complete original message into every reply record.

---

# 17. FORWARD MESSAGE

Support forwarding to:

```text
Direct chat
Group
Project chat
Department chat
```

API:

```text
POST /api/v1/chat/messages/:id/forward
```

Validate destination authorization.

Preserve origin metadata according to privacy policy.

---

# 18. EDIT MESSAGE

Support:

```text
Edit
Edited indicator
Edit timestamp
```

API:

```text
PATCH /api/v1/chat/messages/:id
```

Store:

```text
edited_at
```

If message revision history is required, create a separate version model.

Do not overwrite audit evidence.

---

# 19. DELETE MESSAGE

Support two modes:

```text
Delete for me
Delete for everyone
```

Where policy permits.

API:

```text
DELETE /api/v1/chat/messages/:id
```

Do not physically destroy audit evidence when business/security retention requires it.

Use soft deletion/redaction.

---

# 20. MESSAGE RETENTION

Support configurable retention:

```text
Permanent
30 days
90 days
180 days
1 year
Custom
```

Do not automatically apply consumer-chat assumptions to enterprise records.

Retention can vary by:

```text
conversation type
organization
policy
legal requirement
security classification
```

---

# 21. DISAPPEARING MESSAGES

Support optional ephemeral conversations/messages.

Possible timers:

```text
24 HOURS
7 DAYS
30 DAYS
CUSTOM
```

WhatsApp currently supports disappearing-message timers such as 24 hours, 7 days and 90 days, with additional rules around kept messages and forwarded content.

For Sarthi, implementation must also respect:

```text
enterprise retention policy
legal hold
audit requirements
message classification
admin policy
```

A user cannot make a message disappear when organizational policy forbids it.

---

# 22. SCHEDULED MESSAGES

Support:

```text
Schedule message
Edit scheduled message
Cancel scheduled message
Send immediately
```

API:

```text
POST   /api/v1/chat/messages/schedule
GET    /api/v1/chat/conversations/:id/scheduled
PATCH  /api/v1/chat/messages/:id/scheduled
DELETE /api/v1/chat/messages/:id/scheduled
POST   /api/v1/chat/messages/:id/send-now
```

Use BullMQ for delivery.

Scheduled jobs must be idempotent.

Telegram supports scheduled messages and silent scheduled delivery; these are useful interaction patterns for Sarthi.

---

# 23. DRAFT MESSAGES

Support device/user drafts.

```text
GET   /api/v1/chat/drafts
POST  /api/v1/chat/drafts
PATCH /api/v1/chat/drafts/:id
DELETE /api/v1/chat/drafts/:id
```

Draft should synchronize across devices if multi-device support is enabled.

---

# 24. PINNED MESSAGES

Support:

```text
Pin
Unpin
View pinned messages
```

API:

```text
POST   /api/v1/chat/messages/:id/pin
DELETE /api/v1/chat/messages/:id/pin

GET /api/v1/chat/conversations/:id/pinned
```

Group permissions determine who can pin.

---

# 25. STARRED / SAVED MESSAGES

Users can save messages for themselves.

```text
POST   /api/v1/chat/messages/:id/star
DELETE /api/v1/chat/messages/:id/star

GET /api/v1/chat/starred
```

Starred messages are user-specific.

Do not expose another user's starred messages.

---

# 26. MESSAGE REACTIONS

Support:

```text
👍
❤️
😂
😮
😢
👏
🔥
custom configured reactions where appropriate
```

APIs:

```text
POST   /api/v1/chat/messages/:id/reactions
DELETE /api/v1/chat/messages/:id/reactions/:reaction
GET    /api/v1/chat/messages/:id/reactions
```

Support reaction counts.

Group administrators can have moderation authority if configured. Telegram supports reaction moderation in groups, including removal of reactions in current versions.

---

# 27. POLLS

Support:

```text
Question
Options
Single choice
Multiple choice
Anonymous
Non-anonymous
Vote
Change vote
Close poll
Results
```

WhatsApp supports multi/single-answer polls with up to 12 options; use current platform limits as inspiration rather than hard-coding consumer-app constraints.

Enterprise extensions:

```text
Department poll
Project poll
Attendance-style poll
Feedback poll
Safety poll
Training poll
```

---

# 28. POLL SECURITY

Validate:

```text
user belongs to conversation
poll is open
user is allowed to vote
duplicate voting rules
anonymous/non-anonymous policy
```

Once a poll is closed:

```text
No new votes
Results remain viewable according to permissions
```

---

# 29. MEDIA SHARING

Support:

```text
Photos
Videos
Audio
Voice
Documents
```

Use MinIO/S3.

Do not store binary media in PostgreSQL.

Database stores:

```text
file_id
message_id
storage_key
filename
mime_type
size
thumbnail_key
duration
width
height
```

---

# 30. IMAGE HANDLING

Support:

```text
preview
full-size
thumbnail
compression
multiple images
gallery
caption
download/share
```

Generate thumbnails asynchronously.

---

# 31. VIDEO HANDLING

Support:

```text
thumbnail
duration
size
preview
download
inline playback
```

Do not transcode large video synchronously in an HTTP request.

Use workers.

---

# 32. VOICE MESSAGES

Support:

```text
record
send
play
pause
resume
seek
duration
waveform
speed controls
download
forward
reply
```

Possible playback speeds:

```text
1x
1.5x
2x
```

Audio files go to object storage.

---

# 33. DOCUMENT SHARING

Support:

```text
PDF
Excel
Word
PowerPoint
ZIP where allowed
Images
Other approved business files
```

Metadata:

```text
filename
type
size
checksum
uploaded_by
created_at
```

Use secure signed download URLs.

---

# 34. LINK PREVIEWS

When a user sends a URL:

```text
URL
 ↓
Backend safe metadata fetch
 ↓
Title
Description
Image
Domain
```

Do not allow arbitrary SSRF.

Implement:

```text
URL validation
private-network blocking
DNS/IP checks
timeout
size limit
safe parser
```

---

# 35. EMPLOYEE MENTIONS

Support:

```text
@Rahul
@Amit
```

Group/team mentions if required:

```text
@Production
@Maintenance
@Everyone
```

But `@everyone` must require special permission.

Mention generates notification.

---

# 36. MESSAGE SEARCH

Provide:

```text
GET /api/v1/chat/search
```

Search by:

```text
text
sender
conversation
date
file type
message type
```

Example:

```text
/search?q=bearing
```

Support filters:

```text
from
to
sender
conversation
has:file
has:image
has:document
```

Search must apply authorization before returning results.

Do not leak messages from inaccessible conversations through global search.

---

# 37. CONVERSATION SEARCH

```text
GET /api/v1/chat/conversations?search=
```

Search:

```text
employee name
group name
department
project
```

---

# 38. CHAT MEDIA GALLERY

```text
GET /api/v1/chat/conversations/:id/media
GET /api/v1/chat/conversations/:id/files
GET /api/v1/chat/conversations/:id/links
```

Tabs:

```text
Media
Files
Links
```

This is a useful WhatsApp-style navigation pattern.

---

# 39. MESSAGE LINK / JUMP

Each message needs a stable reference.

Example:

```text
chat://conversation/{conversationId}/message/{messageId}
```

Support:

```text
tap search result
 ↓
open conversation
 ↓
jump to message
```

Also support future deep linking.

---

# 40. READ RECEIPTS

For direct messages:

```text
SENT
DELIVERED
READ
```

For groups:

```text
message
   ├── employee A → read
   ├── employee B → read
   └── employee C → unread
```

Avoid creating an uncontrolled row explosion.

Design group read-state efficiently.

---

# 41. READ-TO-CURSOR MODEL

Use conversation/member state such as:

```text
last_read_message_id
last_read_at
```

instead of storing one record for every message read when possible.

---

# 42. UNREAD COUNTS

Support:

```text
conversation unread
global unread
mention unread
priority unread
```

API:

```text
GET /api/v1/chat/unread
```

Conversation list:

```text
Production Team       12
Rahul                  2
Project Mill Upgrade   8
```

---

# 43. TYPING INDICATOR

Socket events:

```text
chat:typing
chat:stopped_typing
```

Do not persist every typing event in PostgreSQL.

Use ephemeral Socket.IO/Redis state.

---

# 44. PRESENCE

Support:

```text
ONLINE
OFFLINE
AWAY
BUSY
LAST_SEEN
```

Presence should be based on:

```text
WebSocket connection
heartbeat
last activity
```

Do not depend on a permanent `is_online=true/false` field.

---

# 45. PRIVACY-BASED PRESENCE

Allow policy-based settings:

```text
Who can see my online status?
Who can see my last seen?
```

Possible:

```text
Everyone
My contacts / permitted employees
My department
Nobody
```

Enterprise policy can override user preferences where required.

---

# 46. MUTE

Support:

```text
Mute conversation
Mute group
Mute mentions
Mute calls
Mute notifications
```

Durations:

```text
1 hour
8 hours
1 day
Until enabled
```

Settings should be stored per user per conversation.

---

# 47. ARCHIVE

Support:

```text
Archive chat
Unarchive chat
Archived conversations
```

Archived state is user-specific.

---

# 48. DELETE / CLEAR CHAT

Separate:

```text
Clear local/history view
Delete conversation for me
Leave group
Delete conversation where authorized
```

Do not confuse local UI removal with server-side data deletion.

Enterprise retention rules always apply.

---

# 49. BLOCKING USERS

Support an organizational policy-controlled block/messaging restriction if needed.

```text
POST /api/v1/chat/users/:id/block
POST /api/v1/chat/users/:id/unblock
GET  /api/v1/chat/blocked-users
```

This should cooperate with the global security system.

A blocked employee must not automatically bypass the block through group creation or another endpoint.

---

# 50. REPORT MESSAGE

Allow authorized users to report inappropriate/problematic content:

```text
POST /api/v1/chat/messages/:id/report
```

Report categories:

```text
SPAM
HARASSMENT
ABUSE
CONFIDENTIAL_DATA
SECURITY
POLICY_VIOLATION
OTHER
```

Reports go to authorized HR/Admin/security workflows.

---

# 51. MODERATION

Group and channel moderators can:

```text
delete message
remove member
mute member
restrict member
pin message
close poll
manage admins
```

All moderation actions must be audited.

---

# 52. ADMIN CHAT GOVERNANCE

Admin configuration area:

```text
Chat Settings
├── Enable / Disable Chat
├── Allow Direct Messages
├── Allow Groups
├── Allow External-style Links
├── Allow File Uploads
├── Maximum File Size
├── Allowed File Types
├── Message Retention
├── Disappearing Messages
├── Voice Messages
├── Audio Calls
├── Video Calls
├── Screen Sharing
├── Polls
├── Reactions
├── Forwarding
├── Message Editing
├── Message Deletion
├── User Blocking
├── Moderation
└── Notification Rules
```

Do not require a new software deployment for ordinary policy changes.

---

# 53. ADMIN MUST NOT AUTOMATICALLY READ PRIVATE CHATS

Important enterprise privacy rule:

```text
ADMIN ≠ automatic access to private messages
DIRECTOR ≠ automatic access to private messages
HR ≠ automatic access to private messages
```

Private chat access must require:

```text
explicit permission
+
approved policy
+
authorized workflow
```

Where access is permitted for a security investigation, create a strong audit trail.

---

# 54. CONTENT PROTECTION

Consider a setting for:

```text
Disable forwarding
Disable saving
Restrict screenshots where technically supported
Restrict downloads
Restrict copying
```

Telegram has content-protection controls such as no-forwarding settings; Sarthi should implement enterprise-friendly equivalents where technically reliable, without promising controls the operating system cannot enforce.

Important:

Mobile OS-level screenshot prevention has platform limitations.

Never claim that screenshots are impossible when they are not.

---

# 55. SECRET / CONFIDENTIAL CHAT

Consider configurable conversation classification:

```text
NORMAL
CONFIDENTIAL
RESTRICTED
```

For restricted conversations:

```text
no forwarding
limited downloads
short retention
restricted members
enhanced audit
```

This should be a policy feature rather than a hidden special case.

---

# 56. CHAT SECURITY

Implement:

```text
authentication
authorization
conversation membership
message ownership
rate limiting
spam protection
file validation
malware scanning architecture
access control
audit logging
secure storage
signed file URLs
input validation
```

Never trust:

```text
conversationId
recipientId
senderId
message ownership
role
```

from the client.

---

# 57. RATE LIMITING

Rate-limit:

```text
message sending
file upload
group creation
group member addition
message search
poll creation
reactions
reports
```

Handle abusive clients without blocking legitimate users.

---

# 58. MESSAGE ORDERING

Messages must have reliable ordering.

Use server-side timestamps plus a monotonic/sequencing approach where required.

Do not rely entirely on device clocks.

Handle:

```text
offline message
reconnection
simultaneous messages
multiple devices
```

---

# 59. OFFLINE SUPPORT

When the app is offline:

```text
compose
draft
queue outgoing messages
```

Upon reconnect:

```text
authenticate
reconnect socket
send queued messages
deduplicate
sync missed messages
update delivery state
```

Messages must not duplicate.

---

# 60. MULTI-DEVICE

Design the backend for:

```text
Android phone
iPhone
Future web client
Future desktop client
```

A user's message state should be synchronized where appropriate.

Track devices separately.

---

# 61. CHAT NOTIFICATIONS

Notification channels:

```text
In-App
Firebase FCM
Email via Nodemailer where configured
```

Events:

```text
new_message
mention
reply
group_added
group_role_changed
call_incoming
```

Notification preferences:

```text
all messages
mentions only
muted
high priority only
```

Do not expose message content in notifications if privacy settings prevent it.

---

# 62. FIREBASE NOTIFICATION DESIGN

Use Firebase Cloud Messaging.

For each device:

```text
user_id
device_id
fcm_token
platform
app_version
last_seen
```

Never send notifications directly from the mobile app.

Flow:

```text
Chat Service
     ↓
Notification Event
     ↓
Notification Worker
     ↓
FCM
     ↓
Device
```

---

# 63. EMAIL NOTIFICATION DESIGN

Use Nodemailer for application email.

Do not send every chat message as email.

Email should be configurable for events such as:

```text
mention
important announcement
missed high-priority message
security event
administrative notification
```

All email should go through the centralized EmailService.

---

# 64. AUDIO / VIDEO CALLS

The chat module integrates with WebRTC calls.

Support:

```text
1-to-1 voice
1-to-1 video
group calls if later approved
incoming call
ringing
accept
reject
busy
cancel
end
reconnect
call history
```

WhatsApp currently provides voice/video calling, group calling, call links, screen sharing and desktop calling capabilities; these are useful reference behaviors for the Sarthi call UX.

Do not route WebRTC media through the normal NestJS API.

Use WebSocket/Socket.IO for signaling.

---

# 65. SCREEN SHARING

If implemented:

```text
start
stop
permission
call state
```

Use native/WebRTC capabilities.

Do not store the screen stream on the application server.

---

# 66. CALL HISTORY

```text
GET /api/v1/calls/history
```

Record:

```text
caller
recipient / participants
call type
started_at
answered_at
ended_at
duration
status
```

Do not record call media unless the product explicitly adds a reviewed recording feature.

---

# 67. GROUP CALLS — FUTURE READY

Data model should not prevent:

```text
1-to-1
3 participants
10 participants
32 participants
```

But do not implement large-scale group calling until media architecture is designed for it.

For large groups, consider an SFU architecture rather than pure peer-to-peer mesh.

---

# 68. CHAT NAVIGATION

Recommended bottom/top structure:

```text
Chat
├── All
├── Unread
├── Groups
├── Projects
├── Departments
├── Announcements
└── Archived
```

Potential tabs:

```text
Chats
Calls
```

---

# 69. CHAT LIST

Each row:

```text
Avatar
Name
Last message preview
Timestamp
Unread count
Mute indicator
Pinned indicator
Draft indicator
Online state where appropriate
Priority indicator
```

Sorting:

```text
latest activity
pinned
unread
```

---

# 70. CHAT SCREEN

Header:

```text
Back
Avatar
Name
Online/last seen
Search
Call
Video
More
```

Message area:

```text
Date separator
Message bubble/card
Reply preview
Attachment preview
Reaction summary
Delivery state
Timestamp
```

Composer:

```text
Emoji
Attachment
Camera
Voice
Text input
Poll
Send
```

Use long-press:

```text
Reply
Forward
Copy
React
Star
Pin
Edit
Delete
Report
Select
```

Actions must be permission aware.

---

# 71. MESSAGE SELECTION MODE

Support selecting multiple messages:

```text
Forward
Delete
Star
Share
```

Do not allow bulk operations that violate authorization.

---

# 72. MEDIA PREVIEW

Support:

```text
image viewer
video player
audio player
document viewer
download
share
forward
reply
```

Avoid automatically downloading very large files.

---

# 73. PHOTO / VIDEO COMPRESSION

Before upload:

```text
optional compression
resolution control
size estimation
progress
cancel
retry
```

Original quality can be preserved when business policy requires it.

---

# 74. UPLOAD PROGRESS

Show:

```text
0%
25%
50%
75%
100%
```

Handle:

```text
cancel
retry
network lost
resume where technically supported
```

---

# 75. LARGE FILE SUPPORT

Use multipart/resumable upload for large files.

Do not upload 1 GB files through one ordinary JSON request.

Use:

```text
pre-signed upload URL
multipart upload
chunking
background worker where needed
```

---

# 76. CHAT API — CONVERSATIONS

```text
GET    /api/v1/chat/conversations
GET    /api/v1/chat/conversations/:id

POST   /api/v1/chat/conversations
PATCH  /api/v1/chat/conversations/:id
DELETE /api/v1/chat/conversations/:id

POST   /api/v1/chat/direct
```

---

# 77. CHAT API — MESSAGES

```text
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

POST   /api/v1/chat/messages/:id/reactions
DELETE /api/v1/chat/messages/:id/reactions/:reaction
```

---

# 78. CHAT API — GROUPS

```text
POST   /api/v1/chat/groups
GET    /api/v1/chat/groups/:id
PATCH  /api/v1/chat/groups/:id
DELETE /api/v1/chat/groups/:id

GET    /api/v1/chat/groups/:id/members
POST   /api/v1/chat/groups/:id/members
DELETE /api/v1/chat/groups/:id/members/:employeeId

PATCH  /api/v1/chat/groups/:id/members/:employeeId/role

POST   /api/v1/chat/groups/:id/leave

POST   /api/v1/chat/groups/:id/transfer-ownership
```

---

# 79. CHAT API — READ / UNREAD

```text
POST /api/v1/chat/conversations/:id/read
GET  /api/v1/chat/unread
GET  /api/v1/chat/starred
GET  /api/v1/chat/pinned
```

---

# 80. CHAT API — SEARCH / MEDIA

```text
GET /api/v1/chat/search
GET /api/v1/chat/conversations/:id/media
GET /api/v1/chat/conversations/:id/files
GET /api/v1/chat/conversations/:id/links
```

---

# 81. CHAT API — SCHEDULED / DRAFTS

```text
POST   /api/v1/chat/messages/schedule
GET    /api/v1/chat/conversations/:id/scheduled
PATCH  /api/v1/chat/messages/:id/scheduled
DELETE /api/v1/chat/messages/:id/scheduled

GET    /api/v1/chat/drafts
POST   /api/v1/chat/drafts
PATCH  /api/v1/chat/drafts/:id
DELETE /api/v1/chat/drafts/:id
```

---

# 82. CHAT API — POLLS

```text
POST   /api/v1/chat/conversations/:id/polls
GET    /api/v1/chat/polls/:id
POST   /api/v1/chat/polls/:id/vote
POST   /api/v1/chat/polls/:id/close
GET    /api/v1/chat/polls/:id/results
```

---

# 83. CHAT API — PRESENCE

```text
GET  /api/v1/chat/presence
GET  /api/v1/chat/presence/:employeeId
POST /api/v1/chat/presence/heartbeat
```

Presence realtime events:

```text
presence:online
presence:offline
presence:away
```

---

# 84. CHAT API — MUTE / ARCHIVE

```text
POST   /api/v1/chat/conversations/:id/mute
DELETE /api/v1/chat/conversations/:id/mute

POST   /api/v1/chat/conversations/:id/archive
DELETE /api/v1/chat/conversations/:id/archive
```

---

# 85. CHAT API — REPORTING / MODERATION

```text
POST /api/v1/chat/messages/:id/report

GET  /api/v1/chat/moderation/reports
GET  /api/v1/chat/moderation/reports/:id
POST /api/v1/chat/moderation/reports/:id/resolve
```

Authorized moderators only.

---

# 86. SOCKET.IO EVENTS

Connection:

```text
chat:connect
chat:disconnect
```

Messages:

```text
chat:message:new
chat:message:updated
chat:message:deleted
```

Typing:

```text
chat:typing
chat:stopped_typing
```

Read/delivery:

```text
chat:message:delivered
chat:message:read
```

Reactions:

```text
chat:reaction:added
chat:reaction:removed
```

Conversation:

```text
chat:conversation:created
chat:conversation:updated
chat:conversation:archived
```

Groups:

```text
chat:group:created
chat:group:updated
chat:group:member-added
chat:group:member-removed
chat:group:role-changed
```

Polls:

```text
chat:poll:created
chat:poll:voted
chat:poll:closed
```

Presence:

```text
presence:online
presence:offline
presence:away
```

Calls:

```text
call:incoming
call:ringing
call:offer
call:answer
call:ice-candidate
call:accepted
call:rejected
call:busy
call:ended
```

---

# 87. CURSOR PAGINATION

Chat history must use cursor pagination.

Example:

```text
GET /api/v1/chat/conversations/:id/messages?cursor=<cursor>&limit=50
```

Response:

```json
{
  "items": [],
  "nextCursor": "...",
  "hasMore": true
}
```

Do not use page-number pagination for high-volume message history.

---

# 88. MESSAGE SYNC

Support synchronization:

```text
last_synced_message_id
last_synced_at
cursor
```

On reconnect:

```text
Socket reconnect
   ↓
Authenticate
   ↓
Request sync
   ↓
Receive missed events/messages
   ↓
Update local state
```

---

# 89. REDIS RESPONSIBILITIES

Redis may be used for:

```text
presence
typing indicators
rate limiting
pub/sub
Socket.IO scaling
temporary delivery state
job queues
```

Do not use Redis as the permanent message source of truth.

PostgreSQL remains authoritative for persisted chat data.

---

# 90. BULLMQ RESPONSIBILITIES

Use BullMQ for:

```text
push notifications
email notifications
scheduled messages
media processing
thumbnail generation
virus scanning integration
retention cleanup
message expiration
large exports
large imports
```

---

# 91. DATABASE STRUCTURE

Recommended conceptual models:

```text
ChatConversation
ChatConversationMember
ChatMessage
ChatMessageAttachment
ChatMessageReaction
ChatMessageReadState
ChatMessageStar
ChatPinnedMessage
ChatDraft
ChatScheduledMessage
ChatPoll
ChatPollOption
ChatPollVote
ChatGroupSettings
ChatGroupMemberRole
ChatPresence
ChatMute
ChatReport
ChatModerationAction
```

Do not blindly create all tables if a normalized design can safely combine models.

---

# 92. CONVERSATION MODEL

Conversation:

```text
id
type
name
description
image_file_id
created_by
project_id
task_id
department_id
section_id
created_at
updated_at
archived_at
deleted_at
```

---

# 93. CONVERSATION MEMBER MODEL

```text
conversation_id
user_id
role
joined_at
left_at
last_read_message_id
last_read_at
muted_until
archived_at
```

Use constraints to prevent duplicate active memberships.

---

# 94. MESSAGE ATTACHMENT MODEL

```text
id
message_id
file_id
type
filename
mime_type
size
thumbnail_file_id
duration
width
height
created_at
```

---

# 95. CHAT AUTHORIZATION MODEL

For every request:

```text
Authenticated?
       ↓
Has chat permission?
       ↓
Conversation exists?
       ↓
User is a member / otherwise explicitly authorized?
       ↓
Organization/resource scope valid?
       ↓
Message ownership/policy valid?
       ↓
Action allowed?
```

Examples:

### Employee sends group message

```text
chat.send
+
group membership
=
ALLOW
```

### Non-member tries to read group

```text
group membership = false
=
DENY
```

### HOD opens project chat

```text
project membership or authorized management scope
+
chat.view
=
ALLOW
```

---

# 96. CHAT + ORGANIZATION AUTHORIZATION

The chat system must understand:

```text
Company
Plant
Division
Department
Section
Project
Task
Employee
```

This allows:

```text
Department chat
Section chat
Project chat
Task discussion
```

without duplicating authorization logic.

---

# 97. CHAT + EMPLOYEE LIFECYCLE

When an employee changes department:

```text
Old Department
      ↓
New Department
```

The system must apply the configured membership rules.

Do not automatically remove historical message access without policy.

When employee exits:

```text
Account disabled
Sessions revoked
New messages restricted
Membership updated
Historical messages handled by retention policy
```

---

# 98. CHAT + PROJECT LIFECYCLE

When project:

```text
PLANNED
ACTIVE
COMPLETED
CLOSED
```

chat behavior should be configurable.

Example:

```text
Project closed
 ↓
Chat becomes read-only
```

This may be preferable to deleting project discussions.

---

# 99. CHAT + TASK LIFECYCLE

Task discussion may become:

```text
ACTIVE
SUBMITTED
COMPLETED
ARCHIVED
```

When completed:

```text
discussion retained
```

or:

```text
read-only
```

according to configuration.

---

# 100. CHAT + ANNOUNCEMENT

Do not duplicate announcement data.

Use:

```text
Announcement Service
        ↓
Target Resolver
        ↓
Notification
        +
Optional channel message
```

Announcement read/acknowledgement remains owned by Announcement module.

---

# 101. CHAT + NOTIFICATIONS

Use one shared notification service.

Example:

```text
Chat message
  ↓
Notification Service
  ├── In-app notification
  ├── Firebase FCM
  └── Email where configured
```

Avoid sending duplicate notifications when the app is actively viewing the conversation.

---

# 102. CHAT + PRIVACY

Chat must respect:

```text
privacy policy
retention policy
account deletion
data export
data access
security audit
```

A user's deletion process must follow the organization's documented rules.

Do not blindly delete messages belonging to other users.

---

# 103. ACCOUNT DELETION AND CHAT

When employee account deletion occurs:

```text
User identity
     ↓
Retention evaluation
     ↓
Delete / anonymize / retain
```

Possible behavior:

```text
"Rahul" → "Deleted User"
```

for retained enterprise messages.

The actual behavior must be documented and consistent with the approved retention/privacy policy.

---

# 104. AUDIT EVENTS

Track important events:

```text
CHAT_CONVERSATION_CREATED
CHAT_MEMBER_ADDED
CHAT_MEMBER_REMOVED

CHAT_MESSAGE_SENT
CHAT_MESSAGE_EDITED
CHAT_MESSAGE_DELETED

CHAT_MESSAGE_FORWARDED
CHAT_MESSAGE_PINNED
CHAT_MESSAGE_UNPINNED

CHAT_GROUP_CREATED
CHAT_GROUP_UPDATED
CHAT_ADMIN_CHANGED

CHAT_POLL_CREATED
CHAT_POLL_CLOSED

CHAT_REPORT_CREATED
CHAT_REPORT_RESOLVED

CHAT_ADMIN_ACTION
CHAT_RETENTION_ACTION
```

Do not log every typing event.

---

# 105. SECURITY AUDIT

Security-sensitive events:

```text
private conversation access
moderator message deletion
admin intervention
membership override
bulk message deletion
message export
privacy request
retention deletion
security investigation access
```

These require stronger audit records than normal message activity.

---

# 106. CHAT EXPORT

Authorized users may export chat data where policy permits.

```text
POST /api/v1/chat/exports
GET  /api/v1/chat/exports
GET  /api/v1/chat/exports/:id
GET  /api/v1/chat/exports/:id/download
```

Export:

```text
messages
attachments metadata
timestamps
participants
```

Sensitive exports must be permission-controlled and audited.

---

# 107. CHAT ADMIN REPORTS

Provide:

```text
total conversations
active conversations
messages per day
active users
group count
department chats
project chats
storage usage
top message types
failed messages
reported messages
moderation actions
```

Do not expose private message contents in analytics by default.

---

# 108. CHAT SEARCH SECURITY

Global search must never become a privacy bypass.

Example:

```text
Employee A
searches "salary"
```

The response must contain only messages A is entitled to access.

Never:

```text
database full-text search
      ↓
return matching rows
```

without authorization filtering.

---

# 109. CHAT PERFORMANCE

Design for:

```text
10,000+ employees
millions of messages
high concurrent WebSocket connections
large media volume
```

Use:

```text
indexes
cursor pagination
partitioning where justified
connection pooling
Redis pub/sub
efficient serialization
background jobs
object storage
```

Do not prematurely partition everything.

Measure real query performance.

---

# 110. CHAT DATABASE INDEXES

Likely indexes:

```text
ChatMessage(conversation_id, created_at)
ChatMessage(sender_id, created_at)
ChatConversationMember(user_id, conversation_id)
ChatMessage(reply_to_id)
ChatMessageAttachment(message_id)
ChatMessageReaction(message_id)
ChatPollVote(poll_id, user_id)
```

Add indexes based on actual query plans.

---

# 111. FULL-TEXT SEARCH

PostgreSQL full-text search may be sufficient initially.

Design so a dedicated search engine can be introduced later if message volume requires it.

Do not introduce Elasticsearch/OpenSearch without a measurable need.

---

# 112. CHAT UX DETAILS

Message bubble should show:

```text
sender
avatar where appropriate
message
attachment
reply preview
reaction
timestamp
edited
delivery status
```

Long press menu:

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

Only show actions the user is authorized to perform.

---

# 113. REPLY UI

Display:

```text
Original sender
Original message preview
Current reply
```

Tap preview:

```text
scroll to original message
```

If original was deleted:

```text
Original message unavailable
```

Do not expose deleted sensitive content.

---

# 114. GROUP INFO SCREEN

Show:

```text
Group image
Name
Description

Members
Admins

Media
Files
Links

Pinned Messages

Notifications
Permissions

Leave Group
Report
```

Admin-only:

```text
Edit group
Add/remove members
Manage admins
Group permissions
Retention configuration where permitted
```

---

# 115. CONTACT / EMPLOYEE CHAT

From Employee Profile:

```text
Message
Call
Video Call
```

But button visibility is permission-aware.

Do not show "Message" if policy forbids direct communication.

---

# 116. PROJECT CHAT UI

Project detail:

```text
Project
 ├── Overview
 ├── Members
 ├── Milestones
 ├── Tasks
 ├── Files
 └── Chat
```

Task:

```text
Task
 ├── Details
 ├── Attachments
 ├── Activity
 └── Discussion
```

This makes chat part of the work context.

---

# 117. ANNOUNCEMENT CHANNEL UI

Channel:

```text
Channel Header
Followers
Posts
Polls
Media
```

Possible actions:

```text
Follow
Unfollow
React
Vote
Acknowledge
Mute
Search
```

No public reply unless channel policy allows comments.

---

# 118. MESSAGE CONTEXT MENU

For a message, dynamically determine:

```text
Can Reply?
Can Forward?
Can Edit?
Can Delete?
Can React?
Can Star?
Can Pin?
Can Report?
```

Do not simply render every button and reject later.

But remember:

**UI restriction is not authorization.**

Backend must repeat the authorization decision.

---

# 119. CHAT SETTINGS

User settings:

```text
Notifications
Read receipts
Typing indicators
Presence
Last seen
Media auto-download
Data usage
Download location
Chat wallpaper/theme
Font size where supported
Enter-to-send
Privacy
Blocked users
Archived chats
```

Do not overbuild settings that are irrelevant to enterprise HRMS.

---

# 120. CHAT WALLPAPER / THEMES

Optional.

Allow:

```text
Default Sarthi theme
Light
Dark
Per-conversation theme
```

Do not allow user themes to break accessibility.

---

# 121. ACCESSIBILITY

Support:

```text
screen readers
large text
contrast
touch target sizes
captions / transcription where applicable
keyboard navigation for future web
```

---

# 122. LOCALIZATION

Design text/UI for future:

```text
English
Hindi
Marathi
```

Do not hard-code user-visible strings inside business logic.

---

# 123. ERROR HANDLING

Examples:

```text
CHAT_CONVERSATION_NOT_FOUND
CHAT_NOT_A_MEMBER
CHAT_PERMISSION_DENIED
CHAT_MESSAGE_NOT_FOUND
CHAT_MESSAGE_EDIT_WINDOW_EXPIRED
CHAT_MESSAGE_ALREADY_DELETED
CHAT_FILE_TOO_LARGE
CHAT_FILE_TYPE_NOT_ALLOWED
CHAT_RATE_LIMITED
CHAT_GROUP_MEMBER_LIMIT
CHAT_POLL_CLOSED
CHAT_SCHEDULE_INVALID
```

Return the project's standard API error shape.

---

# 124. MESSAGE EDIT RULE

Editing can be controlled by:

```text
message owner
admin/moderator
time window
conversation policy
```

Example:

```text
Employee:
edit own text for 15 minutes

Group admin:
edit only system/group-generated content
```

But use configurable policy.

---

# 125. MESSAGE DELETE RULE

Possible configuration:

```text
sender can delete for everyone within X minutes
admin can delete according to moderation policy
after retention lock, deletion becomes redaction
```

Never allow a normal user to override legal/security retention.

---

# 126. ANTI-SPAM

Implement:

```text
per-user rate limits
message burst control
group add limits
mass mention limits
file upload limits
duplicate message detection
```

Flag suspicious activity without unnecessarily blocking legitimate users.

---

# 127. MASS MENTION PROTECTION

Do not allow every employee to:

```text
@everyone
```

Require:

```text
permission
```

Possible use:

```text
HR announcement
Emergency safety alert
Department urgent notice
```

---

# 128. SECURITY CLASSIFICATION

Optional message metadata:

```text
NORMAL
CONFIDENTIAL
RESTRICTED
```

Classification may influence:

```text
forwarding
downloads
retention
exports
admin access
notifications
```

Do not expose classification rules in a way that lets a user bypass them.

---

# 129. CHAT BACKUP / RECOVERY

Server-side authoritative history must be recoverable through normal database/storage backup.

Do not rely only on mobile backups.

Infrastructure must back up:

```text
PostgreSQL
Object storage metadata/content
Chat configuration
```

---

# 130. DISASTER RECOVERY

Plan:

```text
database backup
object storage backup
restore testing
Redis rebuildability
queue rebuildability
Socket reconnect
message recovery
```

Redis should be treated as rebuildable infrastructure, not the only copy of critical message data.

---

# 131. WEB / DESKTOP READY

Although the first client is React Native, API design should not assume mobile-only behavior.

Future:

```text
React Web
Desktop
Tablet
```

can use:

```text
same REST API
same Socket.IO
same authorization
same conversation model
```

---

# 132. TESTING

## Unit tests

```text
message authorization
message ownership
group permissions
scope policies
poll rules
retention rules
message state transitions
idempotency
```

## Integration tests

```text
create DM
create group
send message
reply
edit
delete
react
forward
pin
star
search
read
upload
poll
schedule
```

## Realtime tests

```text
send event
receive event
reconnect
sync
typing
presence
delivery
read
```

---

# 133. SECURITY TESTS

Must include:

```text
Employee A cannot read Employee B private chat
Non-member cannot read group history
Non-member cannot send to private group
HOD cannot access unrelated restricted conversation
Admin cannot read private chat without permission
Unauthorized user cannot download attachment
User cannot edit another user's message
User cannot delete another user's message
User cannot impersonate sender
Client cannot spoof conversation membership
Client cannot change role
Client cannot bypass message retention
Client cannot bypass blocked status
```

---

# 134. LOAD TESTING

Simulate:

```text
10,000 users
1,000 concurrent sockets
10,000+ messages/minute
high unread counts
large groups
large media uploads
mass announcement delivery
```

Test:

```text
CPU
RAM
PostgreSQL
Redis
Socket.IO
queue workers
object storage
```

---

# 135. FEATURE FLAGS

Chat features should be feature-flag ready:

```text
chat_enabled
direct_chat_enabled
group_chat_enabled
project_chat_enabled
department_chat_enabled
voice_messages_enabled
polls_enabled
scheduled_messages_enabled
disappearing_messages_enabled
voice_calls_enabled
video_calls_enabled
screen_share_enabled
forwarding_enabled
reactions_enabled
```

Admin can enable/disable these without code deployment.

---

# 136. CHAT RETENTION CONFIGURATION

Admin can configure:

```text
global retention
conversation-type retention
department retention
project retention
restricted-chat retention
disappearing message rules
```

But retention must not override legally required records.

---

# 137. CHAT ADMIN SCREEN

Recommended:

```text
Admin
 ↓
Chat Management
 ├── Overview
 ├── Conversations
 ├── Groups
 ├── Departments
 ├── Projects
 ├── Reports
 ├── Moderation
 ├── Storage
 ├── Retention
 ├── Policies
 └── Feature Flags
```

---

# 138. CHAT SECURITY SCREEN

For authorized security/admin users:

```text
Active chat users
Active sockets
Failed message deliveries
Abuse reports
Blocked users
Blocked devices
Suspicious activity
Moderation events
Message export events
```

Do not expose private message content by default.

---

# 139. CHAT ANALYTICS

Show:

```text
DAU
WAU
messages/day
active conversations
groups
department chats
project chats
files shared
voice messages
calls
polls
reports
unread backlog
```

For management analytics, prefer aggregate data.

Do not create employee surveillance metrics without a defined business/security purpose.

---

# 140. NOTIFICATION DE-DUPLICATION

Example:

User is currently viewing:

```text
Production Group
```

A new message arrives.

Do not send:

```text
in-app banner
+
FCM push
+
email
```

unless notification policy specifically requires it.

Notification service should know:

```text
online
foreground
active conversation
muted
notification preferences
```

---

# 141. CHAT EVENTS TO NOTIFICATIONS

Examples:

```text
message from another user
reply to your message
mention
group invitation
removed from group
group admin promotion
call
poll closing
important announcement
```

---

# 142. CHAT API VERSIONING

All REST APIs:

```text
/api/v1/chat/...
```

Never expose internal service APIs directly to the mobile application.

---

# 143. SERVICE BOUNDARIES

Recommended NestJS services:

```text
ChatConversationService
ChatMessageService
ChatMembershipService
ChatPresenceService
ChatNotificationService
ChatFileService
ChatSearchService
ChatPollService
ChatModerationService
ChatRetentionService
ChatExportService
ChatRealtimeGateway
```

Do not build one 5,000-line `ChatService`.

---

# 144. EVENT-DRIVEN INTERNAL DESIGN

Examples:

```text
chat.message.created
chat.message.updated
chat.message.deleted
chat.message.read

chat.member.added
chat.member.removed

chat.poll.created
chat.poll.closed

chat.call.started
chat.call.ended
```

Subscribers:

```text
NotificationService
AuditService
AnalyticsService
SearchService
```

This avoids hard coupling.

---

# 145. FINAL DATA RELATIONSHIPS

```text
Employee
   │
   ├── Direct Conversations
   │
   ├── Groups
   │
   ├── Department Conversations
   │
   ├── Project Conversations
   │
   └── Task Discussions
           │
           ▼
       Messages
           │
    ┌──────┼────────┐
    ▼      ▼        ▼
 Attachments Reactions Polls
```

---

# 146. CHAT FEATURE MATRIX

| Feature | Employee | Sub-HOD | HOD | HR | Director | Admin |
|---|---|---|---|---|---|---|
| Direct Chat | Permission | Permission | Permission | Permission | Permission | Policy |
| Group Creation | Policy | Policy | Policy | Policy | Policy | Config |
| Group Admin | If assigned | If assigned | If assigned | If assigned | If assigned | Policy |
| Project Chat | Member | Member | Manager/Member | Authorized | Authorized | Policy |
| Department Chat | Membership | Membership | Department | HR scope | ORG | Policy |
| Send Message | Yes if authorized | Yes | Yes | Yes | Yes | Yes |
| Edit Own Message | Policy | Policy | Policy | Policy | Policy | Policy |
| Delete Own Message | Policy | Policy | Policy | Policy | Policy | Policy |
| Moderate | No by default | Assigned | Assigned | Authorized | Authorized | Authorized |
| Poll | Permission | Permission | Permission | Permission | Permission | Permission |
| Schedule | Yes | Yes | Yes | Yes | Yes | Yes |
| Search | Accessible Chats | Accessible Chats | Accessible Chats | Authorized | Authorized | Policy |
| Private Chat Access | Own | Own | Own | Own | Own | Own by default |
| Chat Reports | Self | Team | Department | HR | ORG | ORG |
| Security Controls | No | No | No | Limited | Authorized | Full |

This is an initial access model; the Phase 2 authorization engine remains the final authority.

---

# 147. DATABASE SOURCE OF TRUTH

PostgreSQL is the source of truth for:

```text
conversations
members
messages
read state
reactions
polls
scheduled messages
drafts
moderation
retention metadata
```

Redis is for:

```text
ephemeral realtime state
presence
typing
rate limits
pub/sub
```

S3/MinIO is for:

```text
images
videos
audio
voice
documents
attachments
```

FCM is for:

```text
push delivery
```

Nodemailer is for:

```text
email
```

---

# 148. CRITICAL RULES

Never:

```text
Trust client sender ID
Trust client role
Trust client membership
Store huge media blobs in PostgreSQL
Use WebSocket as the only data source
Use page pagination for message history
Allow search to bypass authorization
Allow Admin to silently read private chat
Delete retained enterprise records blindly
Use typing events as database writes
Send WebRTC media through NestJS
Create duplicate messages on retry
```

---

# 149. PHASED IMPLEMENTATION

Build Chat in this order.

## Phase A — Core

```text
Conversation
Membership
Message
Send
Receive
History
Cursor pagination
Read receipts
Unread
```

## Phase B — Rich Messaging

```text
Reply
Edit
Delete
Forward
Reactions
Star
Pin
Attachments
Media
Documents
Search
```

## Phase C — Groups

```text
Groups
Admins
Roles
Members
Permissions
Department chat
Section chat
Project chat
Task discussions
```

## Phase D — Advanced

```text
Polls
Scheduled messages
Drafts
Disappearing messages
Content protection
Moderation
Reports
```

## Phase E — Realtime

```text
Presence
Typing
Delivery
Reconnect
Synchronization
Multi-device
```

## Phase F — Calls

```text
Audio
Video
Call signaling
Call history
Screen sharing
```

## Phase G — Enterprise Governance

```text
Retention
Privacy
Audit
Exports
Analytics
Admin policies
Feature flags
Security
```

---

# 150. DEFINITION OF DONE

Chat is complete only when:

```text
[ ] Direct chat
[ ] Group chat
[ ] Department chat
[ ] Section/team chat
[ ] Project chat
[ ] Task discussion

[ ] Text
[ ] Emoji
[ ] GIF
[ ] Sticker
[ ] Image
[ ] Video
[ ] Audio
[ ] Voice message
[ ] Document
[ ] Poll
[ ] Link preview

[ ] Reply
[ ] Forward
[ ] Edit
[ ] Delete
[ ] React
[ ] Star
[ ] Pin
[ ] Search
[ ] Select messages

[ ] Sent
[ ] Delivered
[ ] Read
[ ] Unread counts

[ ] Typing
[ ] Presence
[ ] Last seen

[ ] Mute
[ ] Archive
[ ] Drafts
[ ] Scheduled messages
[ ] Disappearing messages

[ ] Group admins
[ ] Group roles
[ ] Member management
[ ] Group permissions
[ ] Ownership transfer

[ ] Media gallery
[ ] Files
[ ] Links

[ ] Polls
[ ] Moderation
[ ] Reports
[ ] Blocking

[ ] Firebase notifications
[ ] Email notifications
[ ] Notification preferences

[ ] Audio calls
[ ] Video calls
[ ] Call history
[ ] Screen sharing where supported

[ ] Cursor pagination
[ ] Offline queue
[ ] Reconnect sync
[ ] Idempotency
[ ] Multi-device readiness

[ ] Authorization
[ ] Organization scope
[ ] Privacy
[ ] Retention
[ ] Audit
[ ] Security
[ ] Admin controls

[ ] Unit tests
[ ] Integration tests
[ ] Realtime tests
[ ] Authorization tests
[ ] Load tests
```

---

# 151. FINAL CLAUDE DIRECTIVE

Build the Sarthi Chat module so that a user familiar with WhatsApp or Telegram immediately understands how to use it.

However, this is **not a consumer social network**.

It is an enterprise communication system.

Therefore every feature must additionally consider:

```text
Employee hierarchy
Department
Plant
Project
Task
Permissions
Privacy
Security
Audit
Retention
Data ownership
Organization policy
```

The system should feel:

```text
WhatsApp-like simplicity
+
Telegram-like flexibility
+
Enterprise ERP governance
```

The most important architectural rule is:

```text
USER
 ↓
AUTHENTICATION
 ↓
AUTHORIZATION
 ↓
ORGANIZATION SCOPE
 ↓
CONVERSATION ACCESS
 ↓
MESSAGE ACCESS
 ↓
MESSAGE ACTION
 ↓
AUDIT / NOTIFICATION / RETENTION
```

Do not bypass this pipeline.

Build the chat module so it remains reliable with millions of messages, thousands of employees, large media volumes, unreliable mobile networks and multiple simultaneous clients.

The UI can be inspired by familiar messaging applications, but the backend must be built as a proper enterprise system.

**Do not implement everything as one sprint. Build the foundation first, then rich messaging, groups, realtime, calls and enterprise governance incrementally.**