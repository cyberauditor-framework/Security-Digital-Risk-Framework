import { listFiles, loadData } from "../persistence/jsonPersistence.js";

const STORAGE_DIR = "../db/common";

const analyzeDetectionsFromCampaignDetail = (data) => {
	const techniqueDetails = [];
	let totalTechniques = 0;
	let totalDetections = 0;
	let totalEnabled = 0;
	let totalDisabled = 0;

	// Loop through each technique
	data.techniques.forEach((technique) => {
		totalTechniques++;

		// Extract detections if they exist
		const detections = technique.technique?.detections || [];
		totalDetections += detections.length;

		// Count enabled and disabled detections
		let enabledCount = 0;
		let disabledCount = 0;

		detections.forEach((detection) => {
			if (detection.state === "ENABLED") {
				enabledCount++;
				totalEnabled++;
			} else if (detection.state === "DISABLED") {
				disabledCount++;
				totalDisabled++;
			}
		});

		// Add result for this technique
		techniqueDetails.push({
			techniqueId: technique.id,
			techniqueName: technique.name,
			mitreTechniqueId: technique.mitreId,
			totalDetections: detections.length,
			enabledDetections: enabledCount,
			disabledDetections: disabledCount,
		});
	});

	// Create result object with details and summary
	return {
		techniqueDetails: techniqueDetails,
		summary: {
			totalTechniques: totalTechniques,
			totalDetections: totalDetections,
			totalEnabledDetections: totalEnabled,
			totalDisabledDetections: totalDisabled,
		},
	};
};

export const campaignAnalysisDetections = async (storageDir = STORAGE_DIR) => {
	const campaignFiles = await listFiles(storageDir);
	console.log("Campaign files:", campaignFiles);

	const listCampaignsDetailsClient = [];

	for (const campaignFile of campaignFiles) {
		const campaignDetail = await loadData(`${campaignFile}`, storageDir);
		const campaignAnalysisDetections =
			analyzeDetectionsFromCampaignDetail(campaignDetail);

		const campaignDetailWithAnalysis = {
			campaignId: campaignFile,
			campaignAnalysisDetections: campaignAnalysisDetections,
		};
		listCampaignsDetailsClient.push(campaignDetailWithAnalysis);
	}

	return listCampaignsDetailsClient;
};

process.on("uncaughtException", (err) => {
	console.error("Error no capturado:", err);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Promesa rechazada no manejada:", reason);
	process.exit(1);
});
