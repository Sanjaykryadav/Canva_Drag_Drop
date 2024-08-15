import React, { useState } from "react";
import Draggable from "react-draggable";
import { ResizableBox } from "react-resizable";
import Xarrow from "react-xarrows";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "react-resizable/css/styles.css";
import toast from "react-hot-toast";
const gridSize = 10;

const Canvas = () => {
  const [cards, setCards] = useState([]);
  const [connections, setConnections] = useState([]);
  const [cardToConnect, setCardToConnect] = useState(null);
  const [history, setHistory] = useState([]);
  const [redoHistory, setRedoHistory] = useState([]);
  const [modal, setModal] = useState(false);

  const togglModal = () => {
    setModal(!modal);
  };

  const addCard = (type) => {
    let newCard;
    if (type === "task") {
      newCard = {
        id: `card-${cards.length}`,
        text: "Task: [Add Task]",
        position: { x: 100, y: 100 },
        size: { width: 300, height: 250 },
        type: "task",
        progress: 0,
      };
    } else if (type === "note") {
      newCard = {
        id: `card-${cards.length}`,
        text: "Note: [Add Note]",
        position: { x: 100, y: 100 },
        size: { width: 300, height: 250 },
        type: "note",
      };
    }

    setHistory([...history, cards]);
    setCards([...cards, newCard]);
    toast.success("New Note Created Successfully !!");
  };

  const updateCardPosition = (id, position) => {
    const snappedPosition = {
      x: Math.round(position.x / gridSize) * gridSize,
      y: Math.round(position.y / gridSize) * gridSize,
    };
    setHistory([...history, cards]);
    setCards(
      cards.map((card) =>
        card.id === id ? { ...card, position: snappedPosition } : card
      )
    );
  };

  const updateCardSize = (id, size) => {
    setHistory([...history, cards]);
    setCards(cards.map((card) => (card.id === id ? { ...card, size } : card)));
    toast.success("Size Updated Successfully !!");
  };

  const connectCards = (fromId, toId) => {
    setConnections([...connections, { from: fromId, to: toId }]);
    toast.success("Cards Connected Successfully !!");
  };

  const handleCardClick = (cardId) => {
    if (cardToConnect === null) {
      setCardToConnect(cardId);
    } else {
      connectCards(cardToConnect, cardId);
      setCardToConnect(null);
    }
  };

  const handleCardDoubleClick = (cardId) => {
    const newText = prompt(
      "Edit text:",
      cards.find((card) => card.id === cardId).text
    );
    if (newText !== null) {
      setCards(
        cards.map((card) =>
          card.id === cardId ? { ...card, text: newText } : card
        )
      );
    }
  };

  const updateProgress = (cardId, progress) => {
    setCards(
      cards.map((card) => (card.id === cardId ? { ...card, progress } : card))
    );
  };

  const deleteCard = (cardId) => {
    setHistory([...history, cards]);
    setCards(cards.filter((card) => card.id !== cardId));
    setConnections(
      connections.filter(
        (connection) => connection.from !== cardId && connection.to !== cardId
      )
    );
    toast.error("Note Deleted Successfully !!");
  };

  const undo = () => {
    if (history.length > 0) {
      const previousState = history[history.length - 1];
      setRedoHistory([...redoHistory, cards]);
      setCards(previousState);
      setHistory(history.slice(0, history.length - 1));
    }
  };

  const redo = () => {
    if (redoHistory.length > 0) {
      const nextState = redoHistory[redoHistory.length - 1];
      setHistory([...history, cards]);
      setCards(nextState);
      setRedoHistory(redoHistory.slice(0, redoHistory.length - 1));
    }
  };

  const exportToPDF = () => {
    const canvasElement = document.querySelector(".canvas-container");
    html2canvas(canvasElement).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 0, 0);
      pdf.save("canvas.pdf");
    });
    toast.success("Pdf Downloaded Successfully !!");
  };

  const saveCanvas = () => {
    localStorage.setItem("canvasState", JSON.stringify({ cards, connections }));
    toast.success("Canvas saved to local storage!");
  };

  const loadCanvas = () => {
    const savedState = localStorage.getItem("canvasState");
    if (savedState) {
      const { cards: loadedCards, connections: loadedConnections } =
        JSON.parse(savedState);
      setCards(loadedCards);
      setConnections(loadedConnections);
      toast.success("Canvas loaded from local storage!");
    } else {
      toast.error("No saved canvas found.");
    }
  };

  return (
    <div className="relative h-screen w-screen bg-transparent overflow-scroll canvas-container">
      {/* Buttons */}
      <div className="absolute top-5 left-5 flex w-full justify-around">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:scale-110 transition outline-none hover:bg-blue-400 hover:font-semibold"
          onClick={() => addCard("note")}
        >
          Add Note Card
        </button>
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded hover:scale-110 transition outline-none hover:bg-blue-400 hover:font-semibold"
          onClick={() => addCard("task")}
        >
          Add Task Card
        </button>
        <button
          className="bg-yellow-500 text-white px-4 py-2 rounded hover:scale-110 transition outline-none hover:bg-yellow-400 hover:font-semibold"
          onClick={undo}
        >
          Undo
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded hover:scale-110 transition outline-none hover:bg-green-400 hover:font-semibold"
          onClick={redo}
        >
          Redo
        </button>
        <button
          className="bg-red-500 text-white px-4 py-2 rounded hover:scale-110 transition outline-none hover:bg-red-400 hover:font-semibold"
          onClick={exportToPDF}
        >
          Export to PDF
        </button>
        <button
          className="bg-teal-500 text-white px-4 py-2 rounded hover:scale-110 transition outline-none hover:bg-teal-400 hover:font-semibold"
          onClick={saveCanvas}
        >
          Save Canvas
        </button>
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded hover:scale-110 transition outline-none hover:bg-purple-400 hover:font-semibold"
          onClick={loadCanvas}
        >
          Load Canvas
        </button>
      </div>

      {cards.map((card) => (
        <Draggable
          key={card.id}
          position={card.position}
          onStop={(e, data) =>
            updateCardPosition(card.id, { x: data.x, y: data.y })
          }
        >
          <div
            id={card.id}
            className="absolute"
            style={{ left: card.position.x, top: card.position.y }}
          >
            <ResizableBox
              width={card.size.width}
              height={card.size.height}
              minConstraints={[250, 350]}
              maxConstraints={[400, 300]}
              onResizeStop={(event, { size }) => updateCardSize(card.id, size)}
              className={`bg-white border rounded shadow-lg p-4 m-4 cursor-pointer ${
                cardToConnect === card.id ? "border-blue-800" : ""
              }`}
              resizeHandles={["se"]}
              onDoubleClick={() => handleCardDoubleClick(card.id)}
            >
              <div className="overflow-hidden flex-col">
                <p className="truncate">{card.text.slice(0, 50)}</p>
                {card.type === "task" && (
                  <div class="bg-white rounded shadow-md p-4 mb-4 w-64">
                    <label class="block font-bold mb-2">
                      Progress: {card.progress}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={card.progress}
                      onChange={(e) => updateProgress(card.id, e.target.value)}
                      class="h-4 mb-4 w-[90%] accent-green-500 outline-none"
                    />
                  </div>
                )}
                <div className="flex w-[80%] justify-evenly absolute bottom-0">
                  {/* Delete */}
                  <button
                    className="outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      togglModal();
                    }}
                  >
                    <lord-icon
                      src="https://cdn.lordicon.com/skkahier.json"
                      trigger="hover"
                      className="h-[100px] w-[150px]"
                    ></lord-icon>
                  </button>
                  <div
                    className={`${
                      modal ? "flex-col" : "hidden"
                    } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full`}
                  >
                    <div className="relative p-4 w-full max-w-md max-h-full">
                      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            togglModal();
                          }}
                          className="outline-none absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          <svg
                            className="w-3 h-3"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 14 14"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                            />
                          </svg>
                          <span className="sr-only">Close modal</span>
                        </button>
                        <div className="p-4 md:p-5 text-center">
                          <svg
                            className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 20"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
                            Are you sure you want to delete this note ?
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglModal();
                              deleteCard(card.id);
                            }}
                            type="button"
                            className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center"
                          >
                            Yes, I'm sure
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              togglModal();
                            }}
                            type="button"
                            className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                          >
                            No, cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    className="text-blue-500 ml-2 flex-col outline-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCardClick(card.id);
                    }}
                  >
                    <lord-icon
                      src="https://cdn.lordicon.com/qnpnzlkk.json"
                      trigger="hover"
                      className="h-[100px] w-[150px] outline-none"
                    ></lord-icon>
                    <div>
                      {cardToConnect === card.id
                        ? "Cancel Connection"
                        : "Connect"}
                    </div>
                  </button>
                </div>
              </div>
            </ResizableBox>
          </div>
        </Draggable>
      ))}

      {connections.map((connection, index) => (
        <Xarrow
          key={index}
          start={connection.from}
          end={connection.to}
          color="white"
          strokeWidth={3}
          path="smooth"
          dashness
          zIndex={0}
        />
      ))}
    </div>
  );
};

export default Canvas;