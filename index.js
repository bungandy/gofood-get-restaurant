require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// GoFood API configuration
const GOFOOD_BASE_URL = 'https://api.gojekapi.com/gofood/consumer';
const GOJEK_BEARER_TOKEN = process.env.GOJEK_BEARER_TOKEN;
const DEFAULT_LOCATION = process.env.DEFAULT_LOCATION;

// Validate required environment variables
if (!GOJEK_BEARER_TOKEN) {
  console.error('❌ Error: GOJEK_BEARER_TOKEN environment variable is required');
  console.error('💡 Please set your Gojek Bearer token in the .env file or environment variable');
  process.exit(1);
}

if (!DEFAULT_LOCATION) {
  console.error('❌ Error: DEFAULT_LOCATION environment variable is required');
  console.error('💡 Please set your default location coordinates in the .env file');
  console.error('💡 Example: DEFAULT_LOCATION=-6.2032022,106.715');
  process.exit(1);
}

// Function to extract UUID from GoFood URL
function extractUuidFromUrl(url) {
  // Remove any query parameters or fragments first
  const cleanUrl = url.split('?')[0].split('#')[0];
  
  // UUID pattern: 8-4-4-4-12 characters (e.g., d028264f-8da3-4bcd-a33e-fcc8f2a30882)
  const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const match = cleanUrl.match(uuidRegex);
  
  const uuid = match ? match[0] : null;
  console.log('Extracted UUID:', uuid);
  
  return uuid;
}

// Restaurant endpoint
app.get('/get-restaurant', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URL parameter is required'
      });
    }
    
    // Extract UUID from the provided URL
    const uuid = extractUuidFromUrl(url);
    
    if (!uuid) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Could not extract UUID from the provided URL'
      });
    }
    
    // Always use DEFAULT_LOCATION from environment variables and URL encode it
    const pickedLoc = encodeURIComponent(DEFAULT_LOCATION);
    
    // Construct the GoFood API URL
    const gofoodUrl = `${GOFOOD_BASE_URL}/v5/restaurants/${uuid}?picked_loc=${pickedLoc}`;
    // const gofoodUrl = `${GOFOOD_BASE_URL}/v5/restaurants/${uuid}?cart_recommendations_enabled=false&delivery_mode_intent=regular&is_offer_list_experiment=true&order_intent=delivery&payment_token_based_offering=1&picked_loc=-6.1937637%2C106.7069&search_id=1c1e0041-5f66-4c9e-b360-ab54a5c0096a`;
    
    console.log(`Original URL: ${url}`);
    console.log(`\rExtracted UUID: ${uuid}`);
    console.log(`\rProxying request to: ${gofoodUrl}`);
    
    // Make request to GoFood API with full mobile app headers
    const response = await axios.get(gofoodUrl, {
              headers: {
          // Authentication
          'Authorization': `Bearer ${GOJEK_BEARER_TOKEN}`,
      }
    });
    
    // Return the response as JSON
    res.json(response.data);
    
  } catch (error) {
    console.error('Error proxying request:', error.message);
    
    if (error.response) {
      // GoFood API returned an error
      res.status(error.response.status).json({
        error: 'GoFood API Error',
        message: error.response.data?.message || error.message,
        status: error.response.status
      });
    } else if (error.request) {
      // Network error
      res.status(503).json({
        error: 'Service Unavailable',
        message: 'Unable to reach GoFood API'
      });
    } else {
      // Other error
      res.status(500).json({
        error: 'Internal Server Error',
        message: error.message
      });
    }
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'GoFood Restaurant Proxy'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'GoFood Restaurant API Proxy',
    endpoints: {
      'GET /get-restaurant?url={gofood_url}': 'Get restaurant details by GoFood URL',
      'GET /health': 'Health check'
    },
    example: `GET /get-restaurant?url=https://gofood.co.id/jakarta/restaurant/rm-sinar-minang-metland-d028264f-8da3-4bcd-a33e-fcc8f2a30882`
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 GoFood Restaurant API Proxy running on http://localhost:${PORT}`);
  console.log(`📍 Default location: ${DEFAULT_LOCATION.replace('%2C', ', ')}`);
  console.log(`🔗 Example: http://localhost:${PORT}/get-restaurant?url=https://gofood.co.id/jakarta/restaurant/rm-sinar-minang-metland-d028264f-8da3-4bcd-a33e-fcc8f2a30882`);
});

module.exports = app; 