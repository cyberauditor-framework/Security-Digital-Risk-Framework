import { initStorage, saveData } from "./persistence/jsonPersistence.js";

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
import { getIndustries } from "./services/industryService.js";
import { getCountries } from "./services/countryService.js";

// Importar servicios de relaciones
import { getCampaignTechniquesRelation } from "./services/relations/campaignTechniqueService.js";
import { getCampaignSoftwareRelation } from "./services/relations/campaignSoftwareService.js";
import { getCampaignThreatGroupsRelation } from "./services/relations/campaignThreatGroupService.js";
import { getCampaignVulnerabilitiesRelation } from "./services/relations/campaignVulnerabilityService.js";
import { getTechniqueTacticsRelation } from "./services/relations/techniqueTacticService.js";
import { getSoftwareTechniquesRelation } from "./services/relations/softwareTechniqueService.js";
import { getThreatGroupTechniquesRelation } from "./services/relations/threatGroupTechniqueService.js";
import { getCampaignIndustriesRelation } from "./services/relations/campaignIndustryService.js";
import { getCampaignCountriesRelation } from "./services/relations/campaignCountryService.js";

const STORAGE_DIR = "../db-json/common";

const seedData = async () => {
	try {
		// Obtener y guardar las tablas principales
		console.log("Fetching campaigns...");
		const { campaigns, fullCampaigns } = await getCampaigns();
		await saveData("campaigns", campaigns, STORAGE_DIR);
		console.log(`Saved ${campaigns.length} campaigns`);

		console.log("Fetching techniques...");
		const { techniques, fullTechniques } = await getTechniques();
		await saveData("techniques", techniques, STORAGE_DIR);
		console.log(`Saved ${techniques.length} techniques`);

		// Get industries
		try {
			console.log("Fetching industries...");
			const industries = await getIndustries();
			await saveData("industries", industries, STORAGE_DIR);
			console.log(`Saved ${industries.length} industries`);
		} catch (error) {
			console.error("Error fetching industries:", error.message);
			console.log("Continuing with other data...");
		}

		// Get countries
		try {
			console.log("Fetching countries...");
			const countries = await getCountries();
			await saveData("countries", countries, STORAGE_DIR);
			console.log(`Saved ${countries.length} countries`);
		} catch (error) {
			console.error("Error fetching countries:", error.message);
			console.log("Continuing with other data...");
		}

		// Generate technique relationships
		const techniqueTacticsRelations = [];
		const techniquePlatformsRelations = [];
		const techniqueSoftwareRelations = [];
		const techniqueDetectionsRelations = [];

		// Get detections
		console.log("Fetching detections...");
		const detections = await getDetections();
		await saveData("detections", detections, STORAGE_DIR);
		console.log(`Saved ${detections.length} detections`);

		// Procesar las relaciones de técnicas
		console.log("Processing technique relationships...");
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
		console.log("Saving technique relationships...");
		await saveData("technique_tactics", techniqueTacticsRelations, STORAGE_DIR);
		await saveData(
			"technique_platforms",
			techniquePlatformsRelations,
			STORAGE_DIR,
		);
		await saveData(
			"technique_software",
			techniqueSoftwareRelations,
			STORAGE_DIR,
		);
		await saveData(
			"technique_detections",
			techniqueDetectionsRelations,
			STORAGE_DIR,
		);

		try {
			console.log("Fetching platforms...");
			const platforms = await getPlatforms();
			await saveData("platforms", platforms, STORAGE_DIR);
			console.log(`Saved ${platforms.length} platforms`);
		} catch (error) {
			console.error("Error fetching platforms:", error.message);
			console.log("Continuing with other data...");
		}

		try {
			console.log("Fetching tactics...");
			const tactics = await getTactics();
			await saveData("tactics", tactics, STORAGE_DIR);
			console.log(`Saved ${tactics.length} tactics`);
		} catch (error) {
			console.error("Error fetching tactics:", error.message);
			console.log("Continuing with other data...");
		}

		try {
			console.log("Fetching software...");
			const software = await getSoftware();
			await saveData("software", software, STORAGE_DIR);
			console.log(`Saved ${software.length} software`);
		} catch (error) {
			console.error("Error fetching software:", error.message);
			console.log("Continuing with other data...");
		}

		try {
			console.log("Fetching threat groups...");
			const { threatGroups, fullThreatGroups } = await getThreatGroups();
			await saveData("threatGroups", threatGroups, STORAGE_DIR);
			console.log(`Saved ${threatGroups.length} threat groups`);

			// Relaciones de threat groups con techniques
			const threatGroupTechniquesRelations = [];

			// Process threat group to techniques relationship
			for (const threatGroup of fullThreatGroups) {
				if (threatGroup.techniques) {
					threatGroup.techniques.forEach((technique) => {
						threatGroupTechniquesRelations.push({
							threat_group_id: threatGroup.mitreId,
							technique_id: technique.mitreId,
						});
					});
				}
			}

			// Save threat group to techniques relationship
			await saveData(
				"threatGroup_techniques",
				threatGroupTechniquesRelations,
				STORAGE_DIR,
			);
		} catch (error) {
			console.error("Error fetching threat groups:", error.message);
			console.log("Continuing with other data...");
		}

		try {
			console.log("Fetching integrations...");
			const integrations = await getIntegrations();
			await saveData("integrations", integrations, STORAGE_DIR);
			console.log(`Saved ${integrations.length} integrations`);
		} catch (error) {
			console.error("Error fetching integrations:", error.message);
			console.log("Continuing with other data...");
		}

		// Obtener y guardar las tablas relacionales
		console.log("Processing campaign relationships...");
		// Relaciones de campañas
		const campaignTechniquesRelations = [];
		const campaignSoftwareRelations = [];
		const campaignThreatGroupsRelations = [];
		const campaignVulnerabilitiesRelations = [];
		const campaignIndustriesRelations = [];
		const campaignCountriesRelations = [];

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

			// Relación campaña-industrias
			if (campaign.industries && campaign.industries.length > 0) {
				campaign.industries.forEach((industryId) => {
					campaignIndustriesRelations.push({
						campaign_id: campaignId,
						industry_id: industryId,
					});
				});
			}

			// Relación campaña-países
			if (campaign.countries && campaign.countries.length > 0) {
				campaign.countries.forEach((countryId) => {
					campaignCountriesRelations.push({
						campaign_id: campaignId,
						country_id: countryId,
					});
				});
			}
		}

		// Guardar relaciones de campañas
		console.log("Saving campaign relationships...");
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
		await saveData(
			"campaign_industries",
			campaignIndustriesRelations,
			STORAGE_DIR,
		);
		await saveData(
			"campaign_countries",
			campaignCountriesRelations,
			STORAGE_DIR,
		);

		// Fetch and save other entities with error handling
		try {
			console.log("Fetching vulnerabilities...");
			const { vulnerabilities, fullVulnerabilities } =
				await getVulnerabilities();
			await saveData("vulnerabilities", vulnerabilities, STORAGE_DIR);
			console.log(`Saved ${vulnerabilities.length} vulnerabilities`);

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
		} catch (error) {
			console.error("Error fetching vulnerabilities:", error.message);
			console.log("Continuing with other data...");
		}

		try {
			// Parse NIST800-53-CONTROLS.xlsx
			console.log("Parsing NIST800-53-CONTROLS.xlsx...");
			const nistData = await parseFile(
				// "C:\\Users\\239834\\Documents\\Cyberproof\\2025-BOVEDA\\0.DISEÑO\\DATOS\\ANEXOS\\NIST800-53-CONTROLS.xlsx",
				"C:\\Users\\239846\\Documents\\Cyberproof\\Obsidian_Vault\\DOCUMENTACION\\DOCUMENTACION\\2025-BOVEDA\\2025-BOVEDA\\0.DISEÑO\\DATOS\\ANEXOS\\NIST800-53-CONTROLS.xlsx",
				[
					"Technique ID",
					"Technique Name",
					"Control ID",
					"Control Name",
					"Technique Name",
				],
			);

			// Parse CISV8.CONTROLS.xlsx
			console.log("Parsing CISV8.CONTROLS.xlsx...");
			const cisData = await parseFile(
				// "C:\\Users\\239834\\Documents\\Cyberproof\\2025-BOVEDA\\0.DISEÑO\\DATOS\\ANEXOS\\CISV8.CONTROLS.xlsx",
				"C:\\Users\\239846\\Documents\\Cyberproof\\Obsidian_Vault\\DOCUMENTACION\\DOCUMENTACION\\2025-BOVEDA\\2025-BOVEDA\\0.DISEÑO\\DATOS\\ANEXOS\\CISV8.CONTROLS.xlsx",
				[
					"Technique ID",
					"Technique Name",
					"Control ID",
					"Control Name",
					"Description",
				],
			);

			// Combine data into ttp-rel-standard.json format
			const ttpRelStandard = [
				...nistData.map((item) => ({
					id: "1",
					idMitre: String(item["Technique ID"]),
					standard: "NIST800",
					controlId: String(item["Control ID"]),
					controlName: String(item["Control Name"]),
					techniqueName: String(item["Technique Name"]),
					description: "",
				})),
				...cisData.map((item) => ({
					id: "2",
					idMitre: String(item["Technique ID"]),
					standard: "CISV8",
					controlId: String(item["Control ID"]),
					controlName: String(item["Control Name"]),
					techniqueName: "",
					description: item.Description,
				})),
			];

			// Save ttp-rel-standard.json
			await saveData("ttp-rel-standard", ttpRelStandard, STORAGE_DIR);
		} catch (error) {
			console.error("Error processing Excel files:", error.message);
		}

		console.log(
			"Datos principales y tablas relacionales guardados correctamente.",
		);
	} catch (error) {
		console.error("Error during seed process:", error);
		throw error;
	}
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
