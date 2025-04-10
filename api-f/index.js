import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "./providers/graphql/graphqlClient.js";
import {
	getCampaignsQuery,
	getCampaignDetailQuery,
} from "./providers/graphql/querys/campaignsQuery.js";
import { initStorage } from "./providers/persistence/jsonPersistence.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

const getCampaigns = async () => {
	const getCampaignsQueryVariable = {
		offset: 0,
		name_Icontains: "",
		pageSize: 1,
		orderBy: "-createdTimestamp",
	};

	const rawCampaigns = await graphqlFetch(
		ENDPOINT,
		getCampaignsQuery,
		getCampaignsQueryVariable,
		HEADERS,
	);

	console.log("rawCampaigns", rawCampaigns);

	const formatedCampaigns = cleanGraphQLResponse(rawCampaigns);

	console.log("formatedListData", formatedCampaigns);

	const campaigns = formatedCampaigns.prioritizedCampaigns;

	if (!campaigns || campaigns.length === 0) {
		console.log("Campaigns not found.");
	}

	console.log(`Campaigns found: ${campaigns.length}`);

	return campaigns;
};

const getCampaignDetail = async (campaignId) => {
	const getCampaignDetailQueryVariable = {
		id: campaignId,
	};

	const campaignDetailRaw = await graphqlFetch(
		ENDPOINT,
		getCampaignDetailQuery,
		getCampaignDetailQueryVariable,
		HEADERS,
	);

	const formatedCampaignDetail = cleanGraphQLResponse(campaignDetailRaw);

	const campaignDetail = {
		campaigns: formatedCampaignDetail.prioritizedCampaigns,
		techniques: formatedCampaignDetail.prioritizedTechniques,
		software: formatedCampaignDetail.prioritizedSoftware,
		threatGroups: formatedCampaignDetail.prioritizedThreatGroups,
		vulnerabilities: formatedCampaignDetail.prioritizedVulnerabilities,
	};

	// console.log(
	// 	`Campaign Detail: ${JSON.stringify(formatedCampaignDetail, null, 2)}`,
	// );

	return campaignDetail;
};

(async () => {
	try {
		console.log("Initializing api-f...");

		// await initStorage();

		const campaigns = await getCampaigns();

		for (const campaign of campaigns) {
			const campaignId = campaign.id;
			console.log("Campaign ID:", campaignId);

			const campaignDetail = await getCampaignDetail(campaignId);
			console.log("Campaign Detail:", campaignDetail);
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
