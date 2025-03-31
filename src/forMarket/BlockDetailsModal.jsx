import React from "react";
import { useNavigate } from "react-router-dom";
import Preview from "../for_BlockEditor/Preview";
import "../css/MarketBlocks.css";
import { convertJsonToHtml } from "../for_BlockEditor/utils"; 
import { convertCssJsonToString } from "../for_BlockEditor/cssParser"; 

const BlockDetailsModal = ({ block, onClose, onPublish, onDelete, onAdd, context }) => {
  const navigate = useNavigate();
  if (!block) return null; 

  const blockHtml =
    typeof block.structure === "object"
      ? convertJsonToHtml(block.structure)
      : block.structure || "";
  const blockCss =
    typeof block.styles === "object"
      ? convertCssJsonToString(block.styles)
      : block.styles || "";

  return (
    <div className="block-details-modal-overlay" onClick={onClose}>
      <div className="block-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-body">
          <div className="block-sandbox-container">
            <Preview html={blockHtml} css={blockCss} js={block.script || ""} />
          </div>
          <h3>{block.name}</h3>
          <div className="author-info">
            <p>Автор: {block.username}</p>
          </div>
          <p>Дата создания: {new Date(block.createdAt).toLocaleDateString()}</p>

          {/* КНОПКИ */}
          <div className="modal-actions">
            <button onClick={() => navigate(`/view-block/${block._id}`)}>
              Просмотреть код
            </button>
            {context === "BlockList" && (
              <>
                <button onClick={onPublish}>Опубликовать</button>
                <button onClick={onDelete}>Удалить</button>
              </>
            )}
            {context === "MarketBlocks" && (
              <button onClick={onAdd}>Добавить</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockDetailsModal;
