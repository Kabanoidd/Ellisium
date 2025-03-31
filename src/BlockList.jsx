import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Creating.css";
import "./css/MarketBlocks.css"; // стили для карточек и пагинации
import search from "../public/search.png";
import Sidebar from "./for_BlockEditor/Sidebar";
import BlockDetailsModal from "./forMarket/BlockDetailsModal";

const BlockList = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Данные авторизованного пользователя
  const [blocks, setBlocks] = useState([]); // Все блоки из БД
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "mine", "added"
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15; // Шаг пагинации = 15

  // Состояния для модального окна деталей блока
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState(null);

  // Получаем данные пользователя
  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          navigate("/");
        }
      })
      .catch((error) => {
        console.error("Ошибка проверки авторизации:", error);
        navigate("/");
      })
      .finally(() => setLoadingUser(false));
  }, [navigate]);

  // Загружаем все блоки
  useEffect(() => {
    fetch("http://localhost:3002/api/blocks", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const blocksArray = Array.isArray(data) ? data : [];
        setBlocks(blocksArray);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке блоков:", error);
      })
      .finally(() => setLoadingBlocks(false));
  }, []);

  if (loadingUser || loadingBlocks) return <p>Загрузка...</p>;
  if (!user) return <p>Ошибка: пользователь не найден</p>;

  // Фильтрация по поисковой строке
  const filteredBlocks = blocks.filter((block) =>
    block.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Для сравнения ID используем user._id или user.id
  const currentUserId = user._id || user.id;

  // "Мои блоки": блоки, созданные пользователем
  const myBlocks = filteredBlocks.filter(
    (block) => String(block.userId) === String(currentUserId)
  );

  // "Добавленные блоки": блоки, ID которых содержатся в user.collection
  const userCollection = user.collection && Array.isArray(user.collection)
    ? user.collection
    : [];
  const addedBlocks = filteredBlocks.filter((block) =>
    userCollection.some((blockId) => String(blockId) === String(block._id))
  );

  // "Все" блоки: объединяем "Мои" и "Добавленные" без дубликатов
  const allBlocks = [
    ...myBlocks,
    ...addedBlocks.filter(
      (block) =>
        !myBlocks.some(
          (myBlock) => String(myBlock._id) === String(block._id)
        )
    ),
  ];

  let displayedBlocks = [];
  if (activeTab === "mine") {
    displayedBlocks = myBlocks;
  } else if (activeTab === "added") {
    displayedBlocks = addedBlocks;
  } else {
    displayedBlocks = allBlocks;
  }

  // Пагинация
  const totalPages = Math.ceil(displayedBlocks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBlocks = displayedBlocks.slice(startIndex, endIndex);

  // Обработчик клика по карточке — открывает модальное окно с деталями блока
  const openDetailsModal = (block) => {
    setSelectedBlock(block);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedBlock(null);
  };

  // Функция для публикации блока
  const handlePublish = () => {
    if (!selectedBlock || !selectedBlock._id) return;
    fetch(`http://localhost:3002/api/blocks/${selectedBlock._id}/publish`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка публикации блока");
        return res.json();
      })
      .then((data) => {
        setBlocks((prev) =>
          prev.map((b) =>
            String(b._id) === String(selectedBlock._id)
              ? { ...b, published: true }
              : b
          )
        );
        closeModal();
      })
      .catch((err) => {
        console.error("Ошибка публикации блока:", err);
        alert("Ошибка публикации блока: " + err.message);
      });
  };

  // Функция для удаления блока
  const handleDelete = () => {
    if (!selectedBlock) return;
    fetch(`http://localhost:3002/api/blocks/${selectedBlock._id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка удаления блока");
        return res.json();
      })
      .then(() => {
        setBlocks((prev) =>
          prev.filter((b) => String(b._id) !== String(selectedBlock._id))
        );
        closeModal();
      })
      .catch((err) => {
        console.error("Ошибка удаления блока:", err);
        alert("Ошибка удаления блока: " + err.message);
      });
  };

  return (
    <div className="all_cr">
      <Sidebar user={user} />
      <div className="right_cr">
        <div className="right_top_cr mmm">
          <p className="zag">Мои компоненты</p>
          <div className="search">
            <input
              type="text"
              placeholder="Поиск по названию"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <img src={search} alt="Поиск" />
          </div>
          <div className="anav">
            <ul>
              <li onClick={() => setActiveTab("all")} className={activeTab === "all" ? "active" : ""}>
                Все
              </li>
              <li onClick={() => setActiveTab("mine")} className={activeTab === "mine" ? "active" : ""}>
                Мои блоки
              </li>
              <li onClick={() => setActiveTab("added")} className={activeTab === "added" ? "active" : ""}>
                Добавленные блоки
              </li>
            </ul>
          </div>
        </div>
        <div className="right_bottom_cr">
          <div className="market-blocks-container">
            {paginatedBlocks.length > 0 ? (
              paginatedBlocks.map((block) => {
                const previewUrl = block.preview?.data
                  ? `data:${block.preview.contentType};base64,${btoa(
                      new Uint8Array(block.preview.data.data).reduce(
                        (data, byte) => data + String.fromCharCode(byte),
                        ""
                      )
                    )}`
                  : "";
                return (
                  <div
                    key={block._id}
                    className="market-block-card"
                    onClick={() => openDetailsModal(block)}
                  >
                    <div
                      className="market-block-image"
                      style={{ backgroundImage: `url(${previewUrl})` }}
                    />
                    <p className="market-block-name">{block.name}</p>
                  </div>
                );
              })
            ) : (
              <p>Нет блоков для отображения</p>
            )}
          </div>
          <div className="pagination">
            <button onClick={() => setCurrentPage((prev) => prev - 1)} disabled={currentPage === 1}>
              Назад
            </button>
            <span>
              Страница {currentPage} из {totalPages}
            </span>
            <button onClick={() => setCurrentPage((prev) => prev + 1)} disabled={currentPage === totalPages}>
              Далее
            </button>
          </div>
        </div>
      </div>
      {modalVisible && selectedBlock && (
  <BlockDetailsModal
    block={selectedBlock}
    onClose={closeModal}
    onPublish={() => handlePublish(selectedBlock)}
    onDelete={() => handleDelete(selectedBlock)}
    context="BlockList"
  />
)}
    </div>
  );
};

export default BlockList;
