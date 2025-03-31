import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./register"; // Импортируем компонент регистрации
import Login from "./login"; // Импортируем компонент авторизации
import Index from "./index"; 
import Acc from "./account"; 
import BlockEditor from "./create";
import BlockViewer from "./BlockConstructorPage";
import GlobalCreating from "./GlobalCreate";
import PreviewPage from "./forRender/PreviewPage";
import ProjectEditor from "./forRender/ProjectEditor";
import BlockList from "./BlockList";
import MarketBlocks from "./MarketBlock";
import ViewBlock from "./ViewBlock";
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" }) // Отправляем куки
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
          <Route path="/create" element={<BlockEditor />} />
          <Route path="/ren" element={<BlockViewer />} />
          <Route path="/glob" element={<GlobalCreating />} />
          <Route path="/prev" element={<PreviewPage />} />
          <Route path="/project-edit/:id" element={<ProjectEditor />} />
          <Route path="/bl" element={<BlockList />} />
          <Route path="/market" element={<MarketBlocks />} />
          <Route path="/view-block/:id" element={<ViewBlock />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
