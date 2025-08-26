// Test script to check what API config is actually being used
console.log('Testing API Configuration...');
console.log('VITE_API_BASE_URL env var:', process.env.VITE_API_BASE_URL);

// Simulate what happens in the API configuration
const VITE_API_BASE_URL = process.env.VITE_API_BASE_URL;
const DEV = false; // Simulate production build

const baseURL = (VITE_API_BASE_URL) 
  ? (VITE_API_BASE_URL + '/v1')  // Use environment variable if set (production)
  : (DEV ? '/api' : 'https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/v1');  // Fallback logic

console.log('Final baseURL should be:', baseURL);
console.log('Expected login URL:', baseURL + '/auth/login');

// Test the condition logic
console.log('Environment checks:');
console.log('  VITE_API_BASE_URL exists:', !!VITE_API_BASE_URL);
console.log('  VITE_API_BASE_URL value:', VITE_API_BASE_URL);
console.log('  DEV mode:', DEV);