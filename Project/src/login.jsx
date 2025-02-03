import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/RegistrationForm.css";
import pass from '../public/pass.png';
import unpass from '../public/unpass.png';
import bg from '../public/bg.jpg';

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Состояние для отображения загрузки
  const navigate = useNavigate();

  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/me", {
          credentials: "include", // Включаем отправку куки
        });
        const data = await response.json();
        if (data.user) {
          navigate("/"); // Если пользователь авторизован, перенаправляем на главную страницу
        }
      } catch (error) {
        console.error("Ошибка при проверке авторизации:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Очищаем ошибки при изменении поля
    setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = "Введите email";
    if (!formData.password) newErrors.password = "Введите пароль";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; // Валидация формы

    setIsLoading(true); // Включаем состояние загрузки

    try {
      const response = await fetch("http://localhost:3002/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Включаем отправку сессионных куки
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("Ответ от сервера:", data);

      if (!response.ok) {
        throw new Error(data.message || "Ошибка авторизации");
      }
      navigate("/"); // Перенаправляем на главную страницу после успешного входа
    } catch (error) {
      console.error("Ошибка авторизации:", error.message);
      setErrors({ general: error.message }); // Показываем ошибку пользователю
    } finally {
      setIsLoading(false); // Выключаем состояние загрузки
    }
  };

  return (
    <div className="video-background">
      <img src={bg} alt="" className="video" />
      <form onSubmit={handleSubmit} className="registration-form">
        <h2>Вход</h2>
        <div className="for_all">
          <div>
            <label>Почта:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Введите ваш email"
            />
            {errors.email && <span className="error">{errors.email}</span>}
          </div>

          <label>Пароль:</label>
          <div className="inp_pass">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Введите пароль"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <img src={unpass} alt="hide password" /> : <img src={pass} alt="show password" />}
            </button>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
          {errors.general && <span className="error">{errors.general}</span>}

          <div className="buttons">
            <button type="submit" disabled={isLoading}>
              {isLoading ? "Загрузка..." : "Войти"}
            </button>
            <button className="for_auth" type="button" onClick={() => navigate("/")}>
              Отмена
            </button>
          </div>

          <div className="login-redirect">
            <p>
              Еще нет аккаунта?{" "}
              <span onClick={() => navigate("/register")} className="login-link">
                Регистрация
              </span>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Login;