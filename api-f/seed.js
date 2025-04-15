import { initStorage, saveData } from "../persistence/jsonPersistence.js";

import { getCampaigns, getCampaignDetail } from "./services/campaignService.js";

import { parseFile } from "./services/fileParserService.js";

import { getTechniques } from "./services/techniqueService.js";

import { getVulnerabilities } from "./services/vulnerabilityService.js";

import { getPlatforms } from "./services/platformService.js";

import { getTactics } from "./services/tacticService.js";

import { getSoftware } from "./services/softwareService.js";

import { getThreatGroups } from "./services/threatGroupService.js";

import { getIntegrations } from "./services/integrationService.js";

const STORAGE_DIR = "../db/common";

const seedData = async () => {
	const campaigns = await getCampaigns();
	await saveData("campaigns", campaigns, STORAGE_DIR);

	/*for (const campaign of campaigns) {
		const campaignId = campaign.id;
		console.log("Campaign ID:", campaignId);

		const campaignDetail = await getCampaignDetail(campaignId);
		await saveData(`${campaignId}`, campaignDetail, STORAGE_DIR);

		}*/

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

	console.log("TTP Relationship Standard data saved.");
};

(async () => {
	try {
		console.log("Initializing api-f...");

		await initStorage(STORAGE_DIR);
		await seedData();

		console.log("Initialization complete.");
	} catch (error) {
		console.error("Initialization error:", error);
		process.exit(1);
	}
})();
