import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../css/Creating.css";
import BlockSandbox from "./BlockSandbox";
import Sidebar from "../for_BlockEditor/Sidebar";
const ProjectEditor = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Если проект передан через state, используем его; иначе null.
  const [project, setProject] = useState(location.state?.project || null);
  const [projectName, setProjectName] = useState("");
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [blocks, setBlocks] = useState([]); // Все доступные блоки (для добавления)
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных пользователя
  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          navigate("/");
        }
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Загрузка доступных блоков для добавления (если понадобится)
  useEffect(() => {
    fetch("http://localhost:3002/api/blocks", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setBlocks(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  // Если проект не передан через state, попробуем загрузить его по query-параметру id
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const projectId = query.get("id");
    if (!project && projectId) {
      fetch(`http://localhost:3002/api/projects/${projectId}`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          console.log("Загруженный проект:", data);
          setProject(data);
        })
        .catch((error) => console.error("Ошибка загрузки проекта:", error));
    }
  }, [location, project]);

  // При загрузке проекта установить имя и выбранные блоки
  useEffect(() => {
    if (project) {
      setProjectName(project.projectName || project.name || "");
      // Обрабатываем блоки: для каждого блока берем html (или structure) и css (или styles)
      const processedBlocks = Array.isArray(project.blocks)
        ? project.blocks.map((block) => {
            const htmlData = block.html || block.structure;
            const cssData = block.css || block.styles;
            const jsData = block.js || block.script || "";
            return { ...block, html: htmlData, css: cssData, js: jsData };
          })
        : [];
      setSelectedBlocks(processedBlocks);
    }
  }, [project]);

  // Сохраняем выбранные блоки в localStorage для PreviewPage (если используется)
  useEffect(() => {
    localStorage.setItem("selectedBlocks", JSON.stringify(selectedBlocks));
    return () => {
      localStorage.removeItem("selectedBlocks");
    };
  }, [selectedBlocks]);

  // Функция для добавления нового блока из списка доступных блоков
  const addBlock = (block) => {
    let htmlData = block.html || block.structure;
    let cssData = block.css || block.styles;
    if (typeof htmlData === "string") {
      try {
        htmlData = JSON.parse(htmlData);
      } catch (e) {
        console.error("Ошибка парсинга html (new):", e);
      }
    }
    if (typeof cssData === "string") {
      try {
        cssData = JSON.parse(cssData);
      } catch (e) {
        console.error("Ошибка парсинга css (new):", e);
      }
    }
    const jsData = block.js || block.script || "";
    const newBlock = { ...block, html: htmlData, css: cssData, js: jsData };
    setSelectedBlocks([...selectedBlocks, newBlock]);
  };

  const removeBlock = (index) => {
    setSelectedBlocks(selectedBlocks.filter((_, i) => i !== index));
  };

  // Функция обновления проекта (PUT-запрос)
  const updateProject = () => {
    if (!user) return alert("Необходимо авторизоваться!");
    if (!projectName.trim()) return alert("Введите название проекта!");
    if (!project) return alert("Проект не найден!");

    // Формируем объект для обновления проекта
    const updatedProject = {
      userId: project.userId,
      userName: project.userName,
      projectName: projectName.trim(),
      blocks: selectedBlocks.map((block) => ({
        id: block._id || block.id,
        html: block.html || block.structure,
        css: block.css || block.styles,
        js: block.js || block.script || "",
      })),
    };

    console.log("Обновление проекта:", JSON.stringify(updatedProject, null, 2));

    fetch(`http://localhost:3002/api/projects/${project._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedProject),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка обновления проекта");
        return res.json();
      })
      .then(() => alert("Проект обновлен!"))
      .catch((error) => {
        console.error("Ошибка обновления:", error);
        alert("Ошибка обновления: " + error.message);
      });
  };

  const openPreview = () => {
    window.open("/prev", "_blank");
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="all_cr">
      <Sidebar user={user} />
      <div className="right_cr">
        <div className="right_top_cr">
          <p className="zag">Редактировать проект</p>
          <div className="for_lab">
            <input
              type="text"
              className="project-name-input"
              placeholder="Введите название проекта"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
            <button onClick={openPreview} className="preview-btn">
              Предпросмотр проекта
            </button>
            <button onClick={updateProject} className="save-btn">
              Обновить проект
            </button>
          </div>
        </div>
        <div className="right_bottom_cr">
          {selectedBlocks.length ? (
            selectedBlocks.map((block, index) => (
              <div key={index} className="block-preview">
                {block.html && block.css && (
                  <BlockSandbox
                    html={block.html || block.structure}
                    css={block.css || block.styles}
                    js={block.js || block.script || ""}
                  />
                )}
                <button onClick={() => removeBlock(index)} className="del">
                  Удалить
                </button>
              </div>
            ))
          ) : (
            <p>Выберите компоненты</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectEditor;
