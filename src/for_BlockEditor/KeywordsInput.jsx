import React from "react";
import "../css/Creating.css";
import inf from "../../public/info.png";

const KeywordsInput = ({ keywords, setKeywords, error }) => {
  return (
    <div className="keywords-input-container">
    <div className="df">
    <label htmlFor="keywords">Ключевые слова (через пробел):</label> 
           <div className="tooltip-container" data-tooltip="Рекомендуем вам добавить от 3-х ключевых слов для вашего компонента чтобы облегчить его поиск в дальнейшем">
          <img src={inf} alt="info" className="inf" />
        </div>
    </div>
      <input
        type="text"
        id="keywords"
        placeholder="Введите ключевые слова"
        value={keywords}
        onChange={(e) => setKeywords(e.target.value)}
      />
      {error && <p className="error">{error}</p>}
    </div>
  );
};

export default KeywordsInput;
