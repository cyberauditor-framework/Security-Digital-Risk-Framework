import express from "express";
import * as techniqueController from "../../controllers/technique.controller.js";

const router = express.Router();

// Rutas de técnicas
router.get("/", techniqueController.getAllTechniques);
router.get("/:mitreId", techniqueController.getTechniqueByMitreId);
router.get("/:mitreId/tactics", techniqueController.getTechniqueWithTactics);
router.get(
	"/:mitreId/detections",
	techniqueController.getTechniqueWithDetections,
);
router.get(
	"/:mitreId/platforms",
	techniqueController.getTechniqueWithPlatforms,
);
router.get("/:mitreId/software", techniqueController.getTechniqueWithSoftware);
router.get(
	"/:mitreId/threat-groups",
	techniqueController.getTechniqueWithThreatGroups,
);

export default router;
