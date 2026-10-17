import { useEffect, useState } from 'react';
import api from '../api';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [animalsMap, setAnimalsMap] = useState({}); // Словарь для перевода ID в кличку

  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const isAdmin = payload.role === 'admin';

  const fetchData = async () => {
    try {
      // Загружаем животных, чтобы знать их клички
      const animalsRes = await api.get('/animals/');
      const map = {};
      animalsRes.data.forEach(a => { map[a.id] = a.name; });
      setAnimalsMap(map);

      // Загружаем заявки (для админа все, для клиента только свои)
      const url = isAdmin ? '/applications/' : '/applications/my';
      const appsRes = await api.get(url);
      setApplications(appsRes.data);
    } catch (error) {
      console.error("Ошибка при загрузке:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Клиент отменяет свою заявку
  const handleCancel = async (id) => {
    if (!window.confirm("Вы уверены, что хотите отменить заявку?")) return;
    try {
      await api.delete(`/applications/${id}`);
      fetchData();
    } catch (err) {
      alert('Ошибка при отмене');
    }
  };

  // Админ меняет статус заявки (одобрить/отклонить)
  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/applications/${id}/status`, { status: newStatus });
      fetchData(); // Обновляем список (статус животного на бэкенде тоже изменится)
    } catch (err) {
      alert('Ошибка при изменении статуса');
    }
  };

  return (
    <div>
      <h2>{isAdmin ? 'Все заявки на адопцию' : 'Мои заявки'}</h2>
      
      {applications.length === 0 ? (
        <p>Заявок пока нет.</p>
      ) : (
        <div className="applications-list">
          {applications.map(app => (
            <div key={app.id} className="application-card">
              <div className="app-info">
                <h3>Заявка #{app.id}</h3>
                <p><strong>Животное:</strong> {animalsMap[app.animal_id] || `ID ${app.animal_id}`}</p>
                <p><strong>Дата:</strong> {new Date(app.created_at).toLocaleString('ru-RU')}</p>
                <p>
                  <strong>Статус: </strong> 
                  <span className={`status ${app.status}`}>
                    {app.status === 'new' ? 'Новая' : 
                     app.status === 'approved' ? 'Одобрена' : 
                     app.status === 'rejected' ? 'Отклонена' : 'Отменена'}
                  </span>
                </p>
              </div>

              <div className="app-actions">
                {/* Кнопки для Админа */}
                {isAdmin && app.status === 'new' && (
                  <>
                    <button onClick={() => handleStatusChange(app.id, 'approved')} className="btn-success">Одобрить</button>
                    <button onClick={() => handleStatusChange(app.id, 'rejected')} className="btn-danger">Отклонить</button>
                  </>
                )}

                {/* Кнопки для Клиента */}
                {!isAdmin && app.status === 'new' && (
                  <button onClick={() => handleCancel(app.id)} className="btn-cancel">Отменить заявку</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}