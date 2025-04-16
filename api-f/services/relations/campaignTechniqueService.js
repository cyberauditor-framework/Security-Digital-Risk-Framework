import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../../providers/graphql/graphqlClient.js";
import { getCampaignDetailQuery } from "../../providers/graphql/querys/campaignsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getCampaignTechniquesRelation = async (campaignId) => {
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
		return [];
	}

	const campaign = formattedCampaignDetail.campaigns[0];

	if (!campaign.techniques) {
		return [];
	}

	return campaign.techniques.map((technique) => ({
		campaign_id: campaignId,
		technique_id: technique.id,
	}));
};
