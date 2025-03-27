import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./css/Creating.css";

// Импорт изображений и компонентов
import search from "../public/search.png";
import pub from "../public/public.png";
import trash from "../public/trash.png";
import BlockSandbox from "./forRender/BlockSandbox";
import Sidebar from "./for_BlockEditor/Sidebar";

const BlockList = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // Данные авторизованного пользователя
  const [blocks, setBlocks] = useState([]); // Все блоки из БД
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "mine", "added"

  // Состояния для модального окна подтверждения
  const [modalVisible, setModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState(""); // "delete" или "publish"
  const [currentBlock, setCurrentBlock] = useState(null);

  // Получаем данные пользователя
  useEffect(() => {
    fetch("http://localhost:3002/api/me", { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Данные пользователя:", data);
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
        console.log("Загруженные блоки:", blocksArray);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке блоков:", error);
      })
      .finally(() => setLoadingBlocks(false));
  }, []);

  if (loadingUser || loadingBlocks) return <p>Загрузка...</p>;
  if (!user) return <p>Ошибка: пользователь не найден</p>;

  // Фильтруем блоки по поисковой строке
  const filteredBlocks = blocks.filter((block) =>
    block.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  console.log("Отфильтрованные блоки:", filteredBlocks);

  // Для сравнения ID используем user._id или user.id
  const currentUserId = user._id || user.id;
  console.log("User ID для сравнения:", currentUserId);

  // "Мои блоки": блоки, созданные пользователем
  const myBlocks = filteredBlocks.filter(
    (block) => String(block.userId) === String(currentUserId)
  );
  console.log("Мои блоки:", myBlocks);

  // "Добавленные блоки": блоки, ID которых содержится в user.collection
  const userCollection = user.collection && Array.isArray(user.collection)
    ? user.collection
    : [];
    const addedBlocks = filteredBlocks.filter((block) =>
        userCollection.some(
          (blockId) => String(blockId) === String(block._id)
        )
      );
  console.log("Добавленные блоки:", addedBlocks);

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
  console.log("Все доступные блоки:", allBlocks);

  let displayedBlocks = [];
  if (activeTab === "mine") {
    displayedBlocks = myBlocks;
  } else if (activeTab === "added") {
    displayedBlocks = addedBlocks;
  } else {
    displayedBlocks = allBlocks;
  }
  console.log("Отображаемые блоки:", displayedBlocks);

  // Функция открытия модального окна для подтверждения действия
  const openModal = (action, block) => {
    setModalAction(action);
    setCurrentBlock(block);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setModalAction("");
    setCurrentBlock(null);
  };

  // Функция для удаления блока
  const handleDelete = () => {
    if (!currentBlock) return;
    fetch(`http://localhost:3002/api/blocks/${currentBlock._id}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка удаления блока");
        return res.json();
      })
      .then(() => {
        alert("Блок удалён!");
        setBlocks((prev) =>
          prev.filter((b) => String(b._id) !== String(currentBlock._id))
        );
        closeModal();
      })
      .catch((err) => {
        console.error("Ошибка удаления блока:", err);
        alert("Ошибка удаления блока: " + err.message);
      });
  };

  // Функция для публикации блока
  const handlePublish = () => {
    if (!currentBlock || !currentBlock._id) {
      console.error("Ошибка: блок не выбран или не имеет ID");
      return;
    }
    const url = `http://localhost:3002/api/blocks/${currentBlock._id}/publish`;
    console.log("Отправка запроса на публикацию блока с ID:", currentBlock._id);

    fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          console.error(`Ошибка сервера ${res.status}: ${res.statusText}`);
          throw new Error("Ошибка публикации блока");
        }
        return res.json();
      })
      .then((data) => {
        console.log("Успешно опубликовано:", data);
        setBlocks((prev) =>
          prev.map((b) =>
            String(b._id) === String(currentBlock._id)
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

  return (
    <div className="all_cr">
      {/* Левая колонка: пользовательские данные и навигация */}
      <Sidebar user={user} />
      {/* Правая колонка: список блоков и фильтрация */}
      <div className="right_cr">
        <div className="right_top_cr">
          <p className="zag">Мои компоненты</p>
          <div className="for_bl">
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
              <li
                onClick={() => setActiveTab("all")}
                className={activeTab === "all" ? "active" : ""}
              >
                Все
              </li>
              <li
                onClick={() => setActiveTab("mine")}
                className={activeTab === "mine" ? "active" : ""}
              >
                Мои блоки
              </li>
              <li
                onClick={() => setActiveTab("added")}
                className={activeTab === "added" ? "active" : ""}
              >
                Добавленные блоки
              </li>
            </ul>
          </div>
          </div>
        </div>
        <div className="right_bottom_cr">
          <div className="mblocks">
            {displayedBlocks.length > 0 ? (
              displayedBlocks.map((block) => (
                <div key={block._id} className="block-preview">
                  <div className="block_nav">
                    <p>{block.name}</p>
                    <div className="block_control">
                      <div className="tooltip-container">
                        <img
                          src={pub}
                          alt="Опубликовать"
                          onClick={() => openModal("publish", block)}
                        />
                        <span className="tooltip">Опубликовать</span>
                      </div>
                      <div className="tooltip-container">
                        <img
                          src={trash}
                          alt="Удалить"
                          onClick={() => openModal("delete", block)}
                        />
                        <span className="tooltip">Удалить</span>
                      </div>
                    </div>
                  </div>
                  <BlockSandbox
                    html={block.structure}
                    css={block.styles}
                    js={block.script}
                  />
                </div>
              ))
            ) : (
              <p>Нет блоков для отображения</p>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения */}
      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            {modalAction === "delete" && (
              <p>Вы действительно хотите удалить этот блок?</p>
            )}
            {modalAction === "publish" && (
              <p>Вы действительно хотите опубликовать этот блок?</p>
            )}
            <div className="modal-buttons">
              <button
                onClick={() =>
                  modalAction === "delete" ? handleDelete() : handlePublish()
                }
              >
                Да
              </button>
              <button onClick={closeModal}>Нет</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlockList;
