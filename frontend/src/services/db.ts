export const handleLogin = async (userEmail: string) => {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: userEmail }),
  });

  const userData = await response.json();
  
  localStorage.setItem('userId', userData.id);
};