import React, { useEffect, useRef } from "react";
import { convertCssJsonToString } from "../for_BlockEditor/cssParser";

const BlockSandbox = ({ html, css, js, dependencies = [] }) => {
  const iframeRef = useRef(null);

  const defaultDependencies = [
    "https://code.jquery.com/jquery-3.6.0.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css",
    "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/js/bootstrap.bundle.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/gsap/2.1.3/TweenMax.min.js",
  ];

  const combinedDependencies = [...defaultDependencies, ...dependencies];

  const renderElement = (node) => {
    if (typeof node === "string") return node;
    if (!node || !node.tag) return "";
    const attributes = Object.entries(node.attributes || {})
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
    const children = Array.isArray(node.children)
      ? node.children.map(renderElement).join("")
      : "";
    return `<${node.tag} ${attributes}>${children}</${node.tag}>`;
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMessage = (event) => {
      if (event.data?.height) {
        iframe.style.height = `${event.data.height}px`;
      }
    };

    window.addEventListener("message", handleMessage);

    const compiledHtml = renderElement(html);
    const compiledCss = css ? convertCssJsonToString(css) : "";

    const doc = iframe.contentDocument || iframe.contentWindow.document;
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
          <style>${compiledCss}</style>
        </head>
        <body onload="sendHeight()">
          ${compiledHtml}
          <script>
            function sendHeight() {
              setTimeout(() => {
                const height = document.body.scrollHeight;
                window.parent.postMessage({ height }, "*");
              }, 50);
            }
            window.addEventListener("DOMContentLoaded", sendHeight);
            window.addEventListener("resize", sendHeight);
          <\/script>
          <script>${js}<\/script>
        </body>
      </html>
    `);
    doc.close();

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [html, css, js, combinedDependencies]);

  return (
    <iframe
      ref={iframeRef}
      title="sandbox"
      style={{
        width: "100%",
        border: "none",
        minHeight: "100%", // Устанавливаем минимальную высоту
        height: "auto",
        overflow: "hidden",
      }}
      sandbox="allow-scripts allow-same-origin"
    />
  );
};

export default BlockSandbox;
