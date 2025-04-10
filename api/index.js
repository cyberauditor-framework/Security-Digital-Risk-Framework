import { campaignAnalysisDetections } from "../api-f/index.js";
import { initStorage, saveData } from "../persistence/jsonPersistence.js";

const STORAGE_DIR_MULTI_TENANT = "../db/multi-tenant";
// const STORAGE_DIR_COMMON = "../api-f/db/common";

(async () => {
	try {
		console.log("Initializing api...");

		await initStorage(STORAGE_DIR_MULTI_TENANT);

		const campaignAnalysisDetectionsClient = await campaignAnalysisDetections();

		console.log("campaignDetailWithAnalysis", campaignAnalysisDetectionsClient);

		for (const campaign of campaignAnalysisDetectionsClient) {
			await saveData(
				`${campaign.campaignId}`,
				campaign,
				STORAGE_DIR_MULTI_TENANT,
			);
		}
	} catch (error) {
		console.error("Initialization error:", error);
		process.exit(1);
	}
})();

process.on("uncaughtException", (err) => {
	console.error("Error no capturado:", err);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Promesa rechazada no manejada:", reason);
	process.exit(1);
});
