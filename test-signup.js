const signup = async (data) => {
  const url = 'http://localhost:3000/api/auth/signup';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const responseData = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Body:', JSON.stringify(responseData, null, 2));
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
};

// Test signup with sample data
signup({
  name: 'Test Reseller',
  email: 'testreseller@example.com',
  password: 'TestPass123!',
  company_name: 'Test Company',
  mobile: '1234567890',
  phone: '0987654321',
  address: '123 Test St',
  city: 'Test City',
  province: 'Test Province',
  zipCode: '12345',
  country: 'Test Country'
});