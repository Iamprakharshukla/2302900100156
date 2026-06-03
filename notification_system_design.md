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

For the notification system, **MongoDB** has been chosen as the persistent storage solution.

### Why MongoDB?

MongoDB is a document-oriented NoSQL database that is well-suited for notification systems because:

* Notifications have a flexible and evolving structure.
* It provides high write performance for large volumes of notification events.
* Horizontal scaling through sharding is supported.
* JSON-like documents map naturally to API request and response payloads.
* It can efficiently store millions of user notifications while maintaining good query performance.

---

## Database Schema

### Collection: notifications

Each notification will be stored as a separate document.

```json
{
  "_id": "notif_001",
  "userId": "user123",
  "title": "Payment Successful",
  "message": "Your payment has been processed successfully.",
  "type": "info",
  "read": false,
  "createdAt": "2026-06-03T10:30:00Z",
  "updatedAt": "2026-06-03T10:30:00Z"
}
```

### Field Description

| Field     | Type            | Description                     |
| --------- | --------------- | ------------------------------- |
| _id       | String/ObjectId | Unique notification identifier  |
| userId    | String          | User receiving the notification |
| title     | String          | Notification title              |
| message   | String          | Notification content            |
| type      | String          | info, warning, security         |
| read      | Boolean         | Read status                     |
| createdAt | Date            | Creation timestamp              |
| updatedAt | Date            | Last update timestamp           |

---

## Indexing Strategy

To improve query performance, the following indexes should be created.

### User Notifications Index

```javascript
db.notifications.createIndex({
  userId: 1
})
```

### Unread Notifications Index

```javascript
db.notifications.createIndex({
  userId: 1,
  read: 1
})
```

### Recent Notifications Index

```javascript
db.notifications.createIndex({
  createdAt: -1
})
```

These indexes help optimize notification retrieval, unread count calculation, and sorting operations.

---

## Scalability Challenges

As the number of users and notifications grows, several challenges may arise.

### 1. Slow Query Performance

Fetching notifications for users with thousands of records may become slower.

#### Solution

* Use indexes on frequently queried fields.
* Implement pagination.
* Limit the number of notifications returned per request.

Example:

```javascript
db.notifications.find({
  userId: "user123"
})
.sort({ createdAt: -1 })
.limit(20)
```

---

### 2. Increasing Storage Requirements

Over time, notification data can grow significantly and consume large amounts of storage.

#### Solution

* Archive old notifications.
* Apply data retention policies.
* Use TTL (Time-To-Live) indexes for automatic cleanup.

Example:

```javascript
db.notifications.createIndex(
  {
    createdAt: 1
  },
  {
    expireAfterSeconds: 31536000
  }
)
```

The above configuration automatically removes notifications older than one year.

---

### 3. High Write Traffic

Large-scale applications may generate thousands of notifications per second.

#### Solution

* Use database sharding.
* Introduce message queues such as Kafka or RabbitMQ.
* Process notifications asynchronously before storage.

---

### 4. Real-Time Delivery Load

A large number of active WebSocket connections can put pressure on the application server.

#### Solution

* Use distributed WebSocket servers.
* Deploy Redis Pub/Sub for event broadcasting.
* Load balance WebSocket connections across multiple servers.

---

## MongoDB Queries Based on Stage 1 APIs

### Create Notification

```javascript
db.notifications.insertOne({
  userId: "user123",
  title: "Payment Successful",
  message: "Your payment has been processed successfully.",
  type: "info",
  read: false,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

---

### Fetch Notifications

```javascript
db.notifications.find({
  userId: "user123"
})
.sort({
  createdAt: -1
})
.limit(20)
```

---

### Get Unread Notification Count

```javascript
db.notifications.countDocuments({
  userId: "user123",
  read: false
})
```

---

### Mark Notification as Read

```javascript
db.notifications.updateOne(
  {
    _id: "notif_001"
  },
  {
    $set: {
      read: true,
      updatedAt: new Date()
    }
  }
)
```

---

### Mark All Notifications as Read

```javascript
db.notifications.updateMany(
  {
    userId: "user123",
    read: false
  },
  {
    $set: {
      read: true,
      updatedAt: new Date()
    }
  }
)
```

---

### Delete Notification

```javascript
db.notifications.deleteOne({
  _id: "notif_001"
})
```

---

## Conclusion

MongoDB provides a scalable and flexible solution for storing notification data. Through indexing, pagination, sharding, and automated data retention strategies, the system can efficiently handle increasing traffic and large notification volumes while maintaining fast response times and reliable real-time delivery.
