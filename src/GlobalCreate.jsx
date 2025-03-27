import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Creating.css";
import pen from "../public/pen_cr.png";
import blocksImg from "../public/block_cr.png";
import search from "../public/search.png";
import nulle from "../public/null.png";
import Sidebar from "./for_BlockEditor/Sidebar";
const GlobalCreating = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Состояние пользователя
  const [loading, setLoading] = useState(true); // Состояние загрузки
  const [projects, setProjects] = useState([]); // Состояние проектов
  const [searchTerm, setSearchTerm] = useState(""); // Строка для поиска

  // Получаем данные пользователя
  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Ответ сервера:", data);
        if (data && data.user) {
          setUser(data.user);
          fetchProjects(data.user.id);
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Ошибка проверки авторизации:", error);
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  // Функция для загрузки проектов пользователя
  const fetchProjects = (userId) => {
    fetch(`http://localhost:3002/api/projects/${userId}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке проектов:", error);
      });
  };

  // Фильтрация проектов по строке поиска
  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Переход в редактор проекта
  const handleProjectClick = (project) => {
    navigate(`/project-edit/${project._id}`, { state: { project } });
  };

  // Функция удаления проекта
  const handleDeleteProject = (projectId) => {
    if (window.confirm("Вы уверены, что хотите удалить проект?")) {
      fetch(`http://localhost:3002/api/projects/${projectId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Ошибка удаления проекта");
          return res.json();
        })
        .then(() => {
          alert("Проект удален!");
          // Обновляем локальный список проектов
          setProjects((prev) => prev.filter((proj) => proj._id !== projectId));
        })
        .catch((err) => {
          console.error("Ошибка удаления проекта:", err);
          alert("Ошибка удаления проекта: " + err.message);
        });
    }
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="all_cr">
      <Sidebar user={user} />
      <div className="right_cr">
        <div className="right_top_cr">
          <p className="zag">Мои проекты</p>
        </div>
        <div className="right_bottom_cr">
          <div className="buttons_for_cr">
            <div className="create_btns">
              <div className="new_project" onClick={() => navigate("/ren")}>
                <p>Создать проект</p>
                <img src={pen} alt="pen" />
              </div>
              <div className="new_block" onClick={() => navigate("/create")}>
                <p>Создать компонент</p>
                <img src={blocksImg} alt="" />
              </div>
            </div>
            <div className="search">
              <input
                type="text"
                placeholder="Поиск по названию"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <img src={search} alt="" />
            </div>
          </div>
          <div className="my_projects">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project._id}
                  className="project-item"
                  onClick={() => handleProjectClick(project)}
                >
                    <h3>{project.name}</h3>
                    <p>Создан: {new Date(project.createdAt).toLocaleDateString()}</p>
                    <button
                    className="delete-project-btn"
                    onClick={(e) => {
                      e.stopPropagation(); // чтобы не срабатывал переход по клику на весь блок
                      handleDeleteProject(project._id);
                    }}
                  >
                    Удалить
                  </button>

                </div>
              ))
            ) : (
              <img src={nulle} alt="" className="img_nn" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalCreating;
