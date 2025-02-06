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

const Index = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" }) // Отправляем куки
      .then((res) => res.json())
      .then((data) => {
        console.log("Проверка авторизации:", data);
        if (data.user) {
          setUser(data.user); // Устанавливаем пользователя, если он авторизован
        }
      })
      .catch((error) => {
        console.error("Ошибка проверки авторизации:", error);
      });
  }, []); // Убрали navigate из зависимостей, так как он больше не используется в useEffect

  return (
    <div className="all">
      <div className="first_screen">
        <img src={bg} alt="#" />
      </div>
      {user && (
        <div className="panel">
          <ul className="imgs">
            <li><img src={hm} alt="#" /></li>
            <li onClick={() => navigate("/acc")}><img src={acc} alt="#" /></li>
            <li><img src={plus} alt="#" /></li>
            <li><img src={sh} alt="#" /></li>
            <li><img src={sub} alt="#" /></li>
          </ul>
        </div>
      )}
      <div className="container">
        <div className="text">
          <h1>Ellisium</h1>
          <p>— это интуитивный конструктор сайтов, позволяющий легко и быстро создавать профессиональные веб-ресурсы без необходимости владения навыками программирования.</p>
        </div>
        <div className="buttonss">
          {!user && (
            <>
              <button className="auth" onClick={() => navigate("/login")}>Войти</button>
              <button className="reg" onClick={() => navigate("/register")}>Регистрация</button>
            </>
          )}
          {user && (
            <button className="create">
              <p>Создать</p>
              <img src={pluss} alt="#" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;