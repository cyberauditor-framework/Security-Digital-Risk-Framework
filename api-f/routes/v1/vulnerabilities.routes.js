import express from "express";
import * as vulnerabilityController from "../../controllers/vulnerability.controller.js";

const router = express.Router();

// Rutas de vulnerabilidades
router.get("/", vulnerabilityController.getAllVulnerabilities);
router.get("/:id", vulnerabilityController.getVulnerabilityById);
router.get("/cve/:cveId", vulnerabilityController.getVulnerabilityByCveId);
router.get(
	"/:id/campaigns",
	vulnerabilityController.getVulnerabilityWithCampaigns,
);

export default router;
