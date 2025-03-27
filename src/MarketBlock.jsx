import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Creating.css";
import "./css/MarketBlocks.css"; // стили для карточек и пагинации
import search from "../public/search.png";
import more from "../public/more.png";
import Sidebar from "./for_BlockEditor/Sidebar";
import BlockDetailsModal from "./forMarket/BlockDetailsModal";

const MarketBlocks = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Шаг пагинации = 15

  // Дополнительные состояния для всплывающего меню и модального окна деталей блока
  const [showMoreOptionsId, setShowMoreOptionsId] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Проверка авторизации
  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Ошибка проверки авторизации:", error);
        navigate("/");
      });
  }, [navigate]);

  // Загрузка опубликованных блоков
  useEffect(() => {
    fetch("http://localhost:3002/api/published-blocks", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка загрузки: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setBlocks(data);
      })
      .catch((error) => {
        console.error("Ошибка загрузки:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  // Фильтрация по поиску
  const filteredBlocks = blocks.filter((block) =>
    block.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Пагинация
  const totalPages = Math.ceil(filteredBlocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const blocksToShow = filteredBlocks.slice(startIndex, endIndex);

  // Преобразуем preview из базы в dataURL
  const getPreviewUrl = (block) => {
    if (!block.preview?.data) return "";
    const uintArray = new Uint8Array(block.preview.data.data);
    let binary = "";
    uintArray.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    const base64String = window.btoa(binary);
    return `data:${block.preview.contentType};base64,${base64String}`;
  };

  // Обработчик клика по карточке — открывает модальное окно с подробной информацией
  const handleCardClick = (block) => {
    setSelectedBlock(block);
    setShowDetailsModal(true);
  };

  // Обработчик клика на иконку "more" (не должно запускать открытие карточки)
  const handleMoreIconClick = (e, block) => {
    e.stopPropagation();
    setShowMoreOptionsId(block._id);
  };

  // Функции для выпадающего меню
  const handleAddBlock = (block) => {
    fetch("http://localhost:3002/api/add-block-to-collection", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ blockId: block._id }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка добавления блока");
        return res.json();
      })
      .then(() => {
        alert(`Блок "${block.name}" добавлен в вашу коллекцию!`);
      })
      .catch((err) => {
        console.error("Ошибка добавления блока:", err);
        alert("Ошибка добавления блока: " + err.message);
      });
  };

  const handleViewCode = (block) => {
    navigate(`/block/${block._id}`);
  };

  const handleReport = (block) => {
    alert(`Жалоба на блок "${block.name}" отправлена.`);
  };

  // Переключение страниц
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };
  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div className="all_cr">
      <Sidebar user={user} />
      <div className="right_cr">
        <div className="right_top_cr mmm">
          <p className="zag">Маркет блоков</p>
          <div className="search">
            <input
              type="text"
              placeholder="Поиск по названию"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img src={search} alt="Поиск" />
          </div>
        </div>
        <div className="right_bottom_cr">
          <div className="market-blocks-container">
            {blocksToShow.length > 0 ? (
              blocksToShow.map((block) => {
                const previewUrl = getPreviewUrl(block);
                return (
                  <div
                    key={block._id}
                    className="market-block-card"
                    onClick={() => handleCardClick(block)}
                  >
                    <div
                      className="market-block-image"
                      style={{ backgroundImage: `url(${previewUrl})` }}
                    />
                    <div
                      className="more-icon-container"
                      onMouseEnter={() => setShowMoreOptionsId(block._id)}
                      onMouseLeave={() => setShowMoreOptionsId(null)}
                      onClick={(e) => handleMoreIconClick(e, block)}
                    >
                      <img src={more} alt="more" className="more" />
                      {showMoreOptionsId === block._id && (
                        <div className="more-options">
                          <button onClick={() => handleAddBlock(block)}>Добавить</button>
                          <button onClick={() => handleViewCode(block)}>Просмотреть код</button>
                          <button onClick={() => handleReport(block)}>Пожаловаться</button>
                        </div>
                      )}
                    </div>
                    <p className="market-block-name">{block.name}</p>
                  </div>
                );
              })
            ) : (
              <p>Нет опубликованных блоков</p>
            )}
          </div>

          <div className="pagination">
            <button onClick={handlePrevPage} disabled={currentPage === 1}>
              Назад
            </button>
            <span>
              Страница {currentPage} из {totalPages}
            </span>
            <button onClick={handleNextPage} disabled={currentPage === totalPages}>
              Далее
            </button>
          </div>
        </div>
      </div>
      {showDetailsModal && selectedBlock && (
        <BlockDetailsModal
          block={selectedBlock}
          onClose={() => setShowDetailsModal(false)}
          onViewCode={() => handleViewCode(selectedBlock)}
          onAdd={() => handleAddBlock(selectedBlock)}
        />
      )}
    </div>
  );
};

export default MarketBlocks;
