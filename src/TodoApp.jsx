import React, { useState, useEffect, useRef, useCallback } from "react";
import { Snackbar, Button, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import deleteSound from './assets/deletion.mp3';
import undoSound from './assets/undo.mp3';
import './TodoApp.css';

const TodoApp = () => {
  const [tasks, setTasks] = useState(["Task 1", "Task 2", "Task 3"]); // Holds the list of tasks
  const [deletedTasks, setDeletedTasks] = useState([]); // Tracks deleted tasks for undo
  const [snackbarOpen, setSnackbarOpen] = useState({}); // Manages Snackbar visibility for tasks
  const [actionMessage, setActionMessage] = useState(""); // Stores action message for Snackbar


  const deleteSoundRef = useRef(new Audio(deleteSound)); // Separate sound ref for deletion
  const undoSoundRef = useRef(new Audio(undoSound));  // Separate sound ref for undo

  const SNACKBAR_DURATION = 5000; // Set duration for Snackbar

  // Function to play a given sound reference
  const playSound = (soundRef) => {
    soundRef.current.currentTime = 0; // Reset the sound to the beginning
    soundRef.current.play(); // Play the sound
  };

  const deleteTask = (index) => {
    const task = tasks[index]; // Get the task to be deleted
    setTasks(tasks.filter((_, i) => i !== index)); // Remove the task from the tasks list
    setDeletedTasks((prev) => [...prev, { task, index, key: Date.now() }]); // Save the deleted task for undo
    setSnackbarOpen((prev) => ({ ...prev, [task]: true })); // Open Snackbar for the deleted task
    playSound(deleteSoundRef); // Play sound effect for deletion action
  };

  const undoDelete = useCallback(({ task, index }) => {
    setTasks(prev => [...prev.slice(0, index), task, ...prev.slice(index)]); // Restore task
    setDeletedTasks(prev => prev.filter(t => t.index !== index)); // Remove it from deletedTasks
    setActionMessage(`Restored: ${task}`); // Set message
    setSnackbarOpen(prev => ({ ...prev, [task]: false })); // Close snackbar
    playSound(undoSoundRef); // Play undo sound
  }, []);


  const closeSnackbar = (task) =>
    setSnackbarOpen((prev) => ({ ...prev, [task]: false })); // Close the snackbar for the specified task

  const closeActionMessageSnackbar = () =>
    setActionMessage(""); // Clear the action message for feedback


  useEffect(() => {
    // Function to handle keydown events
    const handleKeyDown = (event) => {
      // Check if Ctrl + Z is pressed and there are deleted tasks
      if (event.ctrlKey && event.key === 'z' && deletedTasks.length) {
        event.preventDefault(); // Prevent default behavior (like scrolling)
        undoDelete(deletedTasks.at(-1)); // Undo the last deleted task using at() for clarity
      }
    };

    // Add the event listener for keydown events
    window.addEventListener('keydown', handleKeyDown);

    // Clean up the event listener on component unmount
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletedTasks, undoDelete]); // Dependency array: runs effect when deletedTasks changes


  return (
    <div className="todo-app-container">
      <h1>To-Do List</h1>
      <ul>
        {tasks.map((task, index) => (
          <li key={index}>
            <span className="todo-app-task">{task}</span>
            <Button className="todo-app-delete-btn" onClick={() => deleteTask(index)}>
              Delete
            </Button>
          </li>
        ))}
      </ul>

      {deletedTasks.map((deletedTask, index) => (
        <Snackbar
          key={deletedTask.key} // Unique key for each Snackbar
          open={snackbarOpen[deletedTask.task]} // Control open state of Snackbar
          message={`Deleted: ${deletedTask.task}`}
          action={
            <>
              <Button className="todo-app-undo-btn" color="secondary" size="small" onClick={() => undoDelete(deletedTask)}>
                UNDO
              </Button>
              <IconButton className="todo-app-close-btn" size="small" color="inherit" onClick={() => closeSnackbar(deletedTask.task)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </>
          }
          autoHideDuration={SNACKBAR_DURATION} // Snackbar duration
          onClose={() => closeSnackbar(deletedTask.task)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        />
      ))}

      {/* Snackbar for action messages like "Restored" */}
      <Snackbar
        open={!!actionMessage}
        message={actionMessage}
        action={
          <IconButton className="todo-app-close-action-btn" size="small" color="inherit" onClick={closeActionMessageSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
        autoHideDuration={5000}
        onClose={closeActionMessageSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </div>
  );

};

export default TodoApp;