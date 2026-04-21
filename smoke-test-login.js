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
  } catch (err) {
    console.error('Fetch failed (likely server not running):', err.message);
  }
};

login('reseller@iptone.co.za', 'Reseller@IPTOne2024!');
