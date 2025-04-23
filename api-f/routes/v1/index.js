import express from "express";
import techniquesRouter from "./techniques.routes.js";
import tacticsRouter from "./tactics.routes.js";
import campaignsRouter from "./campaigns.routes.js";
import detectionsRouter from "./detections.routes.js";
import threatGroupsRouter from "./threatGroups.routes.js";
import softwareRouter from "./software.routes.js";
import platformsRouter from "./platforms.routes.js";
import vulnerabilitiesRouter from "./vulnerabilities.routes.js";
import integrationsRouter from "./integrations.routes.js";
import securityStandardsRouter from "./securityStandards.routes.js";

const router = express.Router();

// Ruta de verificación para API v1
router.get("/", (req, res) => {
	res.json({
		message: "API v1 está funcionando correctamente",
		version: "1.0.0",
	});
});

// Registrar rutas de recursos
router.use("/techniques", techniquesRouter);
router.use("/tactics", tacticsRouter);
router.use("/campaigns", campaignsRouter);
router.use("/detections", detectionsRouter);
router.use("/threat-groups", threatGroupsRouter);
router.use("/software", softwareRouter);
router.use("/platforms", platformsRouter);
router.use("/vulnerabilities", vulnerabilitiesRouter);
router.use("/integrations", integrationsRouter);
router.use("/security-standards", securityStandardsRouter);

export default router;
