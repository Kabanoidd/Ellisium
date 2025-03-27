import React from "react";
import BlockSandbox from "../forRender/BlockSandbox";
import "../css/MarketBlocks.css";

const BlockDetailsModal = ({ block, onClose, onViewCode, onAdd }) => {
  return (
    <div className="block-details-modal-overlay" onClick={onClose}>
      <div className="block-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          
          <div className="block-sandbox-container">
            <BlockSandbox
              html={block.structure}
              css={block.styles}
              js={block.script}
            />
          </div>
          <h3>{block.name}</h3>
          <div className="author-info">
            <p>Автор компонента: {block.username}</p>
          </div>
          <p>Дата создания: {new Date(block.createdAt).toLocaleDateString()}</p>
          <div className="modal-actions">
            <button onClick={onViewCode}>Просмотреть код</button>
            <button onClick={onAdd}>Добавить</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockDetailsModal;
