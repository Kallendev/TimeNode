import express from "express";
import {
  createProject,
  getAllProjects,
  getUserProjects,
  updateProjectStatus,
} from "../controller/projectController.js";

const router = express.Router();

// Admin: Create Project
router.post("/", createProject);

// Admin: Get All Projects
router.get("/", getAllProjects);

// Employee: Get Own Projects (by user via assigned tasks)
router.get("/user/:userId", getUserProjects);

// Admin: Update Project Status
router.patch("/:projectId/status", updateProjectStatus);

export default router;


