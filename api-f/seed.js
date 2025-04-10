import { initStorage, saveData } from "../persistence/jsonPersistence.js";

import { getCampaigns, getCampaignDetail } from "./services/campaignService.js";

const STORAGE_DIR = "../db/common";

const seedData = async () => {
	const campaigns = await getCampaigns();

	for (const campaign of campaigns) {
		const campaignId = campaign.id;
		console.log("Campaign ID:", campaignId);

		const campaignDetail = await getCampaignDetail(campaignId);
		await saveData(`${campaignId}`, campaignDetail, STORAGE_DIR);
	}
};

(async () => {
	try {
		console.log("Initializing api-f...");

		await initStorage(STORAGE_DIR);
		await seedData();
	} catch (error) {
		console.error("Initialization error:", error);
		process.exit(1);
	}
})();
