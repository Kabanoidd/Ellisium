import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./css/index.css";
import "./css/profile.css";
import hm from '../public/home.png';
import sh from '../public/shop.png';
import sub from '../public/sub.png';
import acc from '../public/account.png';
import plus from '../public/plus.png';
import prof from '../public/profile.png';
import ed from '../public/edit.png';

const Acc = () => {
  const [user, setUser] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showProfilePictureModal, setShowProfilePictureModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [step, setStep] = useState(1);
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

  // Функция для отправки запроса на изменение email
  const handleChangeEmail = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/change-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, newEmail }),
      });

      if (response.ok) {
        console.log("Код подтверждения отправлен на старый email");
        setStep(2); // Переходим к следующему шагу
      } else {
        console.error("Ошибка при изменении email");
      }
    } catch (error) {
      console.error("Ошибка при изменении email:", error);
    }
  };

  // Функция для подтверждения изменения email
  const handleVerifyEmailChange = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/verify-email-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ oldEmail: user.email, code: confirmationCode }),
      });

      if (response.ok) {
        console.log("Email успешно изменён");
        setShowEmailModal(false); // Закрываем модальное окно
        setStep(1); // Сбрасываем шаг
        setNewEmail(""); // Очищаем поле нового email
        setConfirmationCode(""); // Очищаем поле кода подтверждения
        // Выходим из аккаунта после успешного изменения email
        handleLogout();
      } else {
        console.error("Ошибка при подтверждении изменения email");
      }
    } catch (error) {
      console.error("Ошибка при подтверждении изменения email:", error);
    }
  };

  // Функция для отправки запроса на изменение пароля
  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      console.error("Новый пароль и подтверждение пароля не совпадают");
      return;
    }

    try {
      const response = await fetch("http://localhost:3002/api/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, currentPassword, newPassword }),
      });

      if (response.ok) {
        console.log("Код подтверждения отправлен на ваш email");
        setStep(2); // Переходим к следующему шагу
      } else {
        console.error("Ошибка при изменении пароля");
      }
    } catch (error) {
      console.error("Ошибка при изменении пароля:", error);
    }
  };

  // Функция для подтверждения изменения пароля
  const handleVerifyPasswordChange = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/verify-password-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, code: confirmationCode }),
      });

      if (response.ok) {
        console.log("Пароль успешно изменён");
        setShowPasswordModal(false); // Закрываем модальное окно
        setStep(1); // Сбрасываем шаг
        setCurrentPassword(""); // Очищаем поле текущего пароля
        setNewPassword(""); // Очищаем поле нового пароля
        setConfirmNewPassword(""); // Очищаем поле подтверждения нового пароля
        setConfirmationCode(""); // Очищаем поле кода подтверждения
        // Выходим из аккаунта после успешного изменения пароля
        handleLogout();
      } else {
        console.error("Ошибка при подтверждении изменения пароля");
      }
    } catch (error) {
      console.error("Ошибка при подтверждении изменения пароля:", error);
    }
  };

  // Функция для отправки запроса на изменение имени
  const handleChangeName = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/change-name", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id, newName }),
      });

      if (response.ok) {
        console.log("Имя успешно изменено");
        setShowNameModal(false); // Закрываем модальное окно
        setUser((prevUser) => ({ ...prevUser, name: newName })); // Обновляем имя пользователя в состоянии
        setNewName(""); // Очищаем поле нового имени
      } else {
        console.error("Ошибка при изменении имени");
      }
    } catch (error) {
      console.error("Ошибка при изменении имени:", error);
    }
  };

  // Функция для отправки запроса на изменение фотографии профиля
  const handleChangeProfilePicture = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("profilePicture", profilePicture);
    formData.append("userId", user.id);

    try {
      const response = await fetch("http://localhost:3002/api/upload-profile-picture", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Фотография профиля успешно обновлена");
        setShowProfilePictureModal(false); // Закрываем модальное окно
        setUser((prevUser) => ({ ...prevUser, profilePicture: data.profilePicture })); // Обновляем фотографию профиля в состоянии
        setProfilePicture(null); // Очищаем поле фотографии профиля
      } else {
        console.error("Ошибка при обновлении фотографии профиля");
      }
    } catch (error) {
      console.error("Ошибка при обновлении фотографии профиля:", error);
    }
  };

  return (
    <div className="all all_acc">
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
        <div className="data">
          <div className="img_acc">
            <img src={user?.profilePicture || prof} alt="" onClick={() => setShowProfilePictureModal(true)} />
          </div>
          <div className="mail">
            <p>Почта</p>
            <p className="email_fromBD fromBD">{user?.email}</p> {/* Выводим почту */}
            <img src={ed} alt="" onClick={() => setShowEmailModal(true)} />
          </div>
          <div className="name">
            <p>Имя</p>
            <p className="name_fromBD fromBD">{user?.name}</p> {/* Выводим имя */}
            <img src={ed} alt="" onClick={() => setShowNameModal(true)} />
          </div>
          <div className="sub">
            <p>Уровень подписки</p>
            <p className="sub_fromBD fromBD">{user?.status_sub}</p> {/* Выводим статус подписки */}
            <img src={sub} alt="" />
          </div>
          <div className="my_project">
            <p>Мои проекты</p>
          </div>
          <div className="support">
            <p>Поддержка</p>
          </div>
        </div>
        <div className="profile_btn">
          <button className="ed_pass" onClick={() => setShowPasswordModal(true)}>
            Изменить пароль
          </button>
          {/* Кнопка для выхода из сессии */}
          {user && (
            <button className="logout-button" onClick={handleLogout}>
              Выйти
            </button>
          )}
        </div>
      </div>

      {/* Модальное окно для изменения email */}
      {showEmailModal && (
        <div className="modal">
          <div className="modal-content">
            {step === 1 && (
              <>
                <h2>Изменение почты</h2>
                <input
                  type="email"
                  placeholder="Новый email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <button onClick={handleChangeEmail}>Отправить код подтверждения</button>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Подтверждение изменения почты</h2>
                <input
                  type="text"
                  placeholder="Код подтверждения"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                />
                <button onClick={handleVerifyEmailChange}>Подтвердить</button>
              </>
            )}
            <button onClick={() => setShowEmailModal(false)}>Отмена</button>
          </div>
        </div>
      )}

      {/* Модальное окно для изменения пароля */}
      {showPasswordModal && (
        <div className="modal">
          <div className="modal-content">
            {step === 1 && (
              <>
                <h2>Изменение пароля</h2>
                <input
                  type="password"
                  placeholder="Текущий пароль"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Новый пароль"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  placeholder="Подтвердите новый пароль"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                />
                <button onClick={handleChangePassword}>Отправить код подтверждения</button>
              </>
            )}
            {step === 2 && (
              <>
                <h2>Подтверждение изменения пароля</h2>
                <input
                  type="text"
                  placeholder="Код подтверждения"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                />
                <button onClick={handleVerifyPasswordChange}>Подтвердить</button>
              </>
            )}
            <button onClick={() => setShowPasswordModal(false)}>Отмена</button>
          </div>
        </div>
      )}

      {/* Модальное окно для изменения имени */}
      {showNameModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Изменение имени</h2>
            <input
              type="text"
              placeholder="Новое имя"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <button onClick={handleChangeName}>Изменить имя</button>
            <button onClick={() => setShowNameModal(false)}>Отмена</button>
          </div>
        </div>
      )}

      {/* Модальное окно для изменения фотографии профиля */}
      {showProfilePictureModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Изменение фотографии профиля</h2>
            <form onSubmit={handleChangeProfilePicture}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePicture(e.target.files[0])}
              />
              <button type="submit">Изменить фотографию</button>
            </form>
            <button onClick={() => setShowProfilePictureModal(false)}>Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Acc;