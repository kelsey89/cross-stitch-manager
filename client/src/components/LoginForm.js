import React, { useState } from 'react';

export default function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    const endpoint = isRegister ? '/api/register' : '/api/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error || 'Auth failed');
    onLogin(data.token);
  };

  return (
    <form onSubmit={handleSubmit} style={{maxWidth:'300px',margin:'auto',padding:'2rem'}}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <div>
        <label>
          Username:<br/>
          <input value={username} onChange={e=>setUsername(e.target.value)} required />
        </label>
      </div>
      <div>
        <label>
          Password:<br/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </label>
      </div>
      <button type="submit">{isRegister ? 'Register' : 'Login'}</button>
      <p style={{marginTop:'1rem'}}>
        {isRegister
          ? 'Already have an account? '
          : "Don't have an account? "}
        <button type="button" onClick={()=>setIsRegister(!isRegister)}>
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
      {error && <p style={{color:'red'}}>{error}</p>}
    </form>
  );
}
