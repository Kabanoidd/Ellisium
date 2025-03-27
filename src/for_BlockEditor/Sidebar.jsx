import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import hm from "../../public/home.png";
import prof from "../../public/profile.png";
import market from "../../public/market.png";
import plus from "../../public/plus.png";
import list from "../../public/list.png";
import bl from "../../public/my_bl.png";
import "../css/Creating.css";
import AvailableBlocks from "./AvailableBlocks";

const Sidebar = ({ user, onBlockSelect }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: "/glob", label: "Мои проекты", icon: list },
    { path: "/bl", label: "Мои компоненты", icon: bl },
    { path: "/ren", label: "Создать проект", icon: plus },
    { path: "/market", label: "Маркет", icon: market },
    { path: "/", label: "На главную", icon: hm },
  ];

  // Локальное состояние для доступных блоков
  const [availableBlocks, setAvailableBlocks] = useState([]);

  useEffect(() => {
    // Если пользователь находится на странице /ren, загружаем список блоков
    if (location.pathname === "/ren") {
      fetch("http://localhost:3002/api/blocks", { credentials: "include" })
        .then((res) => res.json())
        .then((data) => {
          setAvailableBlocks(Array.isArray(data) ? data : []);
        })
        .catch((error) => console.error("Ошибка загрузки блоков:", error));
    }
  }, [location.pathname]);

  return (
    <div className="left_cr">
      <div className="user_data" onClick={() => navigate("/acc")}>
        <img
          src={user?.profilePicture ? `http://localhost:3002${user.profilePicture}` : prof}
          alt="user"
          className="user_img"
        />
        <p className="user_name">{user?.name || "Гость"}</p>
      </div>
      <ul className="ul_for_cr for_crr">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <li
              key={item.path}
              onClick={() => navigate(item.path)}
              className={isActive ? "active" : ""}
            >
              <img src={item.icon} alt={item.label} />
              <p>{item.label}</p>
            </li>
          );
        })}
      </ul>
      {location.pathname === "/ren" && (
        <AvailableBlocks blocks={availableBlocks} onBlockSelect={onBlockSelect} />
      )}
    </div>
  );
};

export default Sidebar;
