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
		searchNameOrMitreId: "",
		tacticNames: "",
		integrationNames: "",
		platformNames: "",
		priority: "",
		content: "",
		mitreIds: "",
		campaignStixIds: "",
		softwareMitreIds: "",
		threatGroupMitreIds: "",
		telemetrySubcategoryNames: "",
		controlStixIds: "",
		telemetrySubcategoryId: "",
		countries: [],
		industries: [],
		pageSize: 10,
		domainName: "",
		orderBy: "-priority",
	};

	const rawCampaigns = await graphqlFetch(
		ENDPOINT,
		getCampaignsQuery,
		getCampaignsQueryVariable,
		HEADERS,
	);

	const formattedCampaigns = cleanGraphQLResponse(rawCampaigns);

	if (
		!formattedCampaigns ||
		!formattedCampaigns.campaigns ||
		formattedCampaigns.campaigns.length === 0
	) {
		console.log("Campaigns not found.");
		return { campaigns: [], fullCampaigns: [] };
	}

	// Crear una versión simplificada para el JSON
	const simplifiedCampaigns = formattedCampaigns.campaigns.map((campaign) => ({
		id: campaign.id,
		name: campaign.name,
		stixId: campaign.stixId,
		description: campaign.description,
		deprecated: campaign.deprecated,
		revoked: campaign.revoked,
		createdTimestamp: campaign.createdTimestamp,
		modifiedTimestamp: campaign.modifiedTimestamp,
		update: campaign.update,
		type: campaign.type,
		origin: campaign.origin,
		firstSeenTimestamp: campaign.firstSeenTimestamp,
		lastSeenTimestamp: campaign.lastSeenTimestamp,
		aliasNames: campaign.aliasNames,
		techniquesCount: campaign.techniquesCount,
		softwareCount: campaign.softwareCount,
		threatGroupsCount: campaign.threatGroupsCount,
		vulnerabilityCveIds: campaign.vulnerabilityCveIds,
		vulnerabilitiesCount: campaign.vulnerabilitiesCount,
		assetsCount: campaign.assetsCount,
	}));

	return {
		campaigns: simplifiedCampaigns,
		fullCampaigns: formattedCampaigns.campaigns,
	};
};

export const getCampaignDetail = async (campaignId) => {
	const getCampaignDetailQueryVariable = {
		id: campaignId,
	};

	const rawCampaignDetail = await graphqlFetch(
		ENDPOINT,
		getCampaignDetailQuery,
		getCampaignDetailQueryVariable,
		HEADERS,
	);

	const formattedCampaignDetail = cleanGraphQLResponse(rawCampaignDetail);

	if (
		!formattedCampaignDetail ||
		!formattedCampaignDetail.campaigns ||
		formattedCampaignDetail.campaigns.length === 0
	) {
		console.log("Campaign detail not found.");
		return null;
	}

	const campaign = formattedCampaignDetail.campaigns[0];

	return {
		...campaign,
		techniques: campaign.techniques || [],
		software: campaign.software || [],
		threatGroups: campaign.threatGroups || [],
		vulnerabilities: campaign.vulnerabilities || [],
	};
};
