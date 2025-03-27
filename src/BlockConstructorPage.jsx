import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./css/Creating.css";
import BlockSandbox from "./forRender/BlockSandbox";
import Sidebar from "./for_BlockEditor/Sidebar";
import { convertHtmlToJson } from "./for_BlockEditor/utils";

const BlockViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [project, setProject] = useState(location.state?.project || null);
  const [selectedBlocks, setSelectedBlocks] = useState([]);
  const [user, setUser] = useState(null);
  const [projectName, setProjectName] = useState("");
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (project) {
      setProjectName(project.projectName || project.name || "");
      setSelectedBlocks(Array.isArray(project.blocks) ? project.blocks : []);
    }
  }, [project]);

  useEffect(() => {
    localStorage.setItem("selectedBlocks", JSON.stringify(selectedBlocks));
    return () => {
      localStorage.removeItem("selectedBlocks");
    };
  }, [selectedBlocks]);

  const addBlock = (block) => {
    let structure = block.structure;
    let styles = block.styles;
    try {
      if (typeof structure === "string") structure = JSON.parse(structure);
    } catch (e) {
      console.error("Ошибка парсинга structure:", e);
    }
    try {
      if (typeof styles === "string") styles = JSON.parse(styles);
    } catch (e) {
      console.error("Ошибка парсинга styles:", e);
    }
    const newBlock = { ...block, structure, styles, isEditing: false };
    setSelectedBlocks([...selectedBlocks, newBlock]);
  };

  const removeBlock = (index) => {
    setSelectedBlocks(selectedBlocks.filter((_, i) => i !== index));
  };

  const toggleEditMode = (index) => {
    console.log("Тоггл режима редактирования блока:", index);
    const updatedBlocks = selectedBlocks.map((block, i) =>
      i === index ? { ...block, isEditing: !block.isEditing } : block
    );
    setSelectedBlocks(updatedBlocks);
  };

  const handleInlineEditBlur = (index, e) => {
    const newHtml = e.target.innerHTML;
    try {
      const newStructure = convertHtmlToJson(newHtml);
      const updatedBlocks = selectedBlocks.map((block, i) =>
        i === index ? { ...block, structure: newStructure, isEditing: false } : block
      );
      setSelectedBlocks(updatedBlocks);
    } catch (error) {
      console.error("Ошибка преобразования HTML в объект:", error);
    }
  };

  const saveProject = () => {
    if (!user) return alert("Необходимо авторизоваться!");
    if (!projectName.trim()) return alert("Введите название проекта!");

    const projectData = {
      userId: user.id,
      userName: user.name,
      projectName: projectName.trim(),
      blocks: selectedBlocks.map((block) => ({
        id: block._id || block.id,
        html: block.structure,
        css: block.styles,
        js: block.script,
      })),
    };

    console.log("Отправка данных:", JSON.stringify(projectData, null, 2));
    fetch("http://localhost:3002/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(projectData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка сервера");
        return res.json();
      })
      .then(() => alert("Проект сохранен!"))
      .catch((error) => {
        console.error("Ошибка сохранения:", error);
        alert("Ошибка сохранения: " + error.message);
      });
  };

  const openPreview = () => {
    window.open("/prev", "_blank");
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="all_cr">
      <Sidebar user={user} onBlockSelect={addBlock} />
      <div className="right_cr">
        <div className="right_top_cr">
          <p className="zag">Создать проект</p>
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
            <button onClick={saveProject} className="save-btn">
              Сохранить
            </button>
          </div>
        </div>
        <div className="right_bottom_cr">
          {selectedBlocks.length ? (
            selectedBlocks.map((block, index) => (
              <div key={index} className="block-preview" style={{ width: "100%" }}>
                {block.isEditing ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning={true}
                    onBlur={(e) => handleInlineEditBlur(index, e)}
                    dangerouslySetInnerHTML={{
                      __html:
                        typeof block.structure === "string"
                          ? block.structure
                          : JSON.stringify(block.structure),
                    }}
                    className="inline-editor"
                    style={{ minWidth: "100%", minHeight: "100px", border: "1px solid #ddd", padding: "10px" }}
                  />
                ) : (
                  <div onDoubleClick={() => toggleEditMode(index)}>
                    <BlockSandbox
                      html={block.structure}
                      css={block.styles}
                      js={block.script || ""}
                    />
                  </div>
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

export default BlockViewer;
