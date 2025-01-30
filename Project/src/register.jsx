import React, { useState, useRef } from "react";
import InputMask from "react-input-mask";
import validator from "validator";
import { useNavigate } from "react-router-dom";
import "./css/RegistrationForm.css";
import pass from '../public/pass.png';
import unpass from '../public/unpass.png'; // Импортируем новую иконку
import bg from '../public/bg.jpg';
import CryptoJS from "crypto-js"; // Добавляем импорт CryptoJS

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
  const [passwordError, setPasswordError] = useState("");

  const navigate = useNavigate();
  const phoneInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

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

  const checkPasswordSafety = async (password) => {
    const hash = CryptoJS.SHA1(password).toString(CryptoJS.enc.Hex).toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    try {
      const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`);
      const data = await response.text();

      if (data.includes(suffix)) {
        return false; // Пароль скомпрометирован
      }
      return true; // Пароль безопасен
    } catch (error) {
      console.error("Ошибка при проверке пароля:", error);
      return true; // В случае ошибки считаем пароль безопасным
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const isPasswordSafe = await checkPasswordSafety(formData.password);
        if (!isPasswordSafe) {
          setPasswordError("Этот пароль был скомпрометирован. Пожалуйста, выберите другой.");
          return;
        }

        setPasswordError("");

        const userData = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password, // Отправляем пароль в его обычной форме
        };

        const response = await fetch("http://localhost:3001/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();
        if (response.ok) {
          console.log("Пользователь успешно зарегистрирован:", result);
          navigate("/login");
        } else {
          console.error("Ошибка при регистрации:", result.message);
        }
      } catch (error) {
        console.error("Ошибка при отправке данных:", error);
      }
    }
  };

  const handleReset = () => {
    navigate("/");
  };

  return (
    <div className="video-background">
      <img src={bg} alt="" className="video"/>
      <form onSubmit={handleSubmit} className="registration-form">
        <h2>Регистрация</h2>
        <div className="for_all">
          <div>
            <label>Имя:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Введите ваше имя"/>
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Введите ваш email"/>
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
              ref={phoneInputRef}
            />
            {errors.phone && <span className="error">{errors.phone}</span>}
          </div>

          <label>Пароль:</label>
          <div className="inp_pass">
            <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="Введите пароль"/>
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
              {/* Условный рендеринг иконки */}
              {showPassword ? (
                <img src={unpass} alt="hide password"/>
              ) : (
                <img src={pass} alt="show password"/>
              )}
            </button>
          </div>
          {errors.password && <span className="error">{errors.password}</span>}
          {passwordError && <span className="error">{passwordError}</span>}

          <label>Подтвердите пароль:</label>
          <div className="inp_pass">
            <input type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Подтвердите пароль"/>
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="password-toggle">
              {/* Условный рендеринг иконки */}
              {showConfirmPassword ? (
                <img src={unpass} alt="hide confirm password"/>
              ) : (
                <img src={pass} alt="show confirm password"/>
              )}
            </button>
          </div>
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

          <div className="buttons">
            <button type="submit">Регистрация</button>
            <button type="reset" onClick={handleReset}>Отмена</button>
          </div>

          <div className="login-redirect">
            <p>У вас уже есть аккаунт? <span onClick={() => navigate("/login")} className="login-link">Авторизация</span></p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
