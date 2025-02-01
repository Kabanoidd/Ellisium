import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/index.css";
import bg from '../public/BGmain.png';
import hm from '../public/home.png';
import sh from '../public/shop.png';
import sub from '../public/sub.png';
import acc from '../public/account.png';
import plus from '../public/plus.png';
import pluss from '../public/pluss.png';

const Acc = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" }) // Отправляем куки
      .then((res) => res.json())
      .then((data) => {
        console.log("Проверка авторизации:", data);
        if (data.user) {
          setUser(data.user); // Устанавливаем пользователя, если он авторизован
        } else {
          navigate("/"); // Перенаправляем на главную страницу, если пользователь не авторизован
        }
      })
      .catch((error) => {
        console.error("Ошибка проверки авторизации:", error);
        navigate("/"); // Перенаправляем на главную страницу в случае ошибки
      });
  }, [navigate]); // Добавляем navigate в зависимости useEffect

  // Функция для выхода из сессии
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/logout", {
        method: "POST",
        credentials: "include", // Включаем куки
      });

      if (response.ok) {
        console.log("Пользователь вышел из системы");
        setUser(null); // Сбрасываем состояние пользователя
        navigate("/"); // Перенаправляем на главную страницу
      } else {
        console.error("Ошибка при выходе из системы");
      }
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
    }
  };

  return (
    <div className="all">
      {user && (
        <div className="panel">
          <ul className="imgs">
            <li onClick={() => navigate("/")}><img src={hm} alt="#" /></li>
            <li><img src={acc} alt="#" /></li>
            <li><img src={plus} alt="#" /></li>
            <li><img src={sh} alt="#" /></li>
            <li><img src={sub} alt="#" /></li>
          </ul>
        </div>
      )}
      <div className="container">
        {/* Кнопка для выхода из сессии */}
        {user && (
          <button className="logout-button" onClick={handleLogout}>
            Выйти
          </button>
        )}
      </div>
    </div>
  );
};

export default Acc;