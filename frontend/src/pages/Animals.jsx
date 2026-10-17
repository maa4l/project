import { useEffect, useState } from 'react';
import api from '../api';

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  
  // Состояние для формы создания
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [breed, setBreed] = useState('');

  // Состояния для режима редактирования
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSpecies, setEditSpecies] = useState('');
  const [editBreed, setEditBreed] = useState('');
  const [editStatus, setEditStatus] = useState('available');

  const token = localStorage.getItem('token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
  const isAdmin = payload.role === 'admin';

  const fetchAnimals = async () => {
    try {
      const res = await api.get('/animals/');
      setAnimals(res.data);
    } catch (error) {
      console.error("Ошибка при загрузке:", error);
    }
  };

  useEffect(() => {
    fetchAnimals();
  }, []);

  // CREATE (Админ)
  const handleAddAnimal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/animals/', { name, species, breed });
      setName('');
      setSpecies('');
      setBreed('');
      fetchAnimals();
    } catch (err) {
      alert('Ошибка доступа или данные введены неверно');
    }
  };

  // DELETE (Админ)
  const handleDelete = async (id) => {
    if (!window.confirm("Удалить животное?")) return;
    try {
      await api.delete(`/animals/${id}`);
      fetchAnimals();
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  // UPDATE (Админ) - Начинаем редактирование
  const startEdit = (animal) => {
    setEditingId(animal.id);
    setEditName(animal.name);
    setEditSpecies(animal.species);
    setEditBreed(animal.breed || '');
    setEditStatus(animal.status);
  };

  // UPDATE (Админ) - Сохраняем изменения
  const handleUpdate = async (id) => {
    try {
      await api.put(`/animals/${id}`, { 
        name: editName, 
        species: editSpecies, 
        breed: editBreed,
        status: editStatus 
      });
      setEditingId(null); // Выходим из режима редактирования
      fetchAnimals();     // Обновляем список
    } catch (err) {
      alert('Ошибка при обновлении');
    }
  };

  // CREATE (Клиент) - Подать заявку
  const handleAdopt = async (id) => {
    try {
      await api.post('/applications/', { animal_id: id });
      alert('Заявка успешно подана!');
      fetchAnimals();
    } catch (err) {
      alert(err.response?.data?.detail || 'Ошибка при подаче заявки');
    }
  };

  return (
    <div>
      {isAdmin && (
        <div className="admin-panel">
          <h3>Добавить новое животное</h3>
          <form onSubmit={handleAddAnimal} className="add-form">
            <input placeholder="Кличка" value={name} onChange={e => setName(e.target.value)} required />
            <input placeholder="Вид" value={species} onChange={e => setSpecies(e.target.value)} required />
            <input placeholder="Порода" value={breed} onChange={e => setBreed(e.target.value)} />
            <button type="submit" className="btn-primary">Добавить</button>
          </form>
        </div>
      )}

      <h2>Наши хвостики ({animals.length})</h2>
      {animals.length === 0 ? (
        <p>Пока животных нет.</p>
      ) : (
        <div className="animal-grid">
          {animals.map(animal => (
            <div key={animal.id} className="animal-card">
              
              {/* Если это карточка в режиме редактирования */}
              {editingId === animal.id ? (
                <div className="edit-mode">
                  <input value={editName} onChange={e => setEditName(e.target.value)} placeholder="Кличка" />
                  <input value={editSpecies} onChange={e => setEditSpecies(e.target.value)} placeholder="Вид" />
                  <input value={editBreed} onChange={e => setEditBreed(e.target.value)} placeholder="Порода" />
                  <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                    <option value="available">Ищет дом</option>
                    <option value="reserved">Зарезервирован</option>
                    <option value="adopted">Усыновлен</option>
                  </select>
                  <div className="edit-buttons">
                    <button onClick={() => handleUpdate(animal.id)} className="btn-primary">Сохранить</button>
                    <button onClick={() => setEditingId(null)} className="btn-cancel">Отмена</button>
                  </div>
                </div>
              ) : (
                
                /* Обычный вид карточки */
                <>
                  <h3>{animal.name}</h3>
                  <p><strong>Вид:</strong> {animal.species}</p>
                  <p><strong>Порода:</strong> {animal.breed || 'Не указана'}</p>
                  
                  <span className={`status ${animal.status}`}>
                    {animal.status === 'available' ? 'Ищет дом' : animal.status === 'reserved' ? 'Зарезервирован' : 'Усыновлен'}
                  </span>

                  <div className="card-actions">
                    {isAdmin ? (
                      <>
                        <button onClick={() => startEdit(animal)} className="btn-edit">Ред.</button>
                        <button onClick={() => handleDelete(animal.id)} className="btn-danger">Удалить</button>
                      </>
                    ) : (
                      animal.status === 'available' && (
                        <button onClick={() => handleAdopt(animal.id)} className="btn-primary">Забрать домой</button>
                      )
                    )}
                  </div>
                </>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
}