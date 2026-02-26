# Trio SuperAdmin API Documentation

Complete API reference for the Trio SuperAdmin application.

**⚠️ Note:** This documentation uses the old token-based authentication model. 
For the updated cookie-based authentication, see [docs/API.md](./docs/API.md).

---

## Authentication Endpoints

### 1. Login
**Endpoint:** `POST https://dev.getmenu.am/admin/auth/login`

**Authentication:** Basic Auth (username:password in Authorization header)

**New Behavior (Cookie-Based):**
- Server sets HttpOnly cookie named `admin_token`
- No token returned in response body
- Cookie automatically sent with all subsequent requests

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "username": "admin",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Cookies Set:**
- `admin_token` - HttpOnly, Secure, SameSite=Strict

### 2. Get Current User
**Endpoint:** `GET https://dev.getmenu.am/admin/auth/me`

**Authentication:** Cookie (admin_token automatically sent)

**Request:** No body

**Response:**
```json
{
  "username": "admin",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 3. Logout
**Endpoint:** `POST https://dev.getmenu.am/admin/auth/logout`

**Authentication:** Bearer Token

**Request:** No body

**Response:** No content (204)

---

## Employee Endpoints

### 1. List All Employees
**Endpoint:** `GET /api/employees`

**Request:** No body

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
    "blocked": false
  }
]
```

### 2. Get Employee by ID
**Endpoint:** `GET /api/employees/{id}`

**Request:** No body

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

### 3. Create Employee
**Endpoint:** `POST /api/employees`

**Request:**
```json
{
  "firstName": "Alice",
  "lastName": "Brown",
  "username": "abrown",
  "password": "securePassword123",
  "blocked": false
}
```

**Response:**
```json
{
  "id": "emp3",
  "firstName": "Alice",
  "lastName": "Brown",
  "username": "abrown",
  "password": "securePassword123",
  "blocked": false
}
```

### 4. Update Employee
**Endpoint:** `PUT /api/employees/{id}`

**Request:**
```json
{
  "hash": "b7c2e4f1a9d3",
  "firstName": "Alice",
  "lastName": "Brown-Wilson",
  "username": "abrown",
  "password": "newPassword456",
  "changePassword": true,
  "blocked": false
}
```

**Response:**
```json
{
  "id": "emp3",
  "firstName": "Alice",
  "lastName": "Brown-Wilson",
  "username": "abrown",
  "password": "newPassword456",
  "blocked": false
}
```

### 5. Block/Unblock Employee
**Endpoint:** `PATCH /api/employees/{id}/block`

**Request:**
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

---

## Restaurant Endpoints

### 1. List All Restaurants
**Endpoint:** `GET /api/restaurants`

**Request:** No body

**Response:**
```json
[
  {
    "id": "rest1",
    "name": "Bella Italia",
    "crmUrl": "https://crm.bellaitalia.com",
    "countryId": "country1",
    "cityId": "city1",
    "districtId": "district1",
    "address": "123 Main Street",
    "lat": 40.7589,
    "lng": -73.9851,
    "typeId": ["type1", "type2"],
    "priceSegmentId": ["price2"],
    "menuTypeId": ["menu1", "menu3"],
    "integrationTypeId": "integration1",
    "adminEmail": "admin@bellaitalia.com",
    "connectionData": {
      "host": "db.bellaitalia.com",
      "port": 5432,
      "username": "dbuser"
    },
    "blocked": false,
    "lastClientActivityAt": 1705622400,
    "lastRestaurantActivityAt": 1705622100
  }
]
```

### 2. Get Restaurant by ID
**Endpoint:** `GET /api/restaurants/{id}`

**Request:** No body

**Response:**
```json
{
  "id": "rest1",
  "hash": "d9e7f2a8b4c6",
  "name": "Bella Italia",
  "crmUrl": "https://crm.bellaitalia.com",
  "countryId": "country1",
  "cityId": "city1",
  "districtId": "district1",
  "address": "123 Main Street",
  "lat": 40.7589,
  "lng": -73.9851,
  "typeId": ["type1", "type2"],
  "priceSegmentId": ["price2"],
  "menuTypeId": ["menu1", "menu3"],
  "integrationTypeId": "integration1",
  "adminEmail": "admin@bellaitalia.com",
  "connectionData": {
    "host": "db.bellaitalia.com",
    "port": 5432,
    "username": "dbuser"
  },
  "blocked": false,
  "lastClientActivityAt": 1705622400,
  "lastRestaurantActivityAt": 1705622100
}
```

### 3. Create Restaurant
**Endpoint:** `POST /api/restaurants`

**Request:**
```json
{
  "name": "Sushi Paradise",
  "crmUrl": "https://crm.sushiparadise.com",
  "countryId": "country1",
  "cityId": "city1",
  "districtId": "district2",
  "address": "456 Oak Avenue",
  "lat": 40.7614,
  "lng": -73.9776,
  "typeId": ["type3"],
  "priceSegmentId": ["price3"],
  "menuTypeId": ["menu2"],
  "integrationTypeId": "integration2",
  "adminEmail": "admin@sushiparadise.com",
  "connectionData": {
    "host": "db.sushiparadise.com",
    "port": 3306,
    "username": "sushi_admin",
    "password": "dbPassword789",
    "changePassword": false
  },
  "blocked": false
}
```

**Response:**
```json
{
  "id": "rest2",
  "name": "Sushi Paradise",
  "crmUrl": "https://crm.sushiparadise.com",
  "countryId": "country1",
  "cityId": "city1",
  "districtId": "district2",
  "address": "456 Oak Avenue",
  "lat": 40.7614,
  "lng": -73.9776,
  "typeId": ["type3"],
  "priceSegmentId": ["price3"],
  "menuTypeId": ["menu2"],
  "integrationTypeId": "integration2",
  "adminEmail": "admin@sushiparadise.com",
  "connectionData": {
    "host": "db.sushiparadise.com",
    "port": 3306,
    "username": "sushi_admin",
    "password": "dbPassword789"
  },
  "blocked": false
}
```

### 4. Update Restaurant
**Endpoint:** `PUT /api/restaurants/{id}`

**Request:**
```json
{
  "hash": "e3a9c5d1f8b2",
  "name": "Sushi Paradise Deluxe",
  "crmUrl": "https://crm.sushiparadise.com",
  "countryId": "country1",
  "cityId": "city1",
  "districtId": "district2",
  "address": "456 Oak Avenue, Suite 100",
  "lat": 40.7614,
  "lng": -73.9776,
  "typeId": ["type3"],
  "priceSegmentId": ["price3"],
  "menuTypeId": ["menu2"],
  "integrationTypeId": "integration2",
  "adminEmail": "admin@sushiparadise.com",
  "connectionData": {
    "host": "db.sushiparadise.com",
    "port": 3306,
    "username": "sushi_admin",
    "password": "newDbPassword",
    "changePassword": true
  },
  "blocked": false
}
```

**Response:**
```json
{
  "id": "rest2",
  "name": "Sushi Paradise Deluxe",
  "crmUrl": "https://crm.sushiparadise.com",
  "countryId": "country1",
  "cityId": "city1",
  "districtId": "district2",
  "address": "456 Oak Avenue, Suite 100",
  "lat": 40.7614,
  "lng": -73.9776,
  "typeId": ["type3"],
  "priceSegmentId": ["price3"],
  "menuTypeId": ["menu2"],
  "integrationTypeId": "integration2",
  "adminEmail": "admin@sushiparadise.com",
  "connectionData": {
    "host": "db.sushiparadise.com",
    "port": 3306,
    "username": "sushi_admin",
    "password": "newDbPassword"
  },
  "blocked": false
}
```

### 5. Block/Unblock Restaurant
**Endpoint:** `PATCH /api/restaurants/{id}/block`

**Request:**
```json
{
  "blocked": true
}
```

**Response:**
```json
{
  "id": "rest2",
  "name": "Sushi Paradise Deluxe",
  "crmUrl": "https://crm.sushiparadise.com",
  "countryId": "country1",
  "cityId": "city1",
  "districtId": "district2",
  "address": "456 Oak Avenue, Suite 100",
  "lat": 40.7614,
  "lng": -73.9776,
  "typeId": ["type3"],
  "priceSegmentId": ["price3"],
  "menuTypeId": ["menu2"],
  "integrationTypeId": "integration2",
  "adminEmail": "admin@sushiparadise.com",
  "connectionData": {
    "host": "db.sushiparadise.com",
    "port": 3306,
    "username": "sushi_admin",
    "password": "newDbPassword"
  },
  "blocked": true
}
```

### 6. Get QR Codes for Restaurant
**Endpoint:** `GET /api/restaurants/{restaurantId}/qr-codes`

**Request:** No body

**Response:**
```json
[
  {
    "id": "qr1",
    "restaurantId": "rest1",
    "qrText": "https://menu.trio.app/r1q1",
    "tableNumber": "Table 1",
    "blocked": false
  },
  {
    "id": "qr2",
    "restaurantId": "rest1",
    "qrText": "https://menu.trio.app/r1q2",
    "tableNumber": "Table 2",
    "blocked": false
  }
]
```

### 7. Create QR Code Batch
**Endpoint:** `POST /api/restaurants/{restaurantId}/qr-codes/batch`

**Request:**
```json
{
  "count": 5
}
```

**Response:**
```json
[
  {
    "id": "qr10",
    "restaurantId": "rest1",
    "qrText": "https://menu.trio.app/r1q10",
    "blocked": false
  },
  {
    "id": "qr11",
    "restaurantId": "rest1",
    "qrText": "https://menu.trio.app/r1q11",
    "blocked": false
  },
  {
    "id": "qr12",
    "restaurantId": "rest1",
    "qrText": "https://menu.trio.app/r1q12",
    "blocked": false
  },
  {
    "id": "qr13",
    "restaurantId": "rest1",
    "qrText": "https://menu.trio.app/r1q13",
    "blocked": false
  },
  {
    "id": "qr14",
    "restaurantId": "rest1",
    "qrText": "https://menu.trio.app/r1q14",
    "blocked": false
  }
]
```

### 8. Block/Unblock QR Code
**Endpoint:** `PATCH /api/restaurants/{restaurantId}/qr-codes/{qrId}/block`

**Request:**
```json
{
  "blocked": true
}
```

**Response:**
```json
{
  "id": "qr10",
  "restaurantId": "rest1",
  "qrText": "https://menu.trio.app/r1q10",
  "blocked": true
}
```

---

## Dictionary Endpoints

### 1. List Dictionary Items
**Endpoint:** `GET /api/dictionaries/{dictKey}`

**Dictionary Keys:**
- `restaurant-types`
- `price-segments`
- `menu-types`
- `integration-types`
- `placements`
- `countries`
- `cities`
- `districts`

**Request:** No body

**Response for `restaurant-types`:**
```json
[
  {
    "id": "type1",
    "name": "Italian",
    "blocked": false
  },
  {
    "id": "type2",
    "name": "Chinese",
    "blocked": false
  }
]
```

**Response for `placements`:**
```json
[
  {
    "id": "placement1",
    "name": "Main Menu Banner",
    "rotation": 30,
    "refreshTtl": 3600,
    "noAdjacentSameAdvertiser": true,
    "blocked": false
  }
]
```

**Response for `cities`:**
```json
[
  {
    "id": "city1",
    "name": "New York",
    "countryId": "country1",
    "blocked": false
  }
]
```

**Response for `districts`:**
```json
[
  {
    "id": "district1",
    "name": "Manhattan",
    "cityId": "city1",
    "blocked": false
  }
]
```

### 2. Get Dictionary Item by ID
**Endpoint:** `GET /api/dictionaries/{dictKey}/{id}`

**Request:** No body

**Response:**
```json
{
  "id": "type1",
  "hash": "f5b8c2e9a3d7",
  "name": "Italian",
  "blocked": false
}
```

### 3. Create Dictionary Item
**Endpoint:** `POST /api/dictionaries/{dictKey}`

**Request for basic dictionary:**
```json
{
  "name": "Japanese",
  "blocked": false
}
```

**Request for placement:**
```json
{
  "name": "Footer Banner",
  "rotation": 45,
  "refreshTtl": 7200,
  "noAdjacentSameAdvertiser": false,
  "blocked": false
}
```

**Request for city:**
```json
{
  "name": "Los Angeles",
  "countryId": "country1",
  "blocked": false
}
```

**Request for district:**
```json
{
  "name": "Hollywood",
  "cityId": "city2",
  "blocked": false
}
```

**Response:**
```json
{
  "id": "type5",
  "name": "Japanese",
  "blocked": false
}
```

### 4. Update Dictionary Item
**Endpoint:** `PUT /api/dictionaries/{dictKey}/{id}`

**Request:**
```json
{
  "hash": "g6c9d4f2b8e1",
  "name": "Japanese Cuisine",
  "blocked": false
}
```

**Response:**
```json
{
  "id": "type5",
  "name": "Japanese Cuisine",
  "blocked": false
}
```

### 5. Block/Unblock Dictionary Item
**Endpoint:** `PATCH /api/dictionaries/{dictKey}/{id}/block`

**Request:**
```json
{
  "blocked": true
}
```

**Response:**
```json
{
  "id": "type5",
  "name": "Japanese Cuisine",
  "blocked": true
}
```

---

## Audit Log Endpoints

### 1. Get Audit Events
**Endpoint:** `GET /api/audit/events`

**Request Parameters (optional):**
- `entityType`: Filter by entity type (employee, restaurant, qr, dictionary, user, advertiser, campaign, creative)
- `entityId`: Filter by entity ID

**Request:** No body

**Response:**
```json
[
  {
    "id": "audit1",
    "timestamp": 1705622400,
    "actorId": "user1",
    "actorName": "John Doe",
    "action": "login",
    "entityType": "user",
    "entityId": "user1",
    "entityLabel": "admin",
    "metadata": {}
  },
  {
    "id": "audit2",
    "timestamp": 1705622450,
    "actorId": "user1",
    "actorName": "John Doe",
    "action": "create",
    "entityType": "restaurant",
    "entityId": "rest2",
    "entityLabel": "Sushi Paradise",
    "metadata": {}
  },
  {
    "id": "audit3",
    "timestamp": 1705622500,
    "actorId": "user1",
    "actorName": "John Doe",
    "action": "block",
    "entityType": "employee",
    "entityId": "emp3",
    "entityLabel": "Alice Brown-Wilson",
    "metadata": {}
  },
  {
    "id": "audit4",
    "timestamp": 1705622550,
    "actorId": "user1",
    "actorName": "John Doe",
    "action": "batch_create_qr",
    "entityType": "qr",
    "entityId": "rest1",
    "entityLabel": "Restaurant: Bella Italia",
    "metadata": {
      "count": 5,
      "restaurantId": "rest1"
    }
  }
]
```

**Response with filters (e.g., `entityType=restaurant&entityId=rest1`):**
```json
[
  {
    "id": "audit2",
    "timestamp": 1705622450,
    "actorId": "user1",
    "actorName": "John Doe",
    "action": "create",
    "entityType": "restaurant",
    "entityId": "rest1",
    "entityLabel": "Bella Italia",
    "metadata": {}
  },
  {
    "id": "audit5",
    "timestamp": 1705622600,
    "actorId": "user1",
    "actorName": "John Doe",
    "action": "update",
    "entityType": "restaurant",
    "entityId": "rest1",
    "entityLabel": "Bella Italia",
    "metadata": {}
  }
]
```

---

## Data Types Reference

### Base Entity
All entities extend the base entity structure:
```json
{
  "id": "entity1",
  "blocked": false
}
```

### Hash Field
All GET by ID responses include a `hash` field that must be included in PUT requests (excluding block/unblock operations) for optimistic concurrency control:
```json
{
  "id": "entity1",
  "hash": "abc123def456",
  "blocked": false
}
```

### Timestamps
Timestamps (where present) are Unix timestamps in seconds (not milliseconds).

### Audit Actions
Available audit actions:
- `login`
- `logout`
- `create`
- `update`
- `block`
- `unblock`
- `batch_create_qr`

### Entity Types
Available entity types for audit logs:
- `employee`
- `restaurant`
- `qr`
- `dictionary`
- `user`
- `advertiser`
- `campaign`
- `creative`

### Connection Data Structure
```json
{
  "host": "db.example.com",
  "port": 5432,
  "username": "dbuser",
  "password": "dbpassword"
}
```
Note: Password is optional in responses for security reasons.

---

## Error Responses

**⚠️ Note:** This section describes the legacy error format. For the updated error handling with specific HTTP status codes (456, 457, 458, 460, 461, etc.), see [docs/API.md](./docs/API.md).

All endpoints may return error responses in the following format:

```json
{
  "code": 0,
  "message": "Error description"
}
```

### Common HTTP Status Codes

**400 Bad Request:**
```json
{
  "code": 0,
  "message": "Invalid input data"
}
```

**401 Unauthorized:**
```json
{
  "code": 0,
  "message": "Not authenticated"
}
```

**456 Restaurant Not Found:**
```json
{
  "code": 0,
  "message": "Restaurant not found"
}
```

**457 Object Not Unique:**
```json
{
  "code": 0,
  "message": "Restaurant with this name already exists"
}
```

**458 Object Not Found:**
```json
{
  "code": 0,
  "message": "Object was deleted"
}
```

**460 Object Changed:**
```json
{
  "code": 0,
  "message": "Object was modified by another user"
}
```

**500 Internal Server Error:**
```json
{
  "code": 0,
  "message": "Internal server error"
}
```

For complete error handling documentation including all status codes (455, 461, 502, 503) and best practices, see [docs/API.md](./docs/API.md#error-handling).

---

## Notes

1. **Authentication**: All endpoints (except login) require authentication via session cookie or token.
2. **ID Format**: All `id` fields are strings, not numbers.
3. **Hash Field**: GET by ID responses include a `hash` field. This hash must be included in PUT requests (excluding block/unblock) for optimistic concurrency control.
4. **Timestamps**: Timestamps (where present, e.g., `lastClientActivityAt`) are Unix timestamps in seconds.
5. **Passwords**: Passwords are only included in responses from mock API for development purposes. In production, passwords should never be returned in API responses.
6. **Change Password Flag**: The `changePassword` flag is used to indicate whether the password should be updated during edit operations.
7. **Array Fields**: Fields like `typeId`, `priceSegmentId`, and `menuTypeId` can contain multiple string IDs.
8. **Geographic Hierarchy**: Country → City → District.
9. **QR Codes**: QR codes may have a `tableNumber` that comes from the restaurant's integration system and is not editable.
10. **Base Entity**: The base entity structure only contains `id` (string) and `blocked` (boolean) fields. `createdAt` and `updatedAt` are not part of the base entity.

---

## Locations API Endpoint (Read-Only)

This endpoint provides read-only access to all geographic location data (countries, cities, and districts) in a single request for populating dropdowns in restaurant forms.

### 1. Get All Locations
**Endpoint:** `GET /api/locations`

**Request:** No body

**Response:**
```json
{
  "countries": [
    {
      "id": "country1",
      "name": "Հայաստան",
      "blocked": false
    }
  ],
  "cities": [
    {
      "id": "city1",
      "name": "Երևան",
      "countryId": "country1",
      "blocked": false
    },
    {
      "id": "city2",
      "name": "Արագածոտն",
      "countryId": "country1",
      "blocked": false
    },
    {
      "id": "city3",
      "name": "Արարատ",
      "countryId": "country1",
      "blocked": false
    }
  ],
  "districts": [
    {
      "id": "dist1",
      "name": "Աջափնյակ",
      "cityId": "city1",
      "blocked": false
    },
    {
      "id": "dist2",
      "name": "Արաբկիր",
      "cityId": "city1",
      "blocked": false
    },
    {
      "id": "dist3",
      "name": "Ավան",
      "cityId": "city1",
      "blocked": false
    }
  ]
}
```

**Location Data Notes:**
1. **Single Request**: All location data is returned in one request to reduce HTTP overhead
2. **Read-Only**: Location data (countries, cities, districts) is read-only and managed by backend administrators
3. **Geographic Hierarchy**: Country → City (Marz/Province) → District
4. **Usage**: This endpoint is used to populate dropdowns in restaurant creation/edit forms
5. **Filtering**: Frontend filters cities by `countryId` and districts by `cityId` after fetching the data
6. **Armenian Data**: Currently contains 1 country (Հայաստան), 11 cities (marzes), and 81 districts
