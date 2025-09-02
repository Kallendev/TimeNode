import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Create Task
export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, userId, projectId, source } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
        projectId,
        source: source || 'ADMIN',
      },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to create task", details: err.message });
  }
};

// Get All Tasks (Admin)
export const getAllTasks = async (req, res) => {
  try {
    const { source } = req.query;
    const tasks = await prisma.task.findMany({
      where: source ? { source } : undefined,
      include: { assignedTo: true, project: true },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
};

// Get Tasks for Employee
export const getUserTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const tasks = await prisma.task.findMany({
      where: { userId },
      include: { project: true },
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user tasks" });
  }
};

// Update Task Status
export const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status },
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: "Failed to update task" });
  }
};
