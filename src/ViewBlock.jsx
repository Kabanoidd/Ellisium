import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Preview from "./for_BlockEditor/Preview";
import { convertJsonToHtml } from "./for_BlockEditor/utils"; 
import { convertCssJsonToString } from "./for_BlockEditor/cssParser"; 


const ViewBlock = () => {
  const { id } = useParams();
  const [block, setBlock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:3002/api/blocks/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setBlock(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка загрузки блока:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <p>Загрузка...</p>;
  if (!block) return <p>Ошибка: блок не найден</p>;

  const blockHtml =
    typeof block.structure === "object"
      ? convertJsonToHtml(block.structure)
      : block.structure || "";
  const blockCss =
    typeof block.styles === "object"
      ? convertCssJsonToString(block.styles)
      : block.styles || "";
  const blockJs = block.script || "";

  return (
    <div className="view-block-container">
      <div className="code-section">
        <h2>HTML</h2>
        <pre>{blockHtml}</pre>
        <h2>CSS</h2>
        <pre>{blockCss}</pre>
        {blockJs && (
          <>
            <h2>JavaScript</h2>
            <pre>{blockJs}</pre>
          </>
        )}
      </div>
      <div className="preview-section">
        <Preview html={blockHtml} css={blockCss} js={blockJs} />
      </div>
    </div>
  );
};

export default ViewBlock;
