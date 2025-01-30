import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3001/api/me", { credentials: "include" }) // Отправляем куки
      .then((res) => res.json())
      .then((data) => {
        console.log("Проверка авторизации:", data);
        if (data.user) {
          setUser(data.user);
        } else {
          navigate("/login"); // Если пользователь не авторизован, отправляем на страницу входа
        }
      })
      .catch((error) => {
        console.error("Ошибка проверки авторизации:", error);
        navigate("/login");
      });
  }, [navigate]);

  return (
    <div>
      <h1>Главная страница</h1>
      {user ? <p>Добро пожаловать, {user.name}!</p> : <p>Загрузка...</p>}
    </div>
  );
};

export default Index;
