import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./register"; // Импортируем компонент регистрации
import Login from "./login"; // Импортируем компонент авторизации


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Register />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;