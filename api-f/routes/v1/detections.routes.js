import express from "express";
import * as detectionController from "../../controllers/detection.controller.js";

const router = express.Router();

// Rutas de detecciones
router.get("/", detectionController.getAllDetections);
router.get("/:id", detectionController.getDetectionById);
router.get("/:id/techniques", detectionController.getDetectionWithTechniques);
router.get("/:id/software", detectionController.getDetectionWithSoftware);
router.get(
	"/:id/threat-groups",
	detectionController.getDetectionWithThreatGroups,
);

export default router;
