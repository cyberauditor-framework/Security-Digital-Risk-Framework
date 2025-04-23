import express from "express";
import * as securityStandardController from "../../controllers/securityStandard.controller.js";

const router = express.Router();

// Rutas de mapeos de estándares de seguridad
router.get("/", securityStandardController.getAllSecurityStandards);
router.get(
	"/:idMitre",
	securityStandardController.getSecurityStandardByMitreId,
);
router.get(
	"/standard/:standard",
	securityStandardController.getSecurityStandardsByStandard,
);
router.get(
	"/control/:controlId",
	securityStandardController.getSecurityStandardsByControlId,
);

export default router;
