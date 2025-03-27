import Sass from "sass.js/dist/sass.sync"; // синхронная версия sass.js

// Обёртка для Sass.compile в Promise
export const compileSass = (scss) => {
  return new Promise((resolve, reject) => {
    Sass.compile(scss, (result) => {
      if (result.status === 0) {
        resolve(result.text);
      } else {
        reject(new Error(result.formatted));
      }
    });
  });
};

// Обнаружение зависимостей в SCSS
export const detectScssDependencies = (scssCode) => {
  const importRegex = /@import\s+["']([^"']+)["']/g;
  const dependencies = [];
  let match;
  while ((match = importRegex.exec(scssCode)) !== null) {
    dependencies.push(match[1]);
  }
  return dependencies;
};

// Загрузка внешних библиотек
export const loadLibrary = (libraryName) => {
  const libraryMap = {
    "compass/css3": "https://cdnjs.cloudflare.com/ajax/libs/compass/0.1.0/compass.min.css",
    bootstrap: "https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.1.3/css/bootstrap.min.css",
    jquery: "https://code.jquery.com/jquery-3.6.0.min.js",
    fontAwesome: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css",
  };
  if (libraryMap[libraryName]) {
    const isScript = libraryMap[libraryName].endsWith(".js");
    const element = isScript
      ? Object.assign(document.createElement("script"), { src: libraryMap[libraryName] })
      : Object.assign(document.createElement("link"), {
          rel: "stylesheet",
          href: libraryMap[libraryName],
        });
    document.head.appendChild(element);
    return true;
  } else {
    console.warn(`Библиотека "${libraryName}" не найдена.`);
    return false;
  }
};

// Преобразование HTML в JSON-объект
export const convertHtmlToJson = (htmlString) => {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    
    const convertElement = (element) => {
      if (!element.tagName) {
        return element.nodeType === 3 ? element.textContent : {};
      }
      return {
        tag: element.tagName.toLowerCase(),
        attributes: [...element.attributes].reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
        children: [...element.childNodes].map((node) => convertElement(node)),
      };
    };
    
    return convertElement(doc.body);
  } catch (error) {
    console.error("Ошибка в convertHtmlToJson:", error);
    return { tag: "div", children: ["Ошибка"] };
  }
};


export function convertJsonToHtml(structure) {
  if (typeof structure === "string") {
    return structure; // Если структура — строка, просто возвращаем её
  }
  if (!structure || !structure.tag) {
    return ""; // Если структура пуста, возвращаем пустую строку
  }

  const { tag, attributes = {}, children = [] } = structure;
  const attrsString = Object.entries(attributes)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
  
  const innerHtml = Array.isArray(children)
    ? children.map(convertJsonToHtml).join("")
    : children;

  return `<${tag} ${attrsString}>${innerHtml}</${tag}>`;
};