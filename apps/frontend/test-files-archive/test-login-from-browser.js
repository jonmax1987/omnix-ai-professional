// Test login functionality from browser context
async function testLogin() {
  try {
    console.log('Testing login with browser fetch...');
    
    const response = await fetch('https://18sz01wxsi.execute-api.eu-central-1.amazonaws.com/dev/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include credentials for CORS
      body: JSON.stringify({
        email: 'admin@omnix.ai',
        password: 'admin123'
      })
    });

    console.log('Response status:', response.status);
    // console.log('Response headers:', [...response.headers.entries()]);
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Login successful!');
      return data;
    } else {
      console.log('❌ Login failed:', data.message);
      return null;
    }
  } catch (error) {
    console.error('❌ Network error:', error);
    return null;
  }
}

// Run the test
testLogin();