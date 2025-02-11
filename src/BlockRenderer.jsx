import React, { useState, useEffect } from 'react';
import BlockRenderer from './BlockRenderer';
import BlockThumbnail from './BlockThumbnail';

const BlockListPage = () => {
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Загружаем список блоков с сервера
  useEffect(() => {
    fetch("http://localhost:3002/api/blocks")
      .then((res) => res.json())
      .then((data) => setBlocks(data))
      .catch((err) => console.error("Ошибка получения блоков:", err));
  }, []);

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      {/* Боковая панель со списком блоков */}
      <div style={{ width: '300px', borderRight: '1px solid #ccc', marginRight: '20px' }}>
        <h3>Сохраненные блоки</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {blocks.map((block) => (
            <li
              key={block._id}
              style={{
                cursor: 'pointer',
                padding: '8px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
              onClick={() => setSelectedBlock(block)}
            >
              <BlockThumbnail block={block} />
              <span>{block.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Область предпросмотра выбранного блока */}
      <div style={{ flex: 1 }}>
        <h3>Предпросмотр блока</h3>
        {selectedBlock ? (
          <BlockRenderer block={selectedBlock} />
        ) : (
          <div>Выберите блок для предпросмотра</div>
        )}
      </div>
    </div>
  );
};

export default BlockListPage;
