import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Animals from './pages/Animals';
import Applications from './pages/Applications'; // <-- 1. Импортируем

function App() {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container">
      <nav className="navbar">
        <h2>🐾 Приют</h2>
        <div>
          {token && (
            <>
              <Link to="/animals">Животные</Link>
              <Link to="/applications">Заявки</Link> {/* <-- 2. Добавили ссылку */}
              <button onClick={handleLogout} className="btn-logout">Выйти</button>
            </>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/animals" element={<Animals />} />
        <Route path="/applications" element={<Applications />} /> {/* <-- 3. Добавили маршрут */}
        <Route path="*" element={<Navigate to={token ? "/animals" : "/login"} />} />
      </Routes>
    </div>
  );
}

export default App;