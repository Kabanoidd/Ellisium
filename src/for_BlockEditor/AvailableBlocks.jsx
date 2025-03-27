import React, { useState, useCallback, useRef } from "react";
import "../css/Creating.css";

const AvailableBlocks = ({ blocks, onBlockSelect }) => {
  const [displayCount, setDisplayCount] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Фильтруем блоки по введённому запросу
  const filteredBlocks = blocks.filter((block) =>
    block.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Infinite scroll с IntersectionObserver
  const observer = useRef();
  const lastBlockRef = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && displayCount < filteredBlocks.length) {
          setDisplayCount((prev) => prev + 10);
        }
      });
      if (node) observer.current.observe(node);
    },
    [displayCount, filteredBlocks]
  );

  // Функция для получения dataURL из блока (предполагается, что block.preview содержит данные)
  const getPreviewUrl = (block) => {
    if (!block.preview?.data) return "";
    const uintArray = new Uint8Array(block.preview.data.data);
    let binary = "";
    uintArray.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const base64String = window.btoa(binary);
    return `data:${block.preview.contentType};base64,${base64String}`;
  };

  return (
    <div className="available-blocks-container">
      <input
        type="text"
        placeholder="Поиск по блокам"
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setDisplayCount(10); // сбрасываем число отображаемых карточек при изменении поиска
        }}
        className="available-blocks-search"
      />
      <div className="available-blocks-list">
        {filteredBlocks.slice(0, displayCount).map((block, index) => (
          <div
            key={block._id}
            className="available-block-card"
            onClick={() => onBlockSelect(block)}
            ref={index === displayCount - 1 ? lastBlockRef : null}
          >
            <div
              className="available-block-image"
              style={{ backgroundImage: `url(${getPreviewUrl(block)})` }}
            ></div>
            <p className="available-block-name">{block.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableBlocks;
