# GoFood Restaurant API Proxy

A simple Express.js proxy service that forwards restaurant requests to the GoFood API with authentication.

## Features

- ✅ Proxy requests to GoFood API
- ✅ Bearer token authentication
- ✅ Error handling and logging
- ✅ CORS support
- ✅ Health check endpoint
- ✅ Default location fallback

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Get Restaurant Details
```
GET /get-restaurant?url={gofood_url}
```

**Parameters:**
- `url` (query, required): Full GoFood restaurant URL
- `picked_loc` (query, optional): Location coordinates (default: Jakarta coordinates)

**Example:**
```bash
curl "http://localhost:3000/get-restaurant?url=https://gofood.co.id/jakarta/restaurant/rm-sinar-minang-metland-d028264f-8da3-4bcd-a33e-fcc8f2a30882"
```

**With custom location:**
```bash
curl "http://localhost:3000/get-restaurant?url=https://gofood.co.id/jakarta/restaurant/rm-sinar-minang-metland-d028264f-8da3-4bcd-a33e-fcc8f2a30882&picked_loc=-6.2032022%2C106.715"
```

### Health Check
```
GET /health
```

### API Info
```
GET /
```

## Configuration

The service runs on port 3000 by default. You can change this by setting the `PORT` environment variable:

```bash
PORT=8080 npm start
```

## How it works

1. Your request: `GET localhost:3000/get-restaurant?url=https://gofood.co.id/jakarta/restaurant/rm-sinar-minang-metland-d028264f-8da3-4bcd-a33e-fcc8f2a30882`
2. Service extracts UUID (`d028264f-8da3-4bcd-a33e-fcc8f2a30882`) from the URL
3. Proxy forwards to: `GET https://api.gojekapi.com/gofood/consumer/v5/restaurants/{uuid}?picked_loc={location}`
4. Adds Bearer token authentication header
5. Returns JSON response

## Error Handling

The service handles various error scenarios:
- GoFood API errors (returns original status and message)
- Network connectivity issues (503 Service Unavailable)
- Internal server errors (500 Internal Server Error)

## Dependencies

- `express`: Web framework
- `axios`: HTTP client for API requests
- `cors`: Cross-origin resource sharing
- `nodemon`: Development auto-reload (dev dependency) 