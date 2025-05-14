# JSON Parsing Error Fix

## Problem Description

The backend API was encountering errors when processing JSON requests, specifically with the authentication endpoints (`/api/auth/login` and `/api/auth/register`). The error logs showed:

```
Error: Expected property name or '}' in JSON at position 1 (line 1 column 2)
```

The issue was caused by improper JSON formatting in the requests, where the JSON strings contained escaped quotation marks (`\"`), resulting in malformed JSON that could not be parsed by Express's built-in JSON parser.

Example of problematic request body:
```
{\"email\":\"test5@example.com\", \"password\":\"password123\"}
```

## Solution

We implemented a two-part solution:

1. Extended Express's JSON parser to store the original raw body before parsing:
   - Added a `verify` function to store the raw request body
   - Attempted to parse the raw body and if it fails, tried to unescape it

2. Created a custom middleware that:
   - Checks if the request is a POST, PUT, or PATCH with Content-Type: application/json
   - Attempts to fix malformed JSON by removing escape characters
   - Updates the request body with the corrected JSON

## Implementation

The solution involves:

1. Extending the Express Request interface to include the `rawBody` property
2. Creating a custom middleware (`jsonFixMiddleware`) that handles malformed JSON
3. Integrating the middleware into the Express application

## Testing

A test endpoint was added at `/api/test/json-parser` to verify that the middleware correctly handles both properly formatted and malformed JSON requests.

## Recommendations

If clients continue to send improperly formatted JSON, consider:

1. Working with the frontend team to ensure JSON is properly formatted before sending
2. Adding more robust error handling for various JSON parsing scenarios
3. Adding more detailed logging to help identify the source of malformed requests 