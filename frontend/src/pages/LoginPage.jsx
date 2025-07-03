import React, { useState } from 'react';
import axios from "../utils/axios";

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/token/`, {
        username,
        password
      });
      localStorage.setItem('access', res.data.access);
      localStorage.setItem('refresh', res.data.refresh);
      setError('');
      alert("登录成功！");
      // 可以跳转页面，比如：
      window.location.href = "/";
    } catch (err) {
      console.error(err);
      setError('用户名或密码错误');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto" }}>
      <h2>登录</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>用户名：</label><br />
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>密码：</label><br />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={{ marginTop: 10 }}>登录</button>
      </form>
    </div>
  );
};

export default LoginPage;