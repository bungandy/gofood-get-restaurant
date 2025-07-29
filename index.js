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
const BEARER_TOKEN = 'eyJhbGciOiJkaXIiLCJjdHkiOiJKV1QiLCJlbmMiOiJBMTI4R0NNIiwidHlwIjoiSldUIiwiemlwIjoiREVGIn0..OWL0Ul4brzZjMwhc.DRe5zO4xm25iaR9hgbFnjQ9VarjKoKC0kAWoIlf6fVLDzaoqUA7sISuCyYb83DompahxEgmffOf7sQOPbeEc3c2z6ARPwFS3V6OlEvEX8MjFAX5cpzFMJ_iFN-wKWWA5a3__-HIMbtI-Lq71Ohn67ACRntZDajTgcmBSnjGAB9FoL4J6Z6-ry_nz61jq_NM-CP963b_nfb6m_dI_TdF9FBdfAshyWpiVQJcP4_u5SrBbAk9AQRwYKJLRUtWvwNEn5Nx65vNTsnE1Qfd_A3_ubhx1uSNBAc1VK44iYdN2fMY7JdI7xFz7QiZH28wfRxRLccf9igNY2yoO7OOH9oHO4BHiIJ5anFOhyGyleLoZBUI38l6aF6og0OBlgcG2qpXfaodnQ05k-_Q9FL0a4LHlf0TZMOu4wAGclx-kNIMZ6C6pzWTObp2lS2ENXaEpq3rW9ZxusIng3vRiNuKVrXVlxN-tglb8552W7WFFoNRy0y_Mxo8LwJUEWqFnvGm-dsA0S7SnNfut1g29jmkgW2EmKWfKr1i7-nB-vxlgkljeA_z4XQjNd0jrQHRbwd0LQT735FdCxdI8_qPA1VRcKNvx48sKlL9S3L2iBU3cPNjtyqhBOl8DTMMl2jejgcAaaEso-5QjRQePVwnaBugZoc6mQ-pFScc9BNVcVCm0bj7UcxgIuUUxH9rLAEtgR8NrU93Yc1NO7ih0vTB_cqlCjqQFOTrfuiCckhu1OGRLT184oEui950b0dV22t_ou341himF_GbxbyWA1ZYV3h6uzFSyQQFfUDS_EIar1_5596fHIHM9IRpIrjMQWh5_JTloPgdPwFMcSVgobwvNQbuhddYuGO5R8LQS2R76VnuQPiyZ4ZxucFjUPqd9Tzmw3pHOP4qUyQGcHNFVN2tcQhdOSKNWymIsXRg3-X5mzorrt6pQxOR7Xoa1q_Zzxh5uMmk5mkaPMmE.POHpRDKClBxvJ42dE6fmpg';

// Default location coordinates (Jakarta)
const DEFAULT_LOCATION = '-6.2032022%2C106.715';

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
    
    const pickedLoc = req.query.picked_loc || DEFAULT_LOCATION;
    
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
        'Authorization': `Bearer ${BEARER_TOKEN}`,
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