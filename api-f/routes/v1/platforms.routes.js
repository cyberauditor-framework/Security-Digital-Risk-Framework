import express from "express";
import * as platformController from "../../controllers/platform.controller.js";

const router = express.Router();

// Rutas de plataformas
router.get("/", platformController.getAllPlatforms);
router.get("/:id", platformController.getPlatformById);
router.get("/:id/techniques", platformController.getPlatformWithTechniques);

export default router;
