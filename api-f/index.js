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

export const getThreatGroupData = async (
	threatGroupId,
	storageDir = STORAGE_DIR,
) => {
	// Load all required JSON files
	const campaignThreatGroups = await loadData(
		"campaign_threatGroups",
		storageDir,
	);
	const campaigns = await loadData("campaigns", storageDir);
	const threatGroupTechniques = await loadData(
		"threatGroup_techniques",
		storageDir,
	);
	const techniqueTactics = await loadData("technique_tactics", storageDir);

	// Find campaigns related to this threat group
	const relatedCampaignIds = campaignThreatGroups
		.filter((relation) => relation.threat_group_id === threatGroupId)
		.map((relation) => relation.campaign_id);

	// Get campaign names
	const relatedCampaigns = relatedCampaignIds.map((campaignId) => {
		const campaign = campaigns.find((c) => c.id === campaignId);
		return {
			id: campaignId,
			name: campaign ? campaign.name : "Unknown Campaign",
		};
	});

	// Get techniques associated with this threat group
	const relatedTechniques = threatGroupTechniques
		.filter((relation) => relation.threat_group_id === threatGroupId)
		.map((relation) => relation.technique_id);

	// Map techniques to tactics
	const techniquesWithTactics = relatedTechniques.map((techniqueId) => {
		const tactics = techniqueTactics
			.filter((relation) => relation.technique_id === techniqueId)
			.map((relation) => relation.tactic_id);

		return {
			mitreTechniqueId: techniqueId,
			tactics: tactics,
		};
	});

	// Create final result
	const result = {
		threatGroupId,
		campaigns: relatedCampaigns,
		techniques: techniquesWithTactics,
	};

	console.log("Threat Group Data:", JSON.stringify(result, null, 2));
	return result;
};

process.on("uncaughtException", (err) => {
	console.error("Error no capturado:", err);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Promesa rechazada no manejada:", reason);
	process.exit(1);
});
