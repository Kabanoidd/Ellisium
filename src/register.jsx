import React, { useState, useRef, useEffect } from "react";
import InputMask from "react-input-mask";
import validator from "validator";
import { useNavigate } from "react-router-dom";
import "./css/RegistrationForm.css";
import pass from '../public/pass.png';
import unpass from '../public/unpass.png';
import bg from '../public/bg.jpg';
import CryptoJS from "crypto-js";

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
  const [isAgreed, setIsAgreed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const navigate = useNavigate();
  const phoneInputRef = useRef(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("http://localhost:3002/api/me", {
          credentials: "include",
        });
        const data = await response.json();
        if (data.user) {
          navigate("/");
        }
      } catch (error) {
        console.error("Ошибка при проверке авторизации:", error);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleAgreementChange = (e) => {
    setIsAgreed(e.target.checked);
  };

  const validateForm = () => {
    const newErrors = {};
    let passwordErrorMessage = ""; // Переменная для хранения сообщения об ошибке пароля
  
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
    } else {
      const isMinLengthValid = formData.password.length >= 8;
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasDigit = /[0-9]/.test(formData.password); // Добавлено: Проверка на наличие цифры
      const isOnlyEnglishOrDigits = /^[a-zA-Z0-9]+$/.test(formData.password); // Добавлено:  только англ. буквы и цифры
  
      if (!isMinLengthValid) {
        passwordErrorMessage += "Минимум 8 символов.\n";
      }
      if (!hasLowerCase) {
        passwordErrorMessage += "Должна быть хотя бы одна строчная буква.\n";
      }
      if (!hasUpperCase) {
        passwordErrorMessage += "Должна быть хотя бы одна заглавная буква.\n";
      }
      if (!hasDigit) { // Добавлено: Проверка на наличие цифры
        passwordErrorMessage += "Должна быть хотя бы одна цифра.\n";
      }
      if (!isOnlyEnglishOrDigits) {  // Изменено: теперь включает и цифры
        passwordErrorMessage += "Пароль должен состоять только из английских символов и цифр.\n";
      }
  
      if (passwordErrorMessage) {
        newErrors.password = passwordErrorMessage.trim(); // Удаляем последний перенос строки
      }
    }
  
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Пароли не совпадают";
    }
  
    if (!isAgreed) {
      newErrors.agreement = "Необходимо согласие на обработку данных";
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
        return false;
      }
      return true;
    } catch (error) {
      console.error("Ошибка при проверке пароля:", error);
      return true;
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
          password: formData.password,
        };

        const response = await fetch("http://localhost:3002/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData),
        });

        const result = await response.json();
        if (response.ok) {
          // Если регистрация успешна (данные сохранены во временном хранилище, а код отправлен)
          setShowConfirmationModal(true);
          setVerificationError("");
        } else {
          console.error("Ошибка при регистрации:", result.message);
        }
      } catch (error) {
        console.error("Ошибка при отправке данных:", error);
      }
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email, code: confirmationCode }),
      });

      const result = await response.json();
      if (response.ok) {
        navigate("/login");
      } else {
        setVerificationError(result.message || "Ошибка при проверке кода");
        console.error("Ошибка при проверке кода:", result.message);
      }
    } catch (error) {
      setVerificationError("Ошибка при отправке кода");
      console.error("Ошибка при отправке кода:", error);
    }
  };

  // Функция для отмены регистрации
  const handleCancelRegistration = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/cancel-registration", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.email }),
      });
      const result = await response.json();
      if (response.ok) {
        setShowConfirmationModal(false);
        // Можно, например, сбросить форму или перейти на другую страницу
        navigate("/");
      } else {
        setVerificationError(result.message || "Ошибка при отмене регистрации");
        console.error("Ошибка при отмене регистрации:", result.message);
      }
    } catch (error) {
      setVerificationError("Ошибка при отмене регистрации");
      console.error("Ошибка при отмене регистрации:", error);
    }
  };

  const handleReset = () => {
    navigate("/");
  };

  return (
    <div className="video-background">
      <img src={bg} alt="" className="video" />
      <form onSubmit={handleSubmit} className="registration-form">
        <h2>Регистрация</h2>
        <div className="for_all">
          <div>
            <label>Имя:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Введите ваше имя" />
            {errors.name && <span className="error">{errors.name}</span>}
          </div>

          <div>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Введите ваш email" />
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
  <input
    type={showPassword ? "text" : "password"}
    name="password"
    value={formData.password}
    onChange={handleChange}
    placeholder="Введите пароль"
  />
  <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
    {showPassword ? <img src={unpass} alt="hide password" /> : <img src={pass} alt="show password" />}
  </button>
</div>
{errors.password && (
  <span className="error" style={{ whiteSpace: "pre-line" }}>{errors.password}</span>
)}

<label>Подтвердите пароль:</label>
<div className="inp_pass">
  <input
    type={showConfirmPassword ? "text" : "password"}
    name="confirmPassword"
    value={formData.confirmPassword}
    onChange={handleChange}
    placeholder="Подтвердите пароль"
  />
  <button
    type="button"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
    className="password-toggle"
  >
    {showConfirmPassword ? <img src={unpass} alt="hide confirm password" /> : <img src={pass} alt="show confirm password" />}
  </button>
</div>
{errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}

          <div className="agreement-checkbox">
            <label>
              <input type="checkbox" checked={isAgreed} onChange={handleAgreementChange} />
              Я согласен(на) с <a href="#" className="login-link">условиями на обработку данных</a>
            </label>
            {errors.agreement && <span className="error">{errors.agreement}</span>}
          </div>

          <div className="buttons">
            <button type="submit">Регистрация</button>
            <button type="reset" onClick={handleReset}>Отмена</button>
          </div>

          <div className="login-redirect">
            <p>
              У вас уже есть аккаунт? <span onClick={() => navigate("/login")} className="login-link">Авторизация</span>
            </p>
          </div>
        </div>
      </form>

      {showConfirmationModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Введите код подтверждения</h3>
            <input
              type="text"
              value={confirmationCode}
              onChange={(e) => setConfirmationCode(e.target.value)}
              placeholder="Код подтверждения"
            />
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button onClick={handleVerifyCode}>Подтвердить</button>
              <button onClick={handleCancelRegistration}>Отмена</button>
            </div>
            {verificationError && (
              <span className="error" style={{ display: "block", marginTop: "10px" }}>
                {verificationError}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
