# Stage 1

# Notification System Design Document

## Introduction

The purpose of this document is to define the API design and contract for a notification system. This system allows users to receive, view, manage, and track notifications after logging into the application. The document includes REST API endpoints, request and response formats, required headers, data schemas, and a mechanism for delivering real-time notifications.

---

## Base API URL

```http
/api/v1
```

---

## Common Request Headers

All secured endpoints require the following headers:

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
Accept: application/json
```

---

## Standard Response Structure

### Success Response

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Core Features Supported

The notification platform supports the following actions:

* Creating notifications
* Viewing notifications
* Checking unread notification count
* Marking notifications as read
* Marking all notifications as read
* Deleting notifications
* Receiving real-time notifications

---

## 1. Create Notification

This endpoint is used by internal services or system modules to generate a notification for a user.

### Endpoint

```http
POST /api/v1/notifications
```

### Request Body

```json
{
  "userId": "user123",
  "title": "New Login Detected",
  "message": "Your account was accessed from a new device.",
  "type": "security"
}
```

### Response

```json
{
  "success": true,
  "message": "Notification created successfully",
  "data": {
    "notificationId": "notif_001"
  }
}
```

---

## 2. Fetch Notifications

This endpoint returns all notifications belonging to the authenticated user.

### Endpoint

```http
GET /api/v1/notifications
```

### Response

```json
{
  "success": true,
  "data": [
    {
      "id": "notif_001",
      "title": "New Login Detected",
      "message": "Your account was accessed from a new device.",
      "type": "security",
      "read": false,
      "createdAt": "2026-06-03T10:00:00Z"
    }
  ]
}
```

---

## 3. Get Unread Notification Count

This endpoint helps the frontend display notification badges.

### Endpoint

```http
GET /api/v1/notifications/unread-count
```

### Response

```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

---

## 4. Mark Notification as Read

Allows a user to mark a specific notification as read.

### Endpoint

```http
PATCH /api/v1/notifications/{notificationId}/read
```

### Example

```http
PATCH /api/v1/notifications/notif_001/read
```

### Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 5. Mark All Notifications as Read

Allows users to clear all unread notifications at once.

### Endpoint

```http
PATCH /api/v1/notifications/read-all
```

### Response

```json
{
  "success": true,
  "message": "All notifications marked as read"
}
```

---

## 6. Delete Notification

Users can remove notifications that are no longer required.

### Endpoint

```http
DELETE /api/v1/notifications/{notificationId}
```

### Response

```json
{
  "success": true,
  "message": "Notification deleted successfully"
}
```

---

## Notification Data Schema

Each notification object follows the structure shown below:

```json
{
  "id": "string",
  "userId": "string",
  "title": "string",
  "message": "string",
  "type": "info | warning | security",
  "read": false,
  "createdAt": "ISO-8601 timestamp"
}
```

---

## Real-Time Notification Delivery

To ensure users receive notifications instantly without refreshing the page, the system uses WebSocket communication.

### WebSocket Endpoint

```http
ws://localhost:3000/ws/notifications
```

### Authentication Payload

```json
{
  "token": "JWT_TOKEN"
}
```

### Sample Event Sent by Server

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "notif_005",
    "title": "Payment Successful",
    "message": "Your payment has been processed.",
    "type": "info",
    "createdAt": "2026-06-03T10:30:00Z"
  }
}
```

---

## Real-Time Notification Workflow

```text
User Login
    ↓
WebSocket Connection Established
    ↓
User Authentication
    ↓
Subscription to User Notification Channel
    ↓
Notification Generated
    ↓
Server Pushes Notification Event
    ↓
