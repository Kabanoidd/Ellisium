import React, { useState } from "react";
import InputMask from "react-input-mask";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./RegistrationForm.css";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const navigate = useNavigate();

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) {
      newErrors.name = "Имя обязательно";
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Некорректный email";
    }

    if (!formData.phone || !/^\+7-\d{3}-\d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
      newErrors.phone = "Некорректный номер телефона";
    }

    if (!formData.password) {
      newErrors.password = "Пароль обязателен";
    } else if (formData.password.length < 6) {
      newErrors.password = "Пароль должен быть не менее 6 символов";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Отправка данных на сервер
      const response = await axios.post("http://localhost:5000/api/register", formData);
      console.log(response.data.message);

      // Очистка формы и перенаправление
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      navigate("/login"); // Перенаправление на страницу авторизации
    } catch (error) {
      console.error("Ошибка при регистрации:", error.response?.data?.message || error.message);
      setErrors({ submit: error.response?.data?.message || "Ошибка при регистрации" });
    }
  };

  // Очистка формы
  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    });
    setErrors({});
  };

  // Переключение видимости пароля
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Переключение видимости подтверждения пароля
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <form onSubmit={handleSubmit} onReset={handleReset} className="registration-form">
      <div>
        <label>Имя:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Введите ваше имя"
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>

      <div>
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Введите ваш email"
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>

      <div>
        <label>Телефон:</label>
        <InputMask
          mask="+7-999-999-99-99"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="+7-___-___-__-__"
        />
        {errors.phone && <span className="error">{errors.phone}</span>}
      </div>

      <div>
        <label>Пароль:</label>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Введите пароль"
        />
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="password-toggle"
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
        {errors.password && <span className="error">{errors.password}</span>}
      </div>

      <div>
        <label>Подтвердите пароль:</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Подтвердите пароль"
        />
        <button
          type="button"
          onClick={toggleConfirmPasswordVisibility}
          className="password-toggle"
        >
          {showConfirmPassword ? "🙈" : "👁️"}
        </button>
        {errors.confirmPassword && (
          <span className="error">{errors.confirmPassword}</span>
        )}
      </div>

      {errors.submit && <span className="error">{errors.submit}</span>}

      <div className="buttons">
        <button type="submit">Регистрация</button>
        <button type="reset">Отмена</button>
      </div>

      <div className="login-redirect">
        <p>
          У вас уже есть аккаунт?{" "}
          <span onClick={() => navigate("/login")} className="login-link">
            Авторизация
          </span>
        </p>
      </div>
    </form>
  );
};

export default RegistrationForm;