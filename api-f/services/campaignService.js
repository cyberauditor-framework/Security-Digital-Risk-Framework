import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import {
	getCampaignsQuery,
	getCampaignDetailQuery,
} from "../providers/graphql/querys/campaignsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getCampaigns = async () => {
	const getCampaignsQueryVariable = {
		offset: 0,
		name_Icontains: "",
		pageSize: 2,
		orderBy: "-createdTimestamp",
	};

	const rawCampaigns = await graphqlFetch(
		ENDPOINT,
		getCampaignsQuery,
		getCampaignsQueryVariable,
		HEADERS,
	);

	const formatedCampaigns = cleanGraphQLResponse(rawCampaigns);

	const campaigns = formatedCampaigns.prioritizedCampaigns;

	if (!campaigns || campaigns.length === 0) {
		console.log("Campaigns not found.");
	}

	return campaigns;
};

export const getCampaignDetail = async (campaignId) => {
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

	return campaignDetail;
};