Frontend Updates Notification Panel
```

---

## Security Measures

To protect user data and ensure secure communication, the following practices are recommended:

* JWT-based authentication
* HTTPS for all API requests
* Input validation on every endpoint
* Authorization checks before accessing notifications
* Rate limiting to prevent misuse
* Secure WebSocket authentication

---

## API Versioning Strategy

The API follows version-based routing.

Current Version:

```http
/api/v1/notifications
```

Future versions can be introduced without breaking existing integrations:

```http
/api/v2/notifications
```

---

## Conclusion

This notification system provides a simple and scalable solution for managing user notifications. It supports notification creation, retrieval, status management, deletion, unread count tracking, and real-time updates. The API follows RESTful design principles and maintains a consistent structure that simplifies frontend integration and future enhancements.


# Stage 2

# Database Design and Storage Strategy

## Database Selection

For this notification system, **PostgreSQL** has been selected as the primary database.

### Why PostgreSQL?

PostgreSQL is a powerful relational database that offers:

* Strong ACID compliance for reliable transactions.
* Excellent indexing and query optimization capabilities.
* High performance for filtering and sorting notification data.
* Support for large datasets containing millions of records.
* Scalability through partitioning, replication, and indexing.
* Structured schema design that ensures data consistency.

Since notification data has a predictable structure and relationships with users, a relational database is an appropriate choice.

---

## Database Schema

### Table: notifications

```sql
CREATE TABLE notifications (
    id BIGSERIAL PRIMARY KEY,
    studentID BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notificationType VARCHAR(20) NOT NULL,
    isRead BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## Column Description

| Column           | Type         | Description                    |
| ---------------- | ------------ | ------------------------------ |
| id               | BIGSERIAL    | Unique notification identifier |
| studentID        | BIGINT       | Student receiving notification |
| title            | VARCHAR(255) | Notification title             |
| message          | TEXT         | Notification content           |
| notificationType | VARCHAR(20)  | Event, Result, Placement       |
| isRead           | BOOLEAN      | Read status                    |
| createdAt        | TIMESTAMP    | Notification creation time     |
| updatedAt        | TIMESTAMP    | Last update time               |

---

## Indexing Strategy

### Index for Student Notifications

```sql
CREATE INDEX idx_notifications_student
ON notifications(studentID);
```

### Index for Unread Notifications

```sql
CREATE INDEX idx_notifications_student_read
ON notifications(studentID, isRead);
```

### Composite Index for Filtering and Sorting

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

### Index for Notification Type Queries

```sql
CREATE INDEX idx_notifications_type_created
ON notifications(notificationType, createdAt);
```

These indexes improve performance for unread notification retrieval, notification history, and reporting queries.

---

## Scalability Challenges

### 1. Large Data Volume

As the platform grows, millions of notifications may accumulate.

#### Solution

* Archive old notifications.
* Partition tables by date.
* Periodically move historical records to archive tables.

---

### 2. Slow Query Performance

Searching and sorting through millions of rows can become expensive.

#### Solution

* Use composite indexes.
* Avoid full table scans.
* Use pagination.

Example:

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
ORDER BY createdAt DESC
LIMIT 20;
```

---

### 3. High Write Load

Thousands of notifications may be generated every minute.

#### Solution

* Use connection pooling.
* Batch inserts where possible.
* Introduce message queues such as Kafka or RabbitMQ.

---

### 4. Real-Time Notification Load

Large numbers of active users can increase server load.

#### Solution

* Use WebSockets for push delivery.
* Use Redis Pub/Sub for event distribution.
* Scale application servers horizontally.

---

## SQL Queries Based on Stage 1 APIs

### Create Notification

```sql
INSERT INTO notifications
(studentID, title, message, notificationType)
VALUES
(1042,
 'Placement Update',
 'You have been shortlisted.',
 'Placement');
```

---

### Fetch Notifications

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
ORDER BY createdAt DESC
LIMIT 20;
```

---

### Get Unread Notification Count

```sql
SELECT COUNT(*)
FROM notifications
WHERE studentID = 1042
AND isRead = FALSE;
```

---

### Mark Notification as Read

```sql
UPDATE notifications
SET isRead = TRUE,
    updatedAt = CURRENT_TIMESTAMP
WHERE id = 101;
```

---

### Mark All Notifications as Read

```sql
UPDATE notifications
SET isRead = TRUE,
    updatedAt = CURRENT_TIMESTAMP
WHERE studentID = 1042
AND isRead = FALSE;
```

---

### Delete Notification

```sql
DELETE FROM notifications
WHERE id = 101;
```

---

## Data Retention Strategy

To prevent excessive growth:

* Keep recent notifications in the primary table.
* Archive notifications older than one year.
* Periodically remove obsolete records from archive storage if required.

---

## Conclusion

PostgreSQL provides a reliable and scalable storage solution for the notification system. Through proper schema design, indexing, pagination, partitioning, and archival strategies, the system can efficiently manage millions of notifications while maintaining fast query performance and supporting future growth.





# Stage 3

# Query Performance Analysis and Optimization

## Given Query

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt ASC;
```

---

## Is the Query Correct?

Yes, the query is functionally correct.

It retrieves all unread notifications for student **1042** and sorts them by creation time in ascending order.

However, although the query produces the correct result, it may perform poorly when the database contains millions of records.

---

## Why is the Query Slow?

The system currently contains:

* 50,000 students
* 5,000,000 notifications

Without proper indexing, the database must scan a large portion of the notifications table to locate matching records.

Potential performance issues include:

### 1. Full Table Scan

If no suitable index exists, the database examines every row in the table.

Computational Cost:

```text
O(N)
```

Where:

```text
N = 5,000,000 notifications
```

This becomes increasingly expensive as data grows.

---

### 2. Additional Sorting Cost

The query includes:

```sql
ORDER BY createdAt ASC
```

If the database cannot use an index for sorting, it performs an additional sort operation.

Computational Cost:

```text
O(N log N)
```

This significantly increases execution time.

---

### 3. Selecting All Columns

The query uses:

```sql
SELECT *
```

This retrieves every column even if the application only requires a few fields.

This increases:

* Disk I/O
* Memory usage
* Network transfer size

---

## Recommended Optimization

Create a composite index matching the filtering and sorting pattern.

### PostgreSQL / MySQL

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

This index allows the database to:

1. Filter by studentID
2. Filter by isRead
3. Return rows already sorted by createdAt

As a result, the database avoids both full scans and expensive sorting.

---

## Optimized Query

Instead of:

```sql
SELECT *
```

Fetch only required fields.

```sql
SELECT
    id,
    title,
    message,
    notificationType,
    createdAt
FROM notifications
WHERE studentID = 1042
  AND isRead = false
ORDER BY createdAt ASC;
```

---

## Expected Computational Cost

### Without Index

```text
O(N)
```

or

```text
O(N log N)
```

when sorting is required.

### With Composite Index

```text
O(log N + K)
```

Where:

* N = Total notifications
* K = Matching notifications for the student

This provides significantly better performance for large datasets.

---

## Should We Add Indexes on Every Column?

No.

Adding indexes on every column is generally not a good practice.

### Problems with Excessive Indexing

#### Increased Storage Usage

Every index consumes additional disk space.

#### Slower Writes

Whenever a notification is inserted, updated, or deleted, all related indexes must also be updated.

This increases write latency.

#### Poor Index Utilization

Many indexes may never be used by actual queries.

They increase maintenance cost without providing benefits.

---

## Better Approach

Create indexes only on:

* Frequently filtered columns
* Join columns
* Columns used in sorting
* Columns used in range searches

For this notification system:

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

is sufficient for the unread notification query.

---

## Query to Find Students Who Received Placement Notifications in the Last 7 Days

Assuming the table contains:

```text
notificationType ENUM('Event','Result','Placement')
```

The following query returns all students who received placement notifications within the last seven days.

### PostgreSQL

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
  AND createdAt >= NOW() - INTERVAL '7 days';
```

### MySQL

```sql
SELECT DISTINCT studentID
FROM notifications
WHERE notificationType = 'Placement'
  AND createdAt >= NOW() - INTERVAL 7 DAY;
```

---

## Additional Index for Placement Query

```sql
CREATE INDEX idx_notifications_type_created
ON notifications(notificationType, createdAt);
```

This helps the database quickly locate recent placement notifications without scanning the entire table.

---

## Conclusion

The original query is logically correct but may become slow due to full table scans, sorting overhead, and unnecessary data retrieval. A composite index on `(studentID, isRead, createdAt)` greatly improves performance by supporting both filtering and sorting. Indexes should be created based on query patterns rather than added to every column. Proper indexing ensures the notification system remains efficient even with millions of records.


# Stage 4

# Performance Optimization Strategy

## Problem Statement

Currently, notifications are fetched directly from the database every time a student loads a page.

With:

* 50,000 students
* Millions of notifications
* Frequent page refreshes

the database receives a very large number of repetitive read requests. This increases database load, query latency, server resource consumption, and negatively impacts user experience.

---

## Proposed Solutions

### 1. Implement Pagination

Instead of loading all notifications at once, only a limited number of notifications should be returned per request.

### Example

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
ORDER BY createdAt DESC
LIMIT 20 OFFSET 0;
```

### Benefits

* Reduces query execution time.
* Lowers memory usage.
* Decreases network payload size.
* Improves frontend rendering speed.

### Trade-Offs

* Users need additional requests to view older notifications.
* OFFSET becomes slower for very large page numbers.

---

## 2. Use Database Indexes

Create indexes on frequently used columns.

```sql
CREATE INDEX idx_notifications_student_read_created
ON notifications(studentID, isRead, createdAt);
```

### Benefits

* Faster filtering.
* Faster sorting.
* Reduced query execution cost.

### Trade-Offs

* Additional storage usage.
* Slightly slower INSERT and UPDATE operations.

---

## 3. Introduce Redis Caching

Frequently requested notifications can be stored in Redis.

### Flow

```text
Client Request
      ↓
Redis Cache Check
      ↓
Cache Hit → Return Data
      ↓
Cache Miss
      ↓
Database Query
      ↓
Store Result in Redis
      ↓
Return Data
```

### Benefits

* Extremely fast response times.
* Significant reduction in database reads.
* Improved user experience.

### Trade-Offs

* Additional infrastructure cost.
* Cache invalidation logic is required.
* Cached data may become temporarily stale.

---

## 4. Real-Time Notifications with WebSockets

Instead of requesting notifications on every page load, the server can push notifications to users in real time.

### Flow

```text
User Login
      ↓
WebSocket Connection
      ↓
New Notification Created
      ↓
Server Pushes Notification
      ↓
Frontend Updates UI Instantly
```

### Benefits

* Eliminates repeated polling requests.
* Reduces database load.
* Better user experience.

### Trade-Offs

* More complex implementation.
* Persistent connections consume server resources.

---

## 5. Notification Count Caching

The unread notification count is often requested frequently.

Store unread counts in Redis:

```text
user:1042:unread_count = 5
```

### Benefits

* Instant unread badge updates.
* Avoids repetitive COUNT queries.

### Trade-Offs

* Requires synchronization between database and cache.

---

## 6. Background Processing

Notification creation should be handled asynchronously.

### Architecture

```text
Application
      ↓
Message Queue (Kafka/RabbitMQ)
      ↓
Notification Worker
      ↓
Database
      ↓
WebSocket Push
```

### Benefits

* Faster API response times.
* Better scalability during traffic spikes.

### Trade-Offs

* Increased system complexity.
* Additional infrastructure components.

---

## 7. Table Partitioning

As notification data grows into millions of rows, partition the table by date.

### Example

```text
notifications_2026
notifications_2027
notifications_2028
```

### Benefits

* Faster searches on recent data.
* Easier maintenance and archival.

### Trade-Offs

* More complex database administration.
* Additional partition management.

---

## Recommended Architecture

The most effective solution is a combination of:

1. Composite Indexing
2. Pagination
3. Redis Caching
4. WebSocket-Based Real-Time Updates
5. Background Processing with Kafka/RabbitMQ

### Expected Outcome

* Reduced database load.
* Faster API response times.
* Better scalability.
* Improved user experience.
* Efficient handling of millions of notifications.

---

## Conclusion

Fetching notifications directly from the database on every page load is not scalable for a large notification system. By combining indexing, pagination, Redis caching, WebSocket-based real-time updates, background processing, and table partitioning, the platform can significantly reduce database pressure while delivering a fast and responsive user experience.


# Stage 5

# Reliable and Scalable Notification Delivery Design

## Analysis of Existing Implementation

The current implementation processes notifications sequentially for each student.

```python
function notify_all(student_ids, message):

    for student_id in student_ids:

        send_email(student_id, message)

        save_to_db(student_id, message)

        push_to_app(student_id, message)
```

Although this approach is simple, it is not suitable for sending notifications to 50,000 students simultaneously.

---

## Shortcomings of the Current Design

### 1. Sequential Processing

The system processes one student at a time.

```text
Student 1
Student 2
Student 3
...
Student 50000
```

This significantly increases processing time and reduces system scalability.

### 2. No Failure Recovery

If the email service fails during execution, the system does not provide a recovery mechanism.

Example:

```text
Email Failed
Database Saved
App Notification Sent
```

This creates inconsistent states across the system.

### 3. Tight Coupling

Database storage, email delivery, and app notification delivery are executed together in a single workflow.

As a result, failure in one service can impact the entire process.

### 4. Poor Scalability

The design cannot efficiently handle large notification campaigns involving thousands of users.

---

## Handling Email Failures

Logs indicate that email delivery failed for 200 students.

The notification should not be lost because notification data is already stored in the database.

Failed email jobs should be retried automatically.

### Retry Mechanism

```text
Email Queue
      ↓
Attempt 1
      ↓
Failed
      ↓
Retry Queue
      ↓
Attempt 2
      ↓
Attempt 3
      ↓
Dead Letter Queue (DLQ)
```

After multiple failed attempts, the job is moved to a Dead Letter Queue for manual investigation.

---

## Recommended Architecture

A queue-based event-driven architecture should be used.

```text
HR Clicks Notify All
          ↓
Save Notifications in Database
          ↓
Publish Event to Queue
          ↓
      Kafka/RabbitMQ
          ↓
 ┌─────────────────┐
 │ Notification    │
 │ Worker          │
 └─────────────────┘
          ↓
 Push In-App Notification

 ┌─────────────────┐
 │ Email Worker    │
 └─────────────────┘
          ↓
      Send Email
```

This design allows independent processing of notification delivery channels.

---

## Should Database Save and Email Sending Happen Together?

No.

The notification must first be stored in the database because the database acts as the source of truth.

Workflow:

```text
Save Notification
        ↓
Publish Event
        ↓
Send Email
        ↓
Push In-App Notification
```

Even if email delivery fails, the notification remains available in the system and can be retried later.

This prevents data loss and improves reliability.

---

## Revised Pseudocode

### Notification Creation Service

```python
function notify_all(student_ids, message):

    for student_id in student_ids:

        save_notification(
            student_id,
            message
        )

        publish_to_queue(
            "notification_queue",
            {
                "student_id": student_id,
                "message": message
            }
        )

    return "Notifications queued successfully"
```

---

### Notification Worker

```python
function notification_worker(event):

    push_to_app(
        event.student_id,
        event.message
    )

    publish_to_queue(
        "email_queue",
        event
    )
```

---

### Email Worker

```python
function email_worker(event):

    try:

        send_email(
            event.student_id,
            event.message
        )

    except Exception:

        move_to_retry_queue(event)
```

---

## Performance Improvements

### Batch Database Inserts

Instead of executing thousands of individual insert statements, notifications should be inserted in batches.

Example:

```sql
INSERT INTO notifications
(studentID, title, message, notificationType)
VALUES
(...),
(...),
(...);
```

Benefits:

* Reduced database overhead
* Faster execution
* Better resource utilization

---

### Parallel Worker Processing

Multiple workers can process notifications simultaneously.

```text
Worker 1
Worker 2
Worker 3
Worker 4
...
Worker N
```

Benefits:

* Higher throughput
* Faster notification delivery
* Better scalability

---

## Trade-Offs

| Strategy               | Advantages             | Disadvantages                      |
| ---------------------- | ---------------------- | ---------------------------------- |
| Sequential Processing  | Simple implementation  | Very slow at scale                 |
| Queue-Based Processing | Reliable and scalable  | Additional infrastructure required |
| Retry Queue            | Prevents data loss     | More operational complexity        |
| Batch Inserts          | Faster database writes | Larger transaction size            |
| Multiple Workers       | High throughput        | Requires worker management         |

---

## Conclusion

The original implementation is not suitable for sending notifications to 50,000 students because it is sequential, tightly coupled, and lacks fault tolerance. A queue-based architecture using PostgreSQL, Kafka/RabbitMQ, WebSocket delivery, retry queues, and parallel workers provides a scalable and reliable solution. Notification data should always be stored in the database first, while email and in-app delivery should be processed asynchronously to ensure high performance and fault tolerance.

## Stage 6 – Priority Inbox

### Objective

Display the top N most important unread notifications based on notification type and recency.

### Priority Weights

| Type      | Weight |
| --------- | ------ |
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

### Priority Calculation

Priority is calculated using:

Priority Score = Weight + Recency

Notifications are sorted in descending order of priority score.

### Algorithm

1. Fetch notifications from Notification API.
2. Assign weight based on notification type.
3. Sort notifications using:

   * Higher weight first
   * More recent timestamp first
4. Return top 10 notifications.

### Efficient Maintenance

For continuously incoming notifications, a Min Heap of size 10 can be maintained.

Complexities:

* Insert: O(log N)
* Remove: O(log N)
* Space: O(N)

This avoids re-sorting the entire notification list whenever a new notification arrives.
##
