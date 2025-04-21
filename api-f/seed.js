import { initStorage, saveData } from "../persistence/jsonPersistence.js";

import { getCampaigns } from "./services/campaignService.js";
import { getTechniques } from "./services/techniqueService.js";
import { getVulnerabilities } from "./services/vulnerabilityService.js";
import { getPlatforms } from "./services/platformService.js";
import { getTactics } from "./services/tacticService.js";
import { getSoftware } from "./services/softwareService.js";
import { getThreatGroups } from "./services/threatGroupService.js";
import { getIntegrations } from "./services/integrationService.js";
import { parseFile } from "./services/fileParserService.js";
import { getDetections } from "./services/detectionService.js";

// Importar servicios de relaciones
import { getCampaignTechniquesRelation } from "./services/relations/campaignTechniqueService.js";
import { getCampaignSoftwareRelation } from "./services/relations/campaignSoftwareService.js";
import { getCampaignThreatGroupsRelation } from "./services/relations/campaignThreatGroupService.js";
import { getCampaignVulnerabilitiesRelation } from "./services/relations/campaignVulnerabilityService.js";
import { getTechniqueTacticsRelation } from "./services/relations/techniqueTacticService.js";
import { getSoftwareTechniquesRelation } from "./services/relations/softwareTechniqueService.js";
import { getThreatGroupTechniquesRelation } from "./services/relations/threatGroupTechniqueService.js";

const STORAGE_DIR = "../db/common";

const seedData = async () => {
	// Obtener y guardar las tablas principales
	const { campaigns, fullCampaigns } = await getCampaigns();
	await saveData("campaigns", campaigns, STORAGE_DIR);

	const { techniques, fullTechniques } = await getTechniques();
	await saveData("techniques", techniques, STORAGE_DIR);

	// Generate technique relationships
	const techniqueTacticsRelations = [];
	const techniquePlatformsRelations = [];
	const techniqueSoftwareRelations = [];
	const techniqueDetectionsRelations = [];

	// Get detections
	const detections = await getDetections();
	await saveData("detections", detections, STORAGE_DIR);

	// Procesar las relaciones de técnicas
	for (const technique of fullTechniques) {
		// Technique-Tactics relations
		if (technique.tactics) {
			technique.tactics.forEach((tactic) => {
				techniqueTacticsRelations.push({
					technique_id: technique.mitreId,
					tactic_id: tactic.mitreId,
				});
			});
		}

		// Technique-Platforms relations
		if (technique.platforms) {
			technique.platforms.forEach((platform) => {
				techniquePlatformsRelations.push({
					technique_id: technique.mitreId,
					platform_id: platform.id,
				});
			});
		}

		// Technique-Software relations
		if (technique.software) {
			technique.software.forEach((sw) => {
				techniqueSoftwareRelations.push({
					technique_id: technique.mitreId,
					software_id: sw.mitreId,
				});
			});
		}

		// Technique-Detections relations
		if (technique.detections) {
			technique.detections.forEach((detection) => {
				techniqueDetectionsRelations.push({
					technique_id: technique.mitreId,
					detection_id: detection.id,
					effectiveness: 0, // Default value, can be updated later
				});
			});
		}
	}

	// Save technique relationships
	await saveData("technique_tactics", techniqueTacticsRelations, STORAGE_DIR);
	await saveData(
		"technique_platforms",
		techniquePlatformsRelations,
		STORAGE_DIR,
	);
	await saveData("technique_software", techniqueSoftwareRelations, STORAGE_DIR);
	await saveData(
		"technique_detections",
		techniqueDetectionsRelations,
		STORAGE_DIR,
	);

	const { vulnerabilities, fullVulnerabilities } = await getVulnerabilities();
	await saveData("vulnerabilities", vulnerabilities, STORAGE_DIR);

	const platforms = await getPlatforms();
	await saveData("platforms", platforms, STORAGE_DIR);

	const tactics = await getTactics();
	await saveData("tactics", tactics, STORAGE_DIR);

	const software = await getSoftware();
	await saveData("software", software, STORAGE_DIR);

	const threatGroups = await getThreatGroups();
	await saveData("threatGroups", threatGroups, STORAGE_DIR);

	const integrations = await getIntegrations();
	await saveData("integrations", integrations, STORAGE_DIR);

	// Obtener y guardar las tablas relacionales

	// Relaciones de campañas
	const campaignTechniquesRelations = [];
	const campaignSoftwareRelations = [];
	const campaignThreatGroupsRelations = [];
	const campaignVulnerabilitiesRelations = [];

	for (const campaign of fullCampaigns) {
		const campaignId = campaign.id;

		// Relación campaña-técnicas
		if (campaign.techniques) {
			campaign.techniques.forEach((technique) => {
				campaignTechniquesRelations.push({
					campaign_id: campaignId,
					technique_id: technique.mitreId,
				});
			});
		}

		// Relación campaña-software
		if (campaign.software) {
			campaign.software.forEach((sw) => {
				campaignSoftwareRelations.push({
					campaign_id: campaignId,
					software_id: sw.mitreId,
				});
			});
		}

		// Relación campaña-grupos de amenazas
		if (campaign.threatGroups) {
			campaign.threatGroups.forEach((threatGroup) => {
				campaignThreatGroupsRelations.push({
					campaign_id: campaignId,
					threat_group_id: threatGroup.mitreId,
				});
			});
		}

		// Relación campaña-vulnerabilidades
		if (campaign.vulnerabilities) {
			campaign.vulnerabilities.forEach((vulnerability) => {
				campaignVulnerabilitiesRelations.push({
					campaign_id: campaignId,
					vulnerability_id: vulnerability.id,
				});
			});
		}
	}

	// Guardar relaciones de campañas
	await saveData(
		"campaign_techniques",
		campaignTechniquesRelations,
		STORAGE_DIR,
	);
	await saveData("campaign_software", campaignSoftwareRelations, STORAGE_DIR);
	await saveData(
		"campaign_threatGroups",
		campaignThreatGroupsRelations,
		STORAGE_DIR,
	);
	await saveData(
		"campaign_vulnerabilities",
		campaignVulnerabilitiesRelations,
		STORAGE_DIR,
	);

	// Guardar relaciones de vulnerabilidades con plataformas
	const vulnerabilityPlatformsRelations = [];
	for (const vulnerability of fullVulnerabilities) {
		if (vulnerability.platforms) {
			vulnerability.platforms.forEach((platform) => {
				vulnerabilityPlatformsRelations.push({
					vulnerability_id: vulnerability.id,
					platform_id: platform.id,
				});
			});
		}
	}
	await saveData(
		"vulnerability_platforms",
		vulnerabilityPlatformsRelations,
		STORAGE_DIR,
	);

	// Parse NIST800-53-CONTROLS.xlsx
	const nistData = await parseFile(
		"C:\\Users\\239834\\Documents\\Cyberproof\\2025-BOVEDA\\0.DISEÑO\\DATOS\\ANEXOS\\NIST800-53-CONTROLS.xlsx",
		["Technique ID", "Technique Name", "Control ID"],
	);

	// Parse CISV8.CONTROLS.xlsx
	const cisData = await parseFile(
		"C:\\Users\\239834\\Documents\\Cyberproof\\2025-BOVEDA\\0.DISEÑO\\DATOS\\ANEXOS\\CISV8.CONTROLS.xlsx",
		["Technique ID", "Technique Name", "Control ID"],
	);

	// Combine data into ttp-rel-standard.json format
	const ttpRelStandard = [
		...nistData.map((item) => ({
			id: "1",
			idMitre: String(item["Technique ID"]),
			standard: "NIST800",
			controlId: String(item["Control ID"]),
		})),
		...cisData.map((item) => ({
			id: "2",
			idMitre: String(item["Technique ID"]),
			standard: "CISV8",
			controlId: String(item["Control ID"]),
		})),
	];

	// Save ttp-rel-standard.json
	await saveData("ttp-rel-standard", ttpRelStandard, STORAGE_DIR);

	console.log(
		"Datos principales y tablas relacionales guardados correctamente.",
	);
};

(async () => {
	try {
		console.log("Inicializando api-f...");

		await initStorage(STORAGE_DIR);
		await seedData();

		console.log("Inicialización completada.");
	} catch (error) {
		console.error("Error de inicialización:", error);
		process.exit(1);
	}
})();
