const login = async (email, password) => {
  const url = 'http://localhost:3000/api/auth/login';
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Body:', JSON.stringify(data, null, 2));
    // Get the cookie
    const cookie = res.headers.get('set-cookie');
    console.log('Cookie:', cookie);
    return cookie;
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
};

login('admin@iptone.co.za', 'Admin@IPTOne2024!').then(cookie => {
  // Now use the cookie for next request
  console.log('Use this cookie for auth:', cookie);
});