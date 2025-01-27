import React, { useState } from "react";
import InputMask from "react-input-mask";
import validator from "validator";
import { useNavigate } from "react-router-dom"; // Импортируем useNavigate
import "./RegistrationForm.css"; // Подключаем стили

const Register = () => {
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

  const navigate = useNavigate(); // Хук для навигации

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

    if (!validator.isEmail(formData.email)) {
      newErrors.email = "Некорректный email";
    }

    if (!formData.phone || !validator.isMobilePhone(formData.phone.replace(/\D/g, ""), "ru-RU")) {
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
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Форма отправлена:", formData);
      // Здесь можно отправить данные на сервер
    }
  };

  // Обработчик очистки формы
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

  // Переход на страницу авторизации
  const handleLoginRedirect = () => {
    navigate("/login"); // Перенаправление на страницу авторизации
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

      <div className="buttons">
        <button type="submit">Регистрация</button>
        <button type="reset">Отмена</button>
      </div>

      <div className="login-redirect">
        <p>
          У вас уже есть аккаунт?{" "}
          <span onClick={handleLoginRedirect} className="login-link">
            Авторизация
          </span>
        </p>
      </div>
    </form>
  );
};

export default Register;