import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./for_BlockEditor/Sidebar";
import FullscreenEditor from "./for_BlockEditor/FullscreenEditor";
import Preview from "./for_BlockEditor/Preview";
import Modal from "./for_BlockEditor/Modal";
import EditorForm from "./for_BlockEditor/EditorForm";
import FileUploadModal from "./for_BlockEditor/FileUploadModal";
import KeywordsInput from "./for_BlockEditor/KeywordsInput";
import {
  compileSass,
  detectScssDependencies,
  loadLibrary,
  convertHtmlToJson,
} from "./for_BlockEditor/utils";
import { parseCssToJson } from "./for_BlockEditor/cssParser";
import "./css/Creating.css";

const BlockEditor = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [keywords, setKeywords] = useState(""); // новое состояние для ключевых слов
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isHtmlFullscreen, setIsHtmlFullscreen] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const [isJsFullscreen, setIsJsFullscreen] = useState(false);
  const [archiveFile, setArchiveFile] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [archiveFileName, setArchiveFileName] = useState("");
  const [previewFileName, setPreviewFileName] = useState("");
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
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
      .catch(() => navigate("/"));
  }, [navigate]);

  const validateForm = () => {
    let newErrors = {};
    if (!name.trim()) newErrors.name = "Поле обязательно к заполнению";
    if (!html.trim()) newErrors.html = "Поле обязательно к заполнению";
    if (!previewFile) newErrors.preview = "Фото-превью обязательно";
    // При необходимости можно добавить валидацию ключевых слов
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!user) return;
    if (!validateForm()) return;

    const dependencies = detectScssDependencies(css);
    for (const dep of dependencies) {
      if (!loadLibrary(dep)) {
        setErrors((prev) => ({
          ...prev,
          css: `Библиотека "${dep}" не найдена. Убедитесь, что она поддерживается.`,
        }));
        return;
      }
    }

    let compiledCss = "";
    try {
      compiledCss = await compileSass(css);
    } catch (error) {
      setErrors((prev) => ({ ...prev, css: "Ошибка компиляции SCSS" }));
      return;
    }

    const newHtmlJson = JSON.stringify(convertHtmlToJson(html));
    let newCssJson;
    try {
      newCssJson = JSON.stringify(parseCssToJson(compiledCss));
    } catch (error) {
      setErrors((prev) => ({ ...prev, css: "Ошибка в CSS" }));
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("structure", newHtmlJson);
    formData.append("styles", newCssJson);
    formData.append("script", js);
    // Добавляем ключевые слова как JSON-массив
    const keywordsArray = keywords
      .split(" ")
      .map((word) => word.trim())
      .filter((word) => word);
    formData.append("keywords", JSON.stringify(keywordsArray));

    if (archiveFile) {
      formData.append("archive", archiveFile);
    }
    formData.append("preview", previewFile);

    try {
      const response = await fetch("http://localhost:3002/api/save-block", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const result = await response.json();
      setModalMessage(result.message);
      setModalVisible(true);
    } catch (error) {
      console.error("Ошибка сохранения компонента:", error);
    }
  };

  return (
    <div className="all_cr">
      <Sidebar user={user} />
      <div className="right_cr">
        <div className="right_top_cr">
          <p className="zag">Создать компонент</p>
        </div>
        <div className="right_bottom_cr">
          <div>
            <EditorForm
              name={name}
              setName={setName}
              html={html}
              setHtml={setHtml}
              css={css}
              setCss={setCss}
              js={js}
              setJs={setJs}
              errors={errors}
              onHtmlFullscreen={() => setIsHtmlFullscreen(true)}
              onCssFullscreen={() => setIsCssFullscreen(true)}
              onJsFullscreen={() => setIsJsFullscreen(true)}
              onOpenFileModalArchive={() => setShowArchiveModal(true)}
              onOpenFileModalPreview={() => setShowPreviewModal(true)}
              archiveFileName={archiveFileName}
              previewFileName={previewFileName}
            />
            {/* Добавляем компонент для ввода ключевых слов */}
            <KeywordsInput
              keywords={keywords}
              setKeywords={setKeywords}
              error={errors.keywords}
            />
            <button onClick={handleSubmit} className="save_block">
              Сохранить компонент
            </button>
          </div>
          <Preview html={html} css={css} js={js} />
        </div>
      </div>

      {modalVisible && (
        <Modal message={modalMessage} onClose={() => setModalVisible(false)} />
      )}

      {isHtmlFullscreen && (
        <FullscreenEditor
          initialValue={html}
          onConfirm={(newVal) => {
            setHtml(newVal);
            setIsHtmlFullscreen(false);
          }}
          onCancel={() => setIsHtmlFullscreen(false)}
          type="html"
        />
      )}
      {isCssFullscreen && (
        <FullscreenEditor
          initialValue={css}
          onConfirm={(newVal) => {
            setCss(newVal);
            setIsCssFullscreen(false);
          }}
          onCancel={() => setIsCssFullscreen(false)}
          type="css"
        />
      )}
      {isJsFullscreen && (
        <FullscreenEditor
          initialValue={js}
          onConfirm={(newVal) => {
            setJs(newVal);
            setIsJsFullscreen(false);
          }}
          onCancel={() => setIsJsFullscreen(false)}
          type="js"
        />
      )}

      {showArchiveModal && (
        <FileUploadModal
          title="Загрузите архив с фотографиями"
          accept=".zip"
          onFileSelect={(file) => {
            setArchiveFile(file);
            setArchiveFileName(file.name);
          }}
          onClose={() => setShowArchiveModal(false)}
        />
      )}

      {showPreviewModal && (
        <FileUploadModal
          title="Загрузите фото-превью"
          accept="image/*"
          onFileSelect={(file) => {
            setPreviewFile(file);
            setPreviewFileName(file.name);
          }}
          onClose={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
};

export default BlockEditor;
