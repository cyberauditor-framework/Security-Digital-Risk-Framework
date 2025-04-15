import { initStorage, saveData } from "../persistence/jsonPersistence.js";

import { getCampaigns, getCampaignDetail } from "./services/campaignService.js";
import { getTechniques } from "./services/techniqueService.js";
import { getVulnerabilities } from "./services/vulnerabilityService.js";
import { getPlatforms } from "./services/platformService.js";
import { getTactics } from "./services/tacticService.js";
import { getSoftware } from "./services/softwareService.js";
import { getThreatGroups } from "./services/threatGroupService.js";
import { getIntegrations } from "./services/integrationService.js";
import { parseFile } from "./services/fileParserService.js";

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
	const campaigns = await getCampaigns();
	await saveData("campaigns", campaigns, STORAGE_DIR);

	const techniques = await getTechniques();
	await saveData("techniques", techniques, STORAGE_DIR);

	const vulnerabilities = await getVulnerabilities();
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
	
	for (const campaign of campaigns) {
		const campaignId = campaign.id;
		
		// Relación campaña-técnicas
		const campaignTechniques = await getCampaignTechniquesRelation(campaignId);
		campaignTechniquesRelations.push(...campaignTechniques);
		
		// Relación campaña-software
		const campaignSoftware = await getCampaignSoftwareRelation(campaignId);
		campaignSoftwareRelations.push(...campaignSoftware);
		
		// Relación campaña-grupos de amenazas
		const campaignThreatGroups = await getCampaignThreatGroupsRelation(campaignId);
		campaignThreatGroupsRelations.push(...campaignThreatGroups);
		
		// Relación campaña-vulnerabilidades
		const campaignVulnerabilities = await getCampaignVulnerabilitiesRelation(campaignId);
		campaignVulnerabilitiesRelations.push(...campaignVulnerabilities);
	}
	
	// Guardar relaciones de campañas
	await saveData("campaign_techniques", campaignTechniquesRelations, STORAGE_DIR);
	await saveData("campaign_software", campaignSoftwareRelations, STORAGE_DIR);
	await saveData("campaign_threatGroups", campaignThreatGroupsRelations, STORAGE_DIR);
	await saveData("campaign_vulnerabilities", campaignVulnerabilitiesRelations, STORAGE_DIR);
	
	// Relaciones de técnicas con tácticas
	const techniqueTacticsRelations = [];
	
	for (const technique of techniques) {
		const techniqueId = technique.id;
		const techniqueMitreId = technique.mitreId;
		if (techniqueMitreId) {
			const techniqueTactics = await getTechniqueTacticsRelation(techniqueId, techniqueMitreId);
			techniqueTacticsRelations.push(...techniqueTactics);
		}
	}
	
	await saveData("technique_tactics", techniqueTacticsRelations, STORAGE_DIR);
	
	// Relaciones de software con técnicas
	const softwareTechniquesRelations = [];
	
	for (const sw of software) {
		const softwareMitreId = sw.mitreId;
		if (softwareMitreId) {
			const softwareTechniques = await getSoftwareTechniquesRelation(softwareMitreId);
			softwareTechniquesRelations.push(...softwareTechniques);
		}
	}
	
	await saveData("software_techniques", softwareTechniquesRelations, STORAGE_DIR);
	
	// Relaciones de grupos de amenazas con técnicas
	const threatGroupTechniquesRelations = [];
	
	for (const threatGroup of threatGroups) {
		const threatGroupMitreId = threatGroup.mitreId;
		if (threatGroupMitreId) {
			const threatGroupTechniques = await getThreatGroupTechniquesRelation(threatGroupMitreId);
			threatGroupTechniquesRelations.push(...threatGroupTechniques);
		}
	}
	
	await saveData("threatGroup_techniques", threatGroupTechniquesRelations, STORAGE_DIR);

	// Parse NIST800-53-CONTROLS.xlsx
	const nistData = await parseFile(
		"C:\\Users\\239834\\Documents\\Cyberproof\\2025-BOVEDA\\0.DISEÑO\\DATOS\\ANEXOS\\NIST800-53-CONTROLS.xlsx",
		["Technique ID", "Technique Name"],
	);

	// Parse CISV8.CONTROLS.xlsx
	const cisData = await parseFile(
		"C:\\Users\\239834\\Documents\\Cyberproof\\2025-BOVEDA\\0.DISEÑO\\DATOS\\ANEXOS\\CISV8.CONTROLS.xlsx",
		["Technique ID", "Technique Name"],
	);

	// Combine data into ttp-rel-standard.json format
	const ttpRelStandard = [
		...nistData.map((item) => ({
			id: 1,
			idMitre: item["Technique ID"],
			standard: "NIST800",
		})),
		...cisData.map((item) => ({
			id: 2,
			idMitre: item["Technique ID"],
			standard: "CISV8",
		})),
	];

	// Save ttp-rel-standard.json
	await saveData("ttp-rel-standard", ttpRelStandard, STORAGE_DIR);

	console.log("Datos principales y tablas relacionales guardados correctamente.");
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
