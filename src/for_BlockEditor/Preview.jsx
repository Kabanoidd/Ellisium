import React, { useEffect, useRef } from "react";
import "../css/Creating.css";

const Preview = ({ html, css, js, dependencies = [] }) => {
  const previewRef = useRef(null);
  const MAX_HEIGHT = 1000; // максимальная высота в пикселях

  // Библиотеки по умолчанию (например, jQuery)
  const defaultDependencies = ["https://code.jquery.com/jquery-3.6.0.min.js"];
  const combinedDependencies = [...defaultDependencies, ...dependencies];

  useEffect(() => {
    const previewFrame = previewRef.current;
    if (previewFrame) {
      const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
      doc.open();
      doc.write(`
        <html>
          <head>
            ${combinedDependencies
              .map((dep) =>
                dep.endsWith(".css")
                  ? `<link rel="stylesheet" href="${dep}" />`
                  : `<script src="${dep}"></script>`
              )
              .join("\n")}
            <style>${css}</style>
          </head>
          <body>
            ${html}
            <script>
              function sendHeight() {
                setTimeout(function() {
                  var height = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
                  window.parent.postMessage({ height: height }, "*");
                }, 50);
              }
              document.addEventListener("DOMContentLoaded", sendHeight);
              window.addEventListener("resize", sendHeight);
            <\/script>
            <script>${js}<\/script>
          </body>
        </html>
      `);
      doc.close();

      // Подождём, чтобы убедиться, что все стили и контент загружены
      setTimeout(() => {
        if (doc.body && previewFrame) {
          const contentHeight = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
          // Если высота контента больше MAX_HEIGHT, устанавливаем iframe равным MAX_HEIGHT,
          // тогда внутри iframe появится внутренняя прокрутка.
          previewFrame.style.height = (contentHeight > MAX_HEIGHT ? MAX_HEIGHT : contentHeight) + "px";
        }
      }, 500);
    }
  }, [html, css, js, combinedDependencies]);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.height && previewRef.current) {
        const contentHeight = event.data.height;
        previewRef.current.style.height = (contentHeight > MAX_HEIGHT ? MAX_HEIGHT : contentHeight) + "px";
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="preview-container" style={{ maxHeight: `${MAX_HEIGHT}px` }}>
      <iframe
        title="preview"
        ref={previewRef}
        style={{
          width: "100%",
          border: "1px solid #ccc",
          height: "auto",
          overflowY: "auto", // Внутренняя прокрутка появится, если контент больше MAX_HEIGHT
        }}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

export default Preview;
