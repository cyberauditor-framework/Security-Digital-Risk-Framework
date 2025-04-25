import express from "express";
import * as tacticController from "../../controllers/tactic.controller.js";

const router = express.Router();

// Rutas de tácticas
router.get("/", tacticController.getAllTactics);
router.get("/:mitreId", tacticController.getTacticByMitreId);
router.get("/:mitreId/techniques", tacticController.getTacticWithTechniques);

export default router;
