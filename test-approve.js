const approveApplication = async () => {
  const url = 'http://localhost:3000/api/applications/admin';
  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': 'auth_token=eyJhbGciOiJIUzI1NiJ9.eyJpZCI6IjY3ZTk4ZDZlLTViMDgtNGE0Mi1hY2VkLWE3MTAzZTZhMjBmZCIsImVtYWlsIjoiYWRtaW5AaXB0b25lLmNvLnphIiwicm9sZSI6InN1cGVyX2FkbWluIiwibmFtZSI6IlN1cGVyIEFkbWluIiwiYXBwbGljYXRpb25fc3RhdHVzIjoiYXBwcm92ZWQiLCJpYXQiOjE3NzY3NzU5OTUsImV4cCI6MTc3NzM4MDc5NX0.GYBMeiQRomYLiR-IoBEyPeHzeeQv3LcGEDxyBiYhbNQ'
      },
      body: JSON.stringify({
        id: 'ce40060d-cb46-48a4-b0ab-f243c57e8db7',
        status: 'approved',
        message: 'Welcome to IPT One! Your account has been approved.'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}`);
    console.log('Body:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Fetch failed:', err.message);
  }
};

approveApplication();