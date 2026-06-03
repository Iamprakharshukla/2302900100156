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
