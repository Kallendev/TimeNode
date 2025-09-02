import express from "express";
import {
  createTask,
  getAllTasks,
  getUserTasks,
  updateTaskStatus,
} from "../controller/taskController.js";

const router = express.Router();

// Admin: Create Task
router.post("/", createTask);

// Admin: Get All Tasks
router.get("/", getAllTasks);

// Employee: Get Own Tasks
router.get("/user/:userId", getUserTasks);

// Employee/Admin: Update Task Status
router.patch("/:taskId/status", updateTaskStatus);

export default router;
