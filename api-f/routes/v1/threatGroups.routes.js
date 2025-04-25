import express from "express";
import * as threatGroupController from "../../controllers/threatGroup.controller.js";

const router = express.Router();

// Rutas de grupos de amenazas
router.get("/", threatGroupController.getAllThreatGroups);
router.get("/:id", threatGroupController.getThreatGroupById);
router.get(
	"/:id/techniques",
	threatGroupController.getThreatGroupWithTechniques,
);
router.get("/:id/campaigns", threatGroupController.getThreatGroupWithCampaigns);

export default router;
