# TRIO SuperAdmin API Documentation

Complete API reference for the Trio SuperAdmin application.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Employees API](#employees-api)
- [Restaurants API](#restaurants-api)
- [Dictionaries API](#dictionaries-api)
- [Audit Log API](#audit-log-api)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Overview

### Base URLs

| Environment | URL |
|-------------|-----|
| Development | `https://dev.getmenu.am` |
| Production  | `https://api.getmenu.am` |

### Request Format

All requests must include:
- `Content-Type: application/json` header
- Cookie `admin_token` (automatically sent after login)

### Response Format

```json
// Success Response
{
  "data": { ... }
}

// Error Response
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

---

## Authentication

### Login

Authenticate user and receive HttpOnly cookie.

**Endpoint:** `POST /admin/auth/login`

**Authentication:** Basic Auth (`Authorization: Basic <base64(username:password)>`)

**Request:**
```http
POST /admin/auth/login HTTP/1.1
Host: dev.getmenu.am
Authorization: Basic YWRtaW46cGFzc3dvcmQ=
Content-Type: application/json
```

**Response:**
```json
{
  "username": "admin",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Status Codes:**
- `200 OK` - Login successful, cookie set
- `401 Unauthorized` - Invalid credentials
- `500 Internal Server Error` - Server error

**Cookies Set:**
- `admin_token` - HttpOnly, Secure, SameSite=Strict

---

### Get Current User

Get authenticated user information.

**Endpoint:** `GET /admin/auth/me`

**Authentication:** Cookie

**Request:**
```http
GET /admin/auth/me HTTP/1.1
Host: dev.getmenu.am
Cookie: admin_token=...
```

**Response:**
```json
{
  "username": "admin",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Status Codes:**
- `200 OK` - User information retrieved
- `401 Unauthorized` - Not authenticated or session expired
- `500 Internal Server Error` - Server error

---

### Logout

Clear authentication session.

**Endpoint:** `POST /admin/auth/logout`

**Authentication:** Cookie

**Request:**
```http
POST /admin/auth/logout HTTP/1.1
Host: dev.getmenu.am
Cookie: admin_token=...
```

**Response:**
```
204 No Content
```

**Status Codes:**
- `204 No Content` - Logout successful
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

## Employees API

### List All Employees

Get list of all employees.

**Endpoint:** `GET /admin/employees`

**Authentication:** Cookie

**Query Parameters:**
None (filtering done client-side)

**Request:**
```http
GET /admin/employees HTTP/1.1
Host: dev.getmenu.am
Cookie: admin_token=...
```

**Response:**
```json
[
  {
    "id": "emp1",
    "firstName": "Jane",
    "lastName": "Smith",
    "username": "jsmith",
    "blocked": false
  },
  {
    "id": "emp2",
    "firstName": "Bob",
    "lastName": "Johnson",
    "username": "bjohnson",
    "blocked": true
  }
]
```

**Status Codes:**
- `200 OK` - Employees retrieved
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

### Get Employee by ID

Get single employee details.

**Endpoint:** `GET /admin/employees/{id}`

**Authentication:** Cookie

**Path Parameters:**
- `id` (string) - Employee ID

**Request:**
```http
GET /admin/employees/emp1 HTTP/1.1
Host: dev.getmenu.am
Cookie: admin_token=...
```

**Response:**
```json
{
  "id": "emp1",
  "hash": "a3f5d8e9c2b1",
  "firstName": "Jane",
  "lastName": "Smith",
  "username": "jsmith",
  "blocked": false
}
```

**Status Codes:**
- `200 OK` - Employee retrieved
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Employee not found
- `500 Internal Server Error` - Server error

---

### Create Employee

Create new employee.

**Endpoint:** `POST /admin/employees`

**Authentication:** Cookie

**Request Body:**
```json
{
  "firstName": "Alice",
  "lastName": "Brown",
  "username": "abrown",
  "password": "securePassword123",
  "blocked": false
}
```

**Field Validation:**
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `username`: Required, 3-30 characters, unique, alphanumeric + underscore
- `password`: Required, minimum 8 characters
- `blocked`: Optional, boolean, default false

**Response:**
```json
{
  "id": "emp3",
  "firstName": "Alice",
  "lastName": "Brown",
  "username": "abrown",
  "blocked": false
}
```

**Status Codes:**
- `201 Created` - Employee created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Username already exists
- `500 Internal Server Error` - Server error

---

### Update Employee

Update existing employee.

**Endpoint:** `PUT /admin/employees/{id}`

**Authentication:** Cookie

**Path Parameters:**
- `id` (string) - Employee ID

**Request Body:**
```json
{
  "hash": "a3f5d8e9c2b1",
  "firstName": "Alice",
  "lastName": "Brown-Wilson",
  "username": "abrown",
  "password": "newPassword456",
  "changePassword": true,
  "blocked": false
}
```

**Field Validation:**
- `hash`: Required for optimistic locking
- `firstName`: Required, 2-50 characters
- `lastName`: Required, 2-50 characters
- `username`: Required, 3-30 characters, unique
- `password`: Optional, required if `changePassword` is true
- `changePassword`: Boolean flag
- `blocked`: Boolean

**Response:**
```json
{
  "id": "emp3",
  "hash": "b7c2e4f1a9d3",
  "firstName": "Alice",
  "lastName": "Brown-Wilson",
  "username": "abrown",
  "blocked": false
}
```

**Status Codes:**
- `200 OK` - Employee updated
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Employee not found
- `409 Conflict` - Hash mismatch (concurrent modification)
- `500 Internal Server Error` - Server error

---

### Block/Unblock Employee

Toggle employee blocked status.

**Endpoint:** `PATCH /admin/employees/{id}/block`

**Authentication:** Cookie

**Path Parameters:**
- `id` (string) - Employee ID

**Request Body:**
```json
{
  "blocked": true
}
```

**Response:**
```json
{
  "id": "emp3",
  "firstName": "Alice",
  "lastName": "Brown-Wilson",
  "username": "abrown",
  "blocked": true
}
```

**Status Codes:**
- `200 OK` - Employee status updated
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Employee not found
- `500 Internal Server Error` - Server error

---

## Restaurants API

### List All Restaurants

Get list of all restaurants.

**Endpoint:** `GET /admin/restaurants`

**Authentication:** Cookie

**Response:**
```json
[
  {
    "id": "rest1",
    "name": "Bella Italia",
    "crmUrl": "https://crm.bellaitalia.com",
    "cityName": "Yerevan",
    "districtName": "Kentron",
    "blocked": false,
    "lastClientActivityAt": 1705622400,
    "lastRestaurantActivityAt": 1705622100
  }
]
```

**Status Codes:**
- `200 OK` - Restaurants retrieved
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

### Get Restaurant by ID

Get single restaurant details.

**Endpoint:** `GET /admin/restaurants/{id}`

**Authentication:** Cookie

**Path Parameters:**
- `id` (string) - Restaurant ID

**Response:**
```json
{
  "id": "rest1",
  "hash": "d9e7f2a8b4c6",
  "name": {
    "hy": "Բելլա Իտալիա",
    "ru": "Белла Италия",
    "en": "Bella Italia"
  },
  "crmUrl": "https://crm.bellaitalia.com",
  "countryId": "country1",
  "cityId": "city1",
  "districtId": "district1",
  "legalAddress": "123 Main Street",
  "tin": "12345678",
  "lat": 40.7589,
  "lng": -73.9851,
  "typeId": ["type1", "type2"],
  "priceSegmentId": ["price2"],
  "menuTypeId": ["menu1", "menu3"],
  "integrationTypeId": "integration1",
  "adminEmail": "admin@bellaitalia.com",
  "adminUsername": "bellaadmin",
  "connectionData": {
    "host": "db.bellaitalia.com",
    "port": 5432,
    "username": "dbuser"
  },
  "blocked": false
}
```

**Status Codes:**
- `200 OK` - Restaurant retrieved
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Restaurant not found
- `500 Internal Server Error` - Server error

---

### Create Restaurant

Create new restaurant.

**Endpoint:** `POST /admin/restaurants`

**Authentication:** Cookie

**Request Body:**
```json
{
  "name": {
    "hy": "Սուշի Պարադիզ",
    "ru": "Суши Рай",
    "en": "Sushi Paradise"
  },
  "crmUrl": "https://crm.sushiparadise.com",
  "countryId": "country1",
  "cityId": "city1",
  "districtId": "district2",
  "legalAddress": "456 Oak Avenue",
  "tin": "87654321",
  "lat": 40.7614,
  "lng": -73.9776,
  "typeId": ["type3"],
  "priceSegmentId": ["price3"],
  "menuTypeId": ["menu2"],
  "integrationTypeId": "integration2",
  "adminEmail": "admin@sushiparadise.com",
  "adminUsername": "sushiparadise",
  "adminPassword": "SecurePass123",
  "connectionData": {
    "host": "db.sushiparadise.com",
    "port": 3306,
    "username": "sushi_admin",
    "password": "dbPassword789"
  }
}
```

**Field Validation:**
- `name`: Required, object with hy, ru, en keys (2-100 chars each)
- `crmUrl`: Required, valid URL
- `countryId`, `cityId`, `districtId`: Required, valid IDs
- `legalAddress`: Required, 5-200 characters
- `tin`: Required, 8-15 digits
- `lat`, `lng`: Required, valid coordinates
- `typeId`: Required, array of strings
- `priceSegmentId`: Required, array of strings
- `menuTypeId`: Required, array of strings
- `integrationTypeId`: Required, string
- `adminEmail`: Required, valid email
- `adminUsername`: Required, 3-30 characters
- `adminPassword`: Required, minimum 8 characters
- `connectionData`: Required object
  - `host`: Required, valid hostname
  - `port`: Required, 1-65535
  - `username`: Required, 2-50 characters
  - `password`: Required, minimum 8 characters

**Response:**
```json
{
  "id": "rest2",
  "hash": "e1f9a3b5c7d8",
  "name": {
    "hy": "Սուշի Պարադիզ",
    "ru": "Суши Рай",
    "en": "Sushi Paradise"
  },
  ...
}
```

**Status Codes:**
- `201 Created` - Restaurant created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `409 Conflict` - Duplicate data
- `500 Internal Server Error` - Server error

---

### Update Restaurant

Update existing restaurant.

**Endpoint:** `PUT /admin/restaurants/{id}`

**Authentication:** Cookie

**Path Parameters:**
- `id` (string) - Restaurant ID

**Request Body:** (same as create, plus `hash`)

**Status Codes:**
- `200 OK` - Restaurant updated
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Restaurant not found
- `409 Conflict` - Hash mismatch
- `500 Internal Server Error` - Server error

---

### Block/Unblock Restaurant

Toggle restaurant blocked status.

**Endpoint:** `PATCH /admin/restaurants/{id}/block`

**Authentication:** Cookie

**Request Body:**
```json
{
  "blocked": true
}
```

**Status Codes:**
- `200 OK` - Restaurant status updated
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Restaurant not found
- `500 Internal Server Error` - Server error

---

### Get Restaurant QR Codes

Get QR codes for restaurant tables.

**Endpoint:** `GET /admin/restaurants/{id}/qr`

**Authentication:** Cookie

**Path Parameters:**
- `id` (string) - Restaurant ID

**Response:**
```json
[
  {
    "id": "qr1",
    "hallId": "hall1",
    "tableId": "table1",
    "qrText": "https://menu.trio.am/r/rest1/t/table1",
    "type": "Static"
  },
  {
    "id": "qr2",
    "hallId": "hall1",
    "tableId": "table2",
    "qrText": "https://menu.trio.am/r/rest1/t/table2",
    "type": "Dynamic"
  }
]
```

**Status Codes:**
- `200 OK` - QR codes retrieved
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Restaurant not found
- `500 Internal Server Error` - Server error

---

### Generate QR Codes

Batch create QR codes for restaurant.

**Endpoint:** `POST /admin/restaurants/{id}/qr/batch`

**Authentication:** Cookie

**Path Parameters:**
- `id` (string) - Restaurant ID

**Request Body:**
```json
{
  "count": 10,
  "type": "Static"
}
```

**Response:**
```json
{
  "created": 10,
  "qrCodes": [
    {
      "id": "qr3",
      "hallId": "hall1",
      "tableId": "table3",
      "qrText": "https://menu.trio.am/r/rest1/t/table3",
      "type": "Static"
    },
    ...
  ]
}
```

**Status Codes:**
- `201 Created` - QR codes generated
- `400 Bad Request` - Invalid request
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Restaurant not found
- `500 Internal Server Error` - Server error

---

## Dictionaries API

### Get Dictionary Items

Get items from a specific dictionary.

**Endpoint:** `GET /admin/dictionaries/{key}`

**Authentication:** Cookie

**Path Parameters:**
- `key` (string) - Dictionary key
  - `restaurant-types`
  - `price-segments`
  - `menu-types`
  - `integration-types`
  - `placements`
  - `countries`
  - `cities`
  - `districts`

**Request:**
```http
GET /admin/dictionaries/restaurant-types HTTP/1.1
Host: dev.getmenu.am
Cookie: admin_token=...
```

**Response:**
```json
[
  {
    "id": "type1",
    "name": {
      "hy": "Արագ սնունդ",
      "ru": "Быстрое питание",
      "en": "Fast Food"
    },
    "sortOrder": 1
  },
  {
    "id": "type2",
    "name": {
      "hy": "Ռեստորան",
      "ru": "Ресторан",
      "en": "Restaurant"
    },
    "sortOrder": 2
  }
]
```

**Status Codes:**
- `200 OK` - Dictionary retrieved
- `400 Bad Request` - Invalid dictionary key
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

### Create Dictionary Item

Create new item in dictionary.

**Endpoint:** `POST /admin/dictionaries/{key}`

**Authentication:** Cookie

**Path Parameters:**
- `key` (string) - Dictionary key

**Request Body:**
```json
{
  "name": {
    "hy": "Սրճարան",
    "ru": "Кафе",
    "en": "Café"
  },
  "sortOrder": 3
}
```

**Response:**
```json
{
  "id": "type3",
  "name": {
    "hy": "Սրճարան",
    "ru": "Кафе",
    "en": "Café"
  },
  "sortOrder": 3
}
```

**Status Codes:**
- `201 Created` - Item created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

### Update Dictionary Item

Update existing dictionary item.

**Endpoint:** `PUT /admin/dictionaries/{key}/{id}`

**Authentication:** Cookie

**Path Parameters:**
- `key` (string) - Dictionary key
- `id` (string) - Item ID

**Request Body:**
```json
{
  "hash": "f3e9d1a7c2b4",
  "name": {
    "hy": "Սրճարան/Կոֆի շոփ",
    "ru": "Кафе/Кофейня",
    "en": "Café/Coffee Shop"
  },
  "sortOrder": 3
}
```

**Status Codes:**
- `200 OK` - Item updated
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Item not found
- `409 Conflict` - Hash mismatch
- `500 Internal Server Error` - Server error

---

### Delete Dictionary Item

Delete dictionary item.

**Endpoint:** `DELETE /admin/dictionaries/{key}/{id}`

**Authentication:** Cookie

**Path Parameters:**
- `key` (string) - Dictionary key
- `id` (string) - Item ID

**Response:**
```
204 No Content
```

**Status Codes:**
- `204 No Content` - Item deleted
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Item not found
- `409 Conflict` - Item in use, cannot delete
- `500 Internal Server Error` - Server error

---

## Audit Log API

### Get Audit Events

Get audit log events with filtering.

**Endpoint:** `GET /admin/audit`

**Authentication:** Cookie

**Query Parameters:**
- `startDate` (number, optional) - Unix timestamp in seconds
- `endDate` (number, optional) - Unix timestamp in seconds
- `actorId` (string, optional) - Filter by actor ID
- `action` (string, optional) - Filter by action type
- `entityType` (string, optional) - Filter by entity type
- `entityId` (string, optional) - Filter by entity ID
- `limit` (number, optional) - Max results (default: 100, max: 1000)
- `offset` (number, optional) - Pagination offset

**Request:**
```http
GET /admin/audit?startDate=1705622400&action=create&limit=50 HTTP/1.1
Host: dev.getmenu.am
Cookie: admin_token=...
```

**Response:**
```json
{
  "events": [
    {
      "id": "event1",
      "timestamp": 1705622400,
      "actorId": "emp1",
      "actorName": "Jane Smith",
      "action": "create",
      "entityType": "restaurant",
      "entityId": "rest2",
      "entityLabel": "Sushi Paradise",
      "metadata": {
        "field": "value"
      }
    }
  ],
  "total": 150,
  "limit": 50,
  "offset": 0
}
```

**Action Types:**
- `login` - User login
- `logout` - User logout
- `create` - Entity created
- `update` - Entity updated
- `block` - Entity blocked
- `unblock` - Entity unblocked
- `batch_create_qr` - Batch QR creation

**Entity Types:**
- `employee`
- `restaurant`
- `qr`
- `dictionary`
- `user`
- `advertiser`
- `campaign`
- `creative`

**Status Codes:**
- `200 OK` - Events retrieved
- `400 Bad Request` - Invalid parameters
- `401 Unauthorized` - Not authenticated
- `500 Internal Server Error` - Server error

---

## Error Handling

### Error Response Format

```json
{
  "error": {
    "message": "Human-readable error message",
    "code": "ERROR_CODE",
    "field": "fieldName",
    "details": { ... }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `UNAUTHORIZED` | Not authenticated |
| `FORBIDDEN` | Not authorized |
| `NOT_FOUND` | Resource not found |
| `VALIDATION_ERROR` | Input validation failed |
| `DUPLICATE_ERROR` | Duplicate resource |
| `CONFLICT` | Concurrent modification |
| `RATE_LIMIT` | Too many requests |
| `INTERNAL_ERROR` | Server error |

### HTTP Status Codes

| Status | Meaning |
|--------|---------|
| `200 OK` | Successful request |
| `201 Created` | Resource created |
| `204 No Content` | Successful, no response body |
| `400 Bad Request` | Invalid request |
| `401 Unauthorized` | Authentication required |
| `403 Forbidden` | Insufficient permissions |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Conflict with current state |
| `429 Too Many Requests` | Rate limit exceeded |
| `500 Internal Server Error` | Server error |
| `503 Service Unavailable` | Service temporarily unavailable |

---

## Rate Limiting

### Limits

- **Anonymous**: 60 requests per minute
- **Authenticated**: 300 requests per minute
- **Per IP**: 600 requests per minute

### Headers

```http
X-RateLimit-Limit: 300
X-RateLimit-Remaining: 250
X-RateLimit-Reset: 1705622460
```

### Exceeded Response

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 30

{
  "error": {
    "message": "Rate limit exceeded",
    "code": "RATE_LIMIT",
    "retryAfter": 30
  }
}
```

---

## Best Practices

### Pagination

For large result sets, use `limit` and `offset` parameters:

```
GET /admin/audit?limit=50&offset=0    # First page
GET /admin/audit?limit=50&offset=50   # Second page
GET /admin/audit?limit=50&offset=100  # Third page
```

### Caching

- Use `ETag` headers for conditional requests
- Cache dictionary data client-side
- Invalidate cache on mutations

### Security

- Always use HTTPS
- Never log or expose `admin_token` cookie
- Implement CSRF protection
- Validate all input data
- Sanitize output data

### Error Handling

- Always check status codes
- Handle network errors gracefully
- Display user-friendly error messages
- Log errors for debugging
- Implement retry logic for transient errors

---

**Last Updated:** January 26, 2026
