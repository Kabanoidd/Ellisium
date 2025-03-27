import React, { useState, useEffect } from "react";
import BlockSandbox from "./BlockSandbox";
import "../css/Creating.css";

const PreviewPage = () => {
  const [selectedBlocks, setSelectedBlocks] = useState([]);

  // Функция обновления состояния из localStorage
  const updateBlocks = () => {
    const blocksData = localStorage.getItem("selectedBlocks");
    if (blocksData) {
      try {
        setSelectedBlocks(JSON.parse(blocksData));
      } catch (e) {
        console.error("Ошибка парсинга выбранных блоков:", e);
      }
    }
  };

  useEffect(() => {
    updateBlocks();
    // Обновляем состояние каждые 2 секунды (имитация реального времени)
    const intervalId = setInterval(updateBlocks, 2000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="preview-page">
      {selectedBlocks.length ? (
        selectedBlocks.map((block, index) => (
          <div key={index} className="block-preview">
            <BlockSandbox
              // Если блок хранит html и css как объекты, используем их, иначе fallback к старым названиям
              html={block.html || block.structure}
              css={block.css || block.styles}
              js={block.js || block.script || ""}
            />
          </div>
        ))
      ) : (
        <p>Нет выбранных блоков</p>
      )}
    </div>
  );
};

export default PreviewPage;
