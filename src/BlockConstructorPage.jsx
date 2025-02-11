import React, { useState, useEffect } from 'react';
import BlockRenderer from './BlockRenderer'; // Предполагается, что этот компонент уже реализован

const BlockConstructorPage = () => {
  // Список доступных блоков, полученных с сервера
  const [availableBlocks, setAvailableBlocks] = useState([]);
  // Список блоков, добавленных в канвас (каждый блок получает уникальный идентификатор instanceId)
  const [selectedBlocks, setSelectedBlocks] = useState([]);

  // Загружаем доступные блоки с сервера при монтировании компонента
  useEffect(() => {
    fetch('http://localhost:3002/api/blocks')
      .then((res) => res.json())
      .then((data) => setAvailableBlocks(data))
      .catch((err) => console.error("Ошибка получения блоков:", err));
  }, []);

  // Функция добавления блока в канвас. При этом создается копия блока с уникальным instanceId,
  // чтобы можно было различать даже несколько копий одного и того же блока.
  const addBlockToCanvas = (block) => {
    const blockInstance = { ...block, instanceId: Date.now() + Math.random() };
    setSelectedBlocks([...selectedBlocks, blockInstance]);
  };

  // Функция удаления блока из канваса по его instanceId
  const removeBlockFromCanvas = (instanceId) => {
    setSelectedBlocks(selectedBlocks.filter((b) => b.instanceId !== instanceId));
  };

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      {/* Левая панель – список доступных блоков */}
      <div
        style={{
          width: '300px',
          borderRight: '1px solid #ccc',
          marginRight: '20px',
          paddingRight: '10px',
        }}
      >
        <h3>Доступные блоки</h3>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {availableBlocks.map((block) => (
            <li
              key={block._id}
              style={{
                cursor: 'pointer',
                padding: '10px',
                borderBottom: '1px solid #eee',
                display: 'flex',
                alignItems: 'center',
              }}
              onClick={() => addBlockToCanvas(block)}
            >
              {/* Можно добавить миниатюру, если она реализована */}
              <span>{block.name}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Правая панель – канвас для сборки сайта из выбранных блоков */}
      <div
        style={{
          flex: 1,
          padding: '10px',
          border: '1px solid #ccc',
          minHeight: '400px',
          position: 'relative',
          overflowY: 'auto',
        }}
      >
        <h3>Конструктор сайта</h3>
        {selectedBlocks.length === 0 && (
          <div style={{ padding: '10px', color: '#777' }}>
            Выберите блоки из левой панели для добавления на сайт.
          </div>
        )}
        {selectedBlocks.map((blockInstance) => (
          <div
            key={blockInstance.instanceId}
            style={{
              position: 'relative',
              marginBottom: '20px',
              padding: '10px',
              border: '1px dashed #aaa',
            }}
          >
            {/* Кнопка удаления блока */}
            <button
              onClick={() => removeBlockFromCanvas(blockInstance.instanceId)}
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                padding: '2px 6px',
                background: '#ff4d4f',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Удалить
            </button>
            {/* Рендер блока с применением его структуры, стилей и скрипта */}
            <BlockRenderer block={blockInstance} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlockConstructorPage;
