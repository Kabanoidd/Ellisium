import React from "react";
import Editor from "@monaco-editor/react";
import "../css/Creating.css";
import ex from "../../public/export.png";
import inf from "../../public/info.png";

const EditorForm = ({
  name,
  setName,
  html,
  setHtml,
  css,
  setCss,
  js,
  setJs,
  errors,
  onHtmlFullscreen,
  onCssFullscreen,
  onJsFullscreen,
  onOpenFileModalArchive,
  onOpenFileModalPreview,
  archiveFileName,
  previewFileName,
}) => {
  const editorOptions = {
    fontSize: 12,
    minimap: { enabled: false },
    lineNumbers: "on",
    lineNumbersMinChars: 2,
    automaticLayout: true,
    overflowWidgets: true,
    renderLineHighlight: "none",
    wordWrap: "on",
    renderWhitespace: "none",
    tabSize: 2,
    insertSpaces: true,
    mouseWheelZoom: true,
    formatOnPaste: true,
    suggestOnTriggerCharacters: false,
    quickSuggestions: false,
    parameterHints: { enabled: false },
    wordBasedSuggestions: false,
    acceptSuggestionOnEnter: "off",
    tabCompletion: "off",
  };

  return (
    <div className="editor-form">
      <div className="sss">
        <label htmlFor="block-name">Название:</label>
        <input
          type="text"
          id="block-name"
          placeholder="Название компонента"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {errors.name && <p className="error">{errors.name}</p>}
        {/* Info icon с подсказкой для названия можно добавить здесь */}
      </div>

      {/* Блок для загрузки фото-превью */}
      <div className="file-input-container">
        <p className="forfile">Фото-превью</p>
        <label className="file-upload-label" onClick={onOpenFileModalPreview}>
          <p>Загрузить</p>
          <img src={ex} alt="upload" />
        </label>
        {previewFileName && <p className="file-name">{previewFileName}</p>}
        {errors.preview && <p className="error">{errors.preview}</p>}
        <div
          className="tooltip-container"
          data-tooltip="Обязательное поле: выберите фото-превью компонента, которое в последствии будет его отображать"
        >
          <img src={inf} alt="info" className="inf" />
        </div>
      </div>

      {/* Блок для загрузки архива с фотографиями */}
      <div className="file-input-container hhuo">
        <p className="forfile">Архив с фотографиями для проекта</p>
        <label className="file-upload-label" onClick={onOpenFileModalArchive}>
          <p>Загрузить</p>
          <img src={ex} alt="upload" />
        </label>
        {archiveFileName && <p className="file-name">{archiveFileName}</p>}
        <div
          className="tooltip-container"
          data-tooltip="Опциональное поле: загрузите архив с фотографиями, если необходимо"
        >
          <img src={inf} alt="info" className="inf" />
        </div>
      </div>

      <div className="pols">
        {/* HTML редактор */}
        <div className="textarea-container">
          <label>
            HTML:
            <button
              type="button"
              className="expand-btn"
              onClick={onHtmlFullscreen}
            >
              &#x26F6;
            </button>
          </label>
          <Editor
            height="300px"
            width="500px"
            language="html"
            value={html}
            onChange={(value) => setHtml(value)}
            options={editorOptions}
          />
          {errors.html && <p className="error">{errors.html}</p>}
        </div>

        {/* CSS редактор */}
        <div className="textarea-container">
          <label>
            CSS:
            <button
              type="button"
              className="expand-btn"
              onClick={onCssFullscreen}
            >
              &#x26F6;
            </button>
          </label>
          <Editor
            height="300px"
            width="500px"
            language="css"
            value={css}
            onChange={(value) => setCss(value)}
            options={editorOptions}
          />
          {errors.css && <p className="error">{errors.css}</p>}
        </div>

        {/* JavaScript редактор */}
        <div className="textarea-container">
          <label>
            JavaScript:
            <button
              type="button"
              className="expand-btn"
              onClick={onJsFullscreen}
            >
              &#x26F6;
            </button>
          </label>
          <Editor
            height="300px"
            width="500px"
            language="javascript"
            value={js}
            onChange={(value) => setJs(value)}
            options={editorOptions}
          />
        </div>
      </div>

      <p>
        Внимание! При использовании сторонних библиотек могут происходить
        проблемы с совместимостью. Для просмотра полного списка поддерживаемых
        библиотек перейдите по <span className="ssilka">ссылке</span>
      </p>
    </div>
  );
};

export default EditorForm;
