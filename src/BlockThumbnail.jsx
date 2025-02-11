import React, { useEffect, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import BlockRenderer from './BlockRenderer'; // ваш компонент, который рендерит блок по JSON-структуре

const BlockThumbnail = ({ block }) => {
  const containerRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    if (block && containerRef.current) {
      // Даем браузеру немного времени для рендера (если нужно)
      setTimeout(() => {
        html2canvas(containerRef.current, { backgroundColor: null })
          .then((canvas) => {
            const dataUrl = canvas.toDataURL();
            setThumbnail(dataUrl);
          })
          .catch((err) => console.error("Ошибка генерации миниатюры:", err));
      }, 100);
    }
  }, [block]);

  return (
    <div>
      {/* Скрытый контейнер для рендера блока */}
      <div
        ref={containerRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '200px',  // можно задать размер, соответствующий миниатюре
          overflow: 'hidden'
        }}
      >
        <BlockRenderer block={block} />
      </div>

      {/* Если миниатюра готова, отображаем её */}
      {thumbnail ? (
        <img
          src={thumbnail}
          alt="Thumbnail"
          style={{ width: '100px', height: 'auto', border: '1px solid #ccc' }}
        />
      ) : (
        <div style={{ width: '100px', height: '75px', background: '#eee' }}>Загрузка...</div>
      )}
    </div>
  );
};

export default BlockThumbnail;
