import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const initialTasks = {
  Pending: [],
  InProgress: [],
  Done: [],
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem("tasks");
    return savedTasks ? JSON.parse(savedTasks) : initialTasks;
  });

  const [editingTask, setEditingTask] = useState({ status: null, index: null });

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const handleDelete = (status, index) => {
    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      updatedTasks[status].splice(index, 1);
      return updatedTasks;
    });
  };

  const handleEditChange = (status, index, value) => {
    setTasks((prevTasks) => {
      const updatedTasks = [...prevTasks[status]];
      updatedTasks[index] = value;
      return { ...prevTasks, [status]: updatedTasks };
    });
  };

  const handleAddTask = (status) => {
    const newTask = `New Task ${tasks[status].length + 1}`;
    setTasks((prevTasks) => ({
      ...prevTasks,
      [status]: [...prevTasks[status], newTask],
    }));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const sourceStatus = source.droppableId;
    const destinationStatus = destination.droppableId;

    if (sourceStatus === destinationStatus) {
      const updatedTasks = Array.from(tasks[sourceStatus]);
      const [movedTask] = updatedTasks.splice(source.index, 1);
      updatedTasks.splice(destination.index, 0, movedTask);
      setTasks((prevTasks) => ({
        ...prevTasks,
        [sourceStatus]: updatedTasks,
      }));
    } else {
      const sourceTasks = Array.from(tasks[sourceStatus]);
      const destinationTasks = Array.from(tasks[destinationStatus]);

      const [movedTask] = sourceTasks.splice(source.index, 1);
      destinationTasks.push(movedTask);

      setTasks((prevTasks) => ({
        ...prevTasks,
        [sourceStatus]: sourceTasks,
        [destinationStatus]: destinationTasks,
      }));
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="text-center" style={{ color: "#b300b3" }}>
        Kanban Board
      </h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="row mt-5">
          {Object.entries(tasks).map(([status, items]) => (
            <div key={status} className="col-md-4 mb-4">
              <div className="kanban-column">
                <div className="add-task" onClick={() => handleAddTask(status)}>
                  +
                </div>
                <div className={`kanban-header ${status}`}>
                  {status.toUpperCase()}
                </div>
                <Droppable droppableId={status}>
                  {(provided) => (
                    <div
                      className="kanban-body"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      style={{
                        minHeight: "100px",
                        padding: "10px",
                        backgroundColor: "#f4f4f4",
                        borderRadius: "5px",
                      }}
                    >
                      {items.map((task, index) => (
                        <Draggable
                          key={`${status}-${index}`}
                          draggableId={`${status}-${index}`}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`task-card ${status}`}
                              style={{
                                ...provided.draggableProps.style,
                                padding: "10px 15px",
                                marginBottom: "8px",
                                borderRadius: "5px",
                                boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
                                minHeight: "50px",
                                maxHeight:"120px",
                                wordBreak: "break-word",
                                whiteSpace: "pre-wrap",
                                overflowY:
                                  "auto" ,
                                scrollbarWidth:
                                  "thin",
                                scrollbarColor:
                                  "#ccc transparent" ,
                              }}
                            >
                              {editingTask.status === status &&
                              editingTask.index === index ? (
                                <input
                                  type="text"
                                  value={task}
                                  onChange={(e) =>
                                    handleEditChange(
                                      status,
                                      index,
                                      e.target.value
                                    )
                                  }
                                  onBlur={() =>
                                    setEditingTask({
                                      status: null,
                                      index: null,
                                    })
                                  }
                                  autoFocus
                                  style={{
                                    backgroundColor: "transparent",
                                    border: "none",
                                    outline: "none",
                                    color: "#000",
                                    height: "25px",
                                    whiteSpace: "pre-wrap",
                                    wordBreak: "break-word",
                                    overflow: "auto",
                                    textAlign: "justify",
                                  }}
                                />
                              ) : (
                                <span style={{ maxWidth: "85%" }}>{task}</span>
                              )}
                              <div className="task-icons">
                                <i
                                  className="bi bi-pencil text-dark fw-bolder mx-1"
                                  style={{ cursor: "pointer" }}
                                  onClick={() =>
                                    setEditingTask({ status, index })
                                  }
                                ></i>
                                <i
                                  className="bi bi-trash text-dark fw-bolder mx-1"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleDelete(status, index)}
                                ></i>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;
