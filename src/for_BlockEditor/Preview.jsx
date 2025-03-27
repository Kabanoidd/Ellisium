import React, { useEffect, useRef } from "react";
import "../css/Creating.css";

const Preview = ({ html, css, js }) => {
  const previewRef = useRef(null);
  const MAX_HEIGHT = 1000; // максимальная высота в пикселях

  useEffect(() => {
    const previewFrame = previewRef.current;
    if (previewFrame) {
      const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
      doc.open();
      doc.write(`
        <html>
          <head>
            <style>${css}</style>
          </head>
          <body onload="sendHeight()">
            ${html}
            <script>
              function sendHeight() {
                window.parent.postMessage({ height: document.body.scrollHeight }, "*");
              }
              window.addEventListener("DOMContentLoaded", sendHeight);
              window.addEventListener("resize", sendHeight);
            <\/script>
            <script>${js}<\/script>
          </body>
        </html>
      `);
      doc.close();

      // Немного подождем и установим высоту, не превышающую MAX_HEIGHT
      setTimeout(() => {
        if (doc.body) {
          const contentHeight = doc.body.scrollHeight;
          previewFrame.style.height = `${Math.min(contentHeight, MAX_HEIGHT)}px`;
        }
      }, 100);
    }
  }, [html, css, js]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.height && previewRef.current) {
        const contentHeight = event.data.height;
        previewRef.current.style.height = `${Math.min(contentHeight, MAX_HEIGHT)}px`;
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="preview-container">
      <iframe
        title="preview"
        ref={previewRef}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          overflowY: "auto", // добавляем прокрутку, если контент превышает MAX_HEIGHT
        }}
      />
    </div>
  );
};

export default Preview;
