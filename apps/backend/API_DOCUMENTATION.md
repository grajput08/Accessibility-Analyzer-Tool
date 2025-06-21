# Accessibility Analyzer API Documentation

This document describes the API endpoints for the Accessibility Analyzer Tool backend.

## Base URL

```
http://localhost:3001/api/v1
```

## Endpoints

### 1. Health Check

**GET** `/health`

Returns the health status of the accessibility service.

**Response:**

```json
{
  "status": "healthy",
  "service": "accessibility-analyzer",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Analyze URL for Accessibility Issues

**POST** `/analyse`

Analyzes a given URL for accessibility issues using Pa11y.

**Request Body:**

```json
{
  "url": "https://example.com",
  "standard": "WCAG2AA",
  "includeWarnings": true,
  "includeNotices": true,
  "actions": [],
  "wait": 0,
  "timeout": 30000,
  "hideElements": ""
}
```

**Parameters:**

- `url` (required): The URL to analyze
- `standard` (optional): Accessibility standard to test against
  - `WCAG2A` - WCAG 2.0 Level A
  - `WCAG2AA` - WCAG 2.0 Level AA (default)
  - `WCAG2AAA` - WCAG 2.0 Level AAA
  - `Section508` - Section 508
- `includeWarnings` (optional): Include warnings in results (default: true)
- `includeNotices` (optional): Include notices in results (default: true)
- `actions` (optional): Array of actions to perform before testing
- `wait` (optional): Time to wait after page load in milliseconds (default: 0)
- `timeout` (optional): Test timeout in milliseconds (default: 30000)
- `hideElements` (optional): CSS selector for elements to hide during testing

**Response:**

```json
{
  "documentTitle": "Example Domain",
  "pageUrl": "https://example.com",
  "issues": [
    {
      "code": "WCAG2AA.Principle1.Guideline1_1.1_1_1",
      "context": "<img src=\"image.jpg\" alt=\"\">",
      "message": "This image does not have an alt attribute",
      "selector": "img",
      "type": "error"
    }
  ],
  "standards": {
    "WCAG2AA": {
      "errors": 1,
      "warnings": 0,
      "notices": 0
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response:**

```json
{
  "error": "Accessibility analysis failed",
  "message": "URL is required",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Usage Examples

### Basic Analysis

```bash
curl -X POST http://localhost:3001/api/v1/analyse \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com"
  }'
```

### Advanced Analysis with Custom Options

```bash
curl -X POST http://localhost:3001/api/v1/analyse \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "standard": "WCAG2AAA",
    "includeWarnings": true,
    "includeNotices": false,
    "actions": [
      "click element #login-button",
      "wait for element #dashboard to be visible"
    ],
    "wait": 2000,
    "timeout": 60000
  }'
```

### JavaScript Example

```javascript
const response = await fetch('http://localhost:3001/api/v1/analyse', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    url: 'https://example.com',
    standard: 'WCAG2AA',
    includeWarnings: true,
    includeNotices: true,
  }),
});

const results = await response.json();
console.log('Accessibility issues found:', results.issues.length);
```

## Testing

Run the test script to verify the API is working:

```bash
cd apps/backend
node test-api.js
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad Request (invalid URL, missing required fields)
- `500`: Internal Server Error

All error responses include:

- `error`: Error type
- `message`: Detailed error message
- `timestamp`: When the error occurred

## Dependencies

This API uses [Pa11y](https://github.com/pa11y/pa11y) for accessibility testing, which provides comprehensive WCAG compliance checking.
