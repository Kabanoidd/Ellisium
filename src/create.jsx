import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const BlockEditor = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [html, setHtml] = useState("");
  const [css, setCss] = useState("");
  const [js, setJs] = useState("");
  const [htmlJson, setHtmlJson] = useState({});
  const [cssJson, setCssJson] = useState({});
  const navigate = useNavigate();


  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" }) // Отправляем куки
      .then((res) => res.json())
      .then((data) => {
        console.log("Проверка авторизации:", data);
        if (data.user) {
          setUser(data.user); // Устанавливаем пользователя, если он авторизован
        } else {
          navigate("/"); // Перенаправляем на главную страницу, если пользователь не авторизован
        }
      })
      .catch((error) => {
        console.error("Ошибка проверки авторизации:", error);
        navigate("/"); // Перенаправляем на главную страницу в случае ошибки
      });
  }, [navigate]); // Добавляем navigate в зависимости useEffect

  // Функция для выхода из сессии
  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/logout", {
        method: "POST",
        credentials: "include", // Включаем куки
      });

      if (response.ok) {
        console.log("Пользователь вышел из системы");
        setUser(null); // Сбрасываем состояние пользователя
        navigate("/"); // Перенаправляем на главную страницу
      } else {
        console.error("Ошибка при выходе из системы");
      }
    } catch (error) {
      console.error("Ошибка при выходе из системы:", error);
    }
  };


  // Функция для конвертации HTML в JSON
  const convertHtmlToJson = () => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
  
    if (!doc.body || !doc.body.firstChild) {
      setHtmlJson({});
      return;
    }
  
    const convertElement = (element) => {
      if (!element.tagName) {
        return element.nodeType === 3 ? element.textContent : {}; // Возвращаем текст или пустой объект
      }
  
      return {
        tag: element.tagName.toLowerCase(),
        attributes: [...element.attributes].reduce((acc, attr) => {
          acc[attr.name] = attr.value;
          return acc;
        }, {}),
        children: [...element.childNodes].map((node) => convertElement(node)), // Рекурсивный вызов
      };
    };
  
    setHtmlJson(convertElement(doc.body.firstChild));
  };
  // Функция для конвертации CSS в JSON
  const convertCssToJson = () => {
    const cssRules = css.split("}").filter((rule) => rule.trim() !== "");
    const jsonStyles = {};

    cssRules.forEach((rule) => {
      const [selector, properties] = rule.split("{");
      if (!selector || !properties) return;

      const cleanSelector = selector.trim();
      const styleObject = properties
        .trim()
        .split(";")
        .filter((prop) => prop.includes(":"))
        .reduce((acc, prop) => {
          const [key, value] = prop.split(":").map((item) => item.trim());
          acc[key] = value;
          return acc;
        }, {});

      jsonStyles[cleanSelector] = styleObject;
    });

    setCssJson(jsonStyles);
  };

  // Вызываем преобразования при изменении HTML или CSS
  useEffect(() => {
    convertHtmlToJson();
    convertCssToJson();
  }, [html, css]);

  // Функция сохранения в БД
  const saveBlockToDB = async () => {
    try {
      const response = await fetch("http://localhost:3002/api/save-block", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          structure: htmlJson,
          styles: cssJson,
          script: js,
        }),
      });

      const data = await response.json();
      alert(data.message);
    } catch (error) {
      console.error("Ошибка сохранения:", error);
    }
  };

  return (
    <div>
      <h2>Редактор блока</h2>
      <div>
        <label>Название блока</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>HTML</label>
        <textarea value={html} onChange={(e) => setHtml(e.target.value)} 
          placeholder="Ваш HTML код"
          />
      </div>
      <div>
        <label>CSS</label>
        <textarea value={css} onChange={(e) => setCss(e.target.value)} placeholder="Ваш CSS код"/>
      </div>
      <div>
        <label>JS</label>
        <textarea value={js} onChange={(e) => setJs(e.target.value)} placeholder="Ваш JS код"/>
      </div>
      <button onClick={saveBlockToDB}>Сохранить</button>

      <h3>Предпросмотр:</h3>
      <div dangerouslySetInnerHTML={{ __html: html }}></div>
    </div>
  );
};

export default BlockEditor;
