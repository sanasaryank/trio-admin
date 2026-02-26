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

All error responses follow a consistent format:

```json
{
  "code": 0,
  "message": "Error description"
}
```

**Fields:**
- `code`: Application-specific error code (usually 0 for most responses)
- `message`: Human-readable error message. If empty, a default error description based on the HTTP status code is shown

### HTTP Status Codes

The API uses the following HTTP status codes:

| Status Code | Name | Description | When Used |
|-------------|------|-------------|-----------|
| **2xx - Success** |
| `200 OK` | Success | Request successful | Most GET requests |
| `201 Created` | Created | Resource created | POST requests |
| `204 No Content` | No Content | Success, no response body | Logout, DELETE |
| **4xx - Client Errors** |
| `400` | Bad Request | Invalid request format or parameters | Malformed requests |
| `401` | Unauthorized | Authentication required or failed | Missing/invalid credentials |
| `403` | Forbidden | Insufficient permissions | Access denied |
| `405` | Method Not Allowed | HTTP method not supported | Wrong method used |
| `413` | Content Too Large | Request body too large | Payload exceeds limit |
| **4xx - Application Errors** |
| `455` | Application Error | General application error | Application-level errors |
| `456` | Restaurant Not Found | Restaurant not found | Restaurant ID invalid/deleted |
| `457` | Object Not Unique | Duplicate entry | Unique constraint violation |
| `458` | Object Not Found | Object was deleted | Object removed during operation |
| `460` | Object Changed | Concurrent modification | Hash/version mismatch on PUT |
| `461` | Server Data Error | Data consistency error | Server data corruption |
| **5xx - Server Errors** |
| `500` | Internal Server Error | Unexpected server error | Server-side exception |
| `502` | Bad Gateway | Gateway/proxy error | Upstream server error |
| `503` | Service Unavailable | Service temporarily down | Maintenance/overload |

### Special Status Codes Explained

#### 456 - Restaurant Not Found
Returned for requests with a restaurant ID when the restaurant doesn't exist on the server.

**Example:**
```http
GET /admin/restaurants/invalid-id HTTP/1.1

HTTP/1.1 456 Restaurant Not Found
{
  "code": 0,
  "message": "Restaurant not found"
}
```

#### 457 - Object Not Unique
Returned on POST or PUT requests when a unique field constraint is violated (e.g., duplicate name).

**Example:**
```http
POST /admin/restaurants HTTP/1.1
{
  "name": "Existing Restaurant",
  ...
}

HTTP/1.1 457 Object Not Unique
{
  "code": 0,
  "message": "Restaurant with this name already exists"
}
```

#### 458 - Object Not Found
Returned when an object was deleted during an operation (between read and update).

**Example:**
```http
PUT /admin/employees/emp123 HTTP/1.1
{...}

HTTP/1.1 458 Object Not Found
{
  "code": 0,
  "message": "Employee was deleted"
}
```

#### 460 - Object Changed
Returned on PUT requests when the object's hash/version changed during the operation (optimistic locking).

**Example:**
```http
PUT /admin/restaurants/rest123 HTTP/1.1
{
  "hash": "old-hash-value",
  ...
}

HTTP/1.1 460 Object Changed
{
  "code": 0,
  "message": "Restaurant was modified by another user. Please refresh and try again"
}
```

### Error Handling Best Practices

1. **Check HTTP Status Code First**: Always check the HTTP status code to determine the error category
2. **Parse Error Response**: Extract `code` and `message` from the response body
3. **Display User-Friendly Messages**: Show the `message` field to users; if empty, show the default error description for that status code
4. **Use TypeScript Type Guards**: Use `isApiError()` to safely access ApiError properties
5. **Handle Specific Errors**:
   - `401`: Automatically redirects to login (handled by client)
   - `456`: Show "Restaurant not found" error
   - `457`: Show validation error for duplicate entries
   - `458`: Show "Item was deleted" and refresh list
   - `460`: Show "Item was changed" and prompt to refresh
   - `5xx`: Implement retry logic with exponential backoff
6. **Retry Logic**: Use `error.isRetryable()` to check if error can be retried
7. **Logging**: Log all errors with full context for debugging
8. **Network Errors**: Handle network failures gracefully

### Implementation Notes

The application uses a centralized error handling system:
- **Error Module**: `src/api/errors.ts` - Contains `ApiError` class and utilities
- **Client Module**: `src/api/real/client.ts` - Automatically parses errors and throws `ApiError`
- **Exports**: Available via `import { ApiError, isApiError, getErrorMessage } from '@/api'`

**Key Features:**
- Automatic 401 handling with redirect to login
- Type-safe error checking with TypeScript
- Convenience methods for common error scenarios
- Automatic fallback to status-specific descriptions when message is empty
- Proper stack traces for debugging

### Example Error Handling

#### Using the ApiError Class (Recommended)

The application provides a typed `ApiError` class for better error handling:

```typescript
import { isApiError, getErrorMessage } from '@/api';

// Basic error handling
try {
  await restaurantsApi.create(data);
} catch (error) {
  alert(getErrorMessage(error)); // Works with any error type
}

// Type-safe error handling
try {
  await restaurantsApi.update(id, data);
} catch (error) {
  if (isApiError(error)) {
    // Now TypeScript knows it's an ApiError
    console.log(error.statusCode);
    console.log(error.getUserMessage());
  }
}

// Specific error detection
try {
  await restaurantsApi.create(data);
} catch (error) {
  if (isApiError(error)) {
    if (error.isObjectNotUnique()) {
      setFieldError('name', 'This name is already taken');
    } else if (error.isObjectChanged()) {
      showRefreshDialog();
    } else if (error.isRetryable()) {
      retryWithBackoff();
    } else {
      showError(error.getUserMessage());
    }
  }
}
```

#### ApiError Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getUserMessage()` | string | User-friendly error message |
| `isRestaurantNotFound()` | boolean | Restaurant not found (456) |
| `isObjectNotUnique()` | boolean | Duplicate entry (457) |
| `isObjectNotFound()` | boolean | Object deleted (458) |
| `isObjectChanged()` | boolean | Optimistic lock (460) |
| `isUnauthorized()` | boolean | Not authenticated (401) |
| `isServerError()` | boolean | 5xx error |
| `isRetryable()` | boolean | Can retry (500, 502, 503) |

#### Common Patterns

**Form Submission:**
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await restaurantsApi.create(data);
    showSuccess('Created successfully');
    navigate('/list');
  } catch (error) {
    if (isApiError(error) && error.isObjectNotUnique()) {
      setError('name', { message: 'Name already exists' });
    } else {
      showError(getErrorMessage(error));
    }
  }
};
```

**Optimistic Lock Handling:**
```typescript
const handleUpdate = async (id: string, data: FormData) => {
  try {
    await restaurantsApi.update(id, data);
    showSuccess('Updated successfully');
  } catch (error) {
    if (isApiError(error) && error.isObjectChanged()) {
      const shouldRetry = await showConfirmDialog(
        'This item was modified by another user. Refresh and try again?'
      );
      if (shouldRetry) {
        refreshData();
      }
    } else {
      showError(getErrorMessage(error));
    }
  }
};
```

**Retry Logic:**
```typescript
const fetchWithRetry = async (maxAttempts = 3) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await restaurantsApi.list();
    } catch (error) {
      if (isApiError(error) && error.isRetryable() && attempt < maxAttempts) {
        await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
        continue;
      }
      throw error;
    }
  }
};
```

#### Raw Fetch Example (Legacy)

```typescript
try {
  const response = await fetch('/admin/restaurants', {...});
  
  if (!response.ok) {
    const errorData = await response.json();
    const message = errorData.message || 'Unhandled error from server';
    
    switch (response.status) {
      case 401:
        window.location.href = '/login';
        break;
      case 456:
        alert('Restaurant not found');
        break;
      case 457:
        alert('Duplicate entry: ' + message);
        break;
      case 458:
        alert('Item was deleted. Refreshing...');
        refreshList();
        break;
      case 460:
        alert('Item was modified. Please refresh and try again.');
        break;
      case 500:
      case 502:
      case 503:
        retryRequest();
        break;
      default:
        alert(message);
    }
  }
} catch (error) {
  alert('Network error. Please check your connection.');
}
```

### Common Error Codes (Legacy)

**Note:** The `code` field in the response body is typically `0`. The HTTP status code is the primary indicator of the error type.

| HTTP Status | Error Type |
|-------------|------------|
| `400` | Bad Request |
| `401` | Unauthorized |
| `403` | Forbidden |
| `455` | Application Error |
| `456` | Restaurant Not Found |
| `457` | Object Not Unique |
| `458` | Object Not Found |
| `460` | Object Changed |
| `461` | Server Data Error |
| `500` | Internal Server Error |
| `502` | Bad Gateway |
| `503` | Service Unavailable |

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
  "code": 0,
  "message": "Rate limit exceeded"
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

- Always check HTTP status codes (primary error indicator)
- Parse the response body for `code` and `message` fields
- Display user-friendly error messages from `message` field
- If `message` is empty, default descriptions are shown based on status code
- Use `isApiError()` type guard for type-safe error handling
- Use `getErrorMessage()` for consistent message extraction
- Handle specific error codes appropriately:
  - `401`: Automatically redirects to login page
  - `456`: Restaurant not found error
  - `457`: Duplicate/uniqueness validation error
  - `458`: Refresh list as object was deleted
  - `460`: Prompt user to refresh and retry (optimistic lock conflict)
  - Use `error.isRetryable()` for 5xx errors
- Take advantage of `ApiError` convenience methods (isObjectNotUnique, isObjectChanged, etc.)
- Log all errors with full context for debugging
- Handle network errors gracefully

---

**Last Updated:** January 26, 2026
