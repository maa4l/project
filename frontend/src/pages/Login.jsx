import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await api.post('/auth/register', { email, password });
        alert('Регистрация успешна! Теперь войдите.');
        setIsRegister(false);
      } else {
        // В FastAPI логин ожидает form-data, а не JSON
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);

        const res = await api.post('/auth/login', formData);
        localStorage.setItem('token', res.data.access_token);
        navigate('/animals');
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка!');
    }
  };

  return (
    <div className="auth-box">
      <h2>{isRegister ? 'Регистрация' : 'Вход'}</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" className="btn-primary">{isRegister ? 'Зарегистрироваться' : 'Войти'}</button>
      </form>
      <p onClick={() => setIsRegister(!isRegister)} className="toggle-link">
        {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </p>
    </div>
  );
}