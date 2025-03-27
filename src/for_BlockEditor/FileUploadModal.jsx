import React, { useRef, useEffect } from "react";
import "../css/Creating.css";
import folder from "../../public/folder.png"
const FileUploadModal = ({ onClose, onFileSelect, accept, title }) => {
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Если клик внутри модального окна – открыть проводник
  const handleClickInside = (e) => {
    if (modalRef.current && modalRef.current.contains(e.target)) {
      inputRef.current.click();
    }
  };

  // Если клик вне окна – закрыть модал
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      onFileSelect(file);
      onClose();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
      onClose();
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="upload-modal-overlay">
      <div
        className="upload-modal"
        ref={modalRef}
        onClick={handleClickInside}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <h3>{title}</h3>
        <p>Перетащите файл сюда или нажмите, чтобы выбрать файл</p>
        <img src={folder} alt="" />
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

export default FileUploadModal;
