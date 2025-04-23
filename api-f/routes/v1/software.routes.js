import express from "express";
import * as softwareController from "../../controllers/software.controller.js";

const router = express.Router();

// Rutas de software
router.get("/", softwareController.getAllSoftware);
router.get("/:id", softwareController.getSoftwareById);
router.get("/:id/techniques", softwareController.getSoftwareWithTechniques);
router.get("/:id/campaigns", softwareController.getSoftwareWithCampaigns);

export default router;
