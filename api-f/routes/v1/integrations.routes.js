import express from "express";
import * as integrationController from "../../controllers/integration.controller.js";

const router = express.Router();

// Rutas de integraciones
router.get("/", integrationController.getAllIntegrations);
router.get("/:id", integrationController.getIntegrationById);
router.get(
	"/:id/detections",
	integrationController.getIntegrationWithDetections,
);

export default router;
