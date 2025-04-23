import express from "express";
import * as campaignController from "../../controllers/campaign.controller.js";

const router = express.Router();

// Rutas de campañas
router.get("/", campaignController.getAllCampaigns);
router.get("/:id", campaignController.getCampaignById);
router.get("/:id/techniques", campaignController.getCampaignWithTechniques);
router.get("/:id/software", campaignController.getCampaignWithSoftware);
router.get(
	"/:id/threat-groups",
	campaignController.getCampaignWithThreatGroups,
);
router.get(
	"/:id/vulnerabilities",
	campaignController.getCampaignWithVulnerabilities,
);

export default router;
