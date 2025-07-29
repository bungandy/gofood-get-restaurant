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

2. Set up environment variables:
```bash
# Copy the example environment file
cp env.example .env

# Edit .env file and add your Gojek Bearer token
# GOJEK_BEARER_TOKEN=your_actual_gojek_bearer_token_here
```

3. Start the server:
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

**Example:**
```bash
curl "http://localhost:3000/get-restaurant?url=https://gofood.co.id/jakarta/restaurant/rm-sinar-minang-metland-d028264f-8da3-4bcd-a33e-fcc8f2a30882"
```

**Note:** Location coordinates are always taken from the `DEFAULT_LOCATION` environment variable.

### Health Check
```
GET /health
```

### API Info
```
GET /
```

## Configuration

### Environment Variables

The following environment variables are required:

- `GOJEK_BEARER_TOKEN` (required): Your Gojek API Bearer token
- `DEFAULT_LOCATION` (required): Location coordinates for API requests (format: lat,lng)
- `PORT` (optional): Server port (default: 3000)

### Setting up .env file

Create a `.env` file in the project root:

```bash
# GoFood API Configuration
GOJEK_BEARER_TOKEN=your_gojek_bearer_token_here

# Location coordinates (required) - Jakarta coordinates example
DEFAULT_LOCATION=-6.2032022,106.715

# Optional: Server Port (default: 3000)
PORT=3000
```

### Running with custom port

```bash
PORT=8080 npm start
```

## How it works

1. Your request: `GET localhost:3000/get-restaurant?url=https://gofood.co.id/jakarta/restaurant/rm-sinar-minang-metland-d028264f-8da3-4bcd-a33e-fcc8f2a30882`
2. Service extracts UUID (`d028264f-8da3-4bcd-a33e-fcc8f2a30882`) from the URL
3. Service uses location from `DEFAULT_LOCATION` environment variable
4. Proxy forwards to: `GET https://api.gojekapi.com/gofood/consumer/v5/restaurants/{uuid}?picked_loc={env_location}`
5. Adds Bearer token authentication header
6. Returns JSON response

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