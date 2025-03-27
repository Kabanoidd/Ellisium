import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/index.css";
import "./css/profile.css";
// Иконки
import hm from "../public/home.png";
import sh from "../public/shop.png";
import sub from "../public/sub.png";
import acc from "../public/account.png";
import plus from "../public/plus.png";
import prof from "../public/profile.png";
import FileUploadModal from "./for_BlockEditor/FileUploadModal"; // ваше модальное окно

const Acc = () => {
  const [user, setUser] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Ошибка проверки авторизации:", error);
        navigate("/");
      });
  }, [navigate]);

  // Функция выхода
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setUser(null);
        navigate("/");
      } else {
        console.error("Ошибка при выходе из системы");
      }
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
    }
  };

  // При выборе файла в модальном окне
  const handleFileSelect = async (file) => {
    if (!file || !user) return;
    // Отправляем файл на сервер
    const formData = new FormData();
    formData.append("profilePicture", file);
    formData.append("userId", user.id);

    try {
      const response = await fetch("http://localhost:3002/api/upload-profile-picture", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Фотография профиля успешно обновлена:", data);
        // Обновляем user.profilePicture
        setUser((prevUser) => ({
          ...prevUser,
          profilePicture: data.profilePicture,
        }));
      } else {
        console.error("Ошибка при обновлении фотографии профиля");
      }
    } catch (error) {
      console.error("Ошибка при обновлении фотографии профиля:", error);
    }
    setShowProfileModal(false);
  };

  if (!user) {
    return <p>Загрузка...</p>;
  }

  return (
    <div className="all all_acc">
      {/* Панель с иконками */}
      <div className="panel">
        <ul className="imgs">
          <li onClick={() => navigate("/")}>
            <img src={hm} alt="Главная" />
          </li>
          <li>
            <img src={acc} alt="Аккаунт" />
          </li>
          <li onClick={() => navigate("/glob")}>
            <img src={plus} alt="Создать" />
          </li>
          <li>
            <img src={sh} alt="Магазин" />
          </li>
          <li>
            <img src={sub} alt="Подписка" />
          </li>
        </ul>
      </div>

      {/* Основной фон */}
      <div className="acc_bg">
        <div className="container">
          <div className="bg_block">
            <div className="lefthtAcc">
              <div className="data_user">
                {/* Фото профиля (по умолчанию 'prof' если user.profilePicture пуст) */}
                <img
                  src={user.profilePicture ? `http://localhost:3002${user.profilePicture}` : prof}
                  alt="Профиль"
                  className="profile-picture"
                  onClick={() => setShowProfileModal(true)}
                />
                <div className="data">
                  <p>Имя: {user.name}</p>
                  <p>Почта: {user.email}</p>
                  <p>Статус подписки: {user.status_sub}</p>
                </div>
                <div className="buttonsAcc">
                  <div className="llla">
                    <button>Изменить данные</button>
                    <button>Изменить пароль</button>
                  </div>
                  <button onClick={handleLogout}>Выход</button>
                </div>
              </div>
            </div>
            <div className="righthtAcc">
              <div className="kok">
                <div></div>
                <p>Мои проекты</p>
              </div>
              <div className="svo">
                <div></div>
                <p>Мои компоненты</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно для загрузки фото */}
      {showProfileModal && (
        <FileUploadModal
          title="Загрузите фотографию профиля"
          accept="image/*"
          onFileSelect={handleFileSelect}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
};

export default Acc;
