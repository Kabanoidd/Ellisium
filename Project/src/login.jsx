import React, { useState } from "react";
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
    console.log("Отправка данных для авторизации:", formData); // Логируем данные формы
    
    try {
      const response = await fetch("http://localhost:3001/api/login", {
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
  
      alert("Вы успешно вошли!");
    } catch (error) {
      console.error("Ошибка авторизации:", error.message);
    }
  };
  
  
  return (
    <div className="video-background">
      <img src={bg} alt="" className="video"/>
      <form onSubmit={handleSubmit} className="registration-form">
        <h2>Вход</h2>
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
            {showPassword ? <img src={unpass} alt="hide password"/> : <img src={pass} alt="show password"/>}
          </button>
        </div>
        {errors.password && <span className="error">{errors.password}</span>}
        {errors.general && <span className="error">{errors.general}</span>}

        <div className="buttons">
          <button type="submit">Войти</button>
          <button className="for_auth" type="button" onClick={() => navigate("/")}>Отмена</button>
        </div>

        <div className="login-redirect">
          <p>Еще нет аккаунта? <span onClick={() => navigate("/register")} className="login-link">Регистрация</span></p>
        </div>
      </form>
    </div>
  );
};

export default Login;
