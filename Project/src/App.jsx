import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./register"; // Импортируем компонент регистрации
import Login from "./login"; // Импортируем компонент авторизации
import Index from "./index"; 
import Acc from "./account"; 
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/me", { credentials: "include" }) // Отправляем куки
      .then((res) => res.json())
      .then((data) => {
        console.log("Проверка авторизации:", data);
        if (data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch((error) => {
        console.error("Ошибка проверки авторизации:", error);
        setUser(null);
      });
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Index />} />
          <Route path="/acc" element={<Acc />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
