import React, { useState, useEffect, useRef } from "react";
import { Editor } from "@monaco-editor/react";
import "../css/Creating.css";

const FullscreenEditor = ({ initialValue, onConfirm, onCancel, type }) => {
  const [content, setContent] = useState(initialValue || "");
  const modalRef = useRef(null);

  useEffect(() => {
    setContent(initialValue || "");
  }, [initialValue]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onCancel();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onCancel]);

  const getLanguage = () => {
    switch (type) {
      case "html":
        return "html";
      case "css":
        return "css";
      case "js":
      case "javascript":
        return "javascript";
      default:
        return "plaintext";
    }
  };

  return (
    <div className="fullscreen-modal">
      <div className="fullscreen-editor" ref={modalRef}>
        <div className="editor-label">Редактирование {type?.toUpperCase() || "TEXT"}</div>
        <Editor
          key={type} // Важно: сбрасывает состояние при смене типа
          height="80vh"
          language={getLanguage()}
          theme="vs-light"
          value={content}
          onChange={(value) => setContent(value)}
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: "on",
            automaticLayout: true,
            quickSuggestions: true,
            parameterHints: { enabled: true },
            suggestOnTriggerCharacters: true,
            formatOnType: true,
            mouseWheelZoom: true,
            renderIndentGuides: false,
            renderLineHighlight: "none",
          }}
        />
        <button className="confirm-button" onClick={() => onConfirm(content)}>
          Подтвердить
        </button>
      </div>
    </div>
  );
};

export default FullscreenEditor;