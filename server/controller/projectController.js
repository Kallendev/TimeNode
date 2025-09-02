import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const createProject = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    const project = await prisma.project.create({
      data: { name, description: description || null, status },
    });
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to create project", details: err.message });
  }
};

export const getAllProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({ include: { tasks: true } });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch projects" });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    // Projects that have at least one task assigned to this user
    const projects = await prisma.project.findMany({
      where: { tasks: { some: { userId } } },
      include: { tasks: true },
    });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user projects" });
  }
};

export const updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status },
    });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: "Failed to update project" });
  }
};


