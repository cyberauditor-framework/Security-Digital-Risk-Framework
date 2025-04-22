import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../../providers/graphql/graphqlClient.js";
import { getCampaignThreatGroupsQuery } from "../../providers/graphql/querys/campaignThreatGroupsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getCampaignThreatGroupsRelation = async (campaignId) => {
	const queryVariables = {
		campaignId: campaignId,
	};

	const rawData = await graphqlFetch(
		ENDPOINT,
		getCampaignThreatGroupsQuery,
		queryVariables,
		HEADERS,
	);

	const formattedData = cleanGraphQLResponse(rawData);

	// Extraer los grupos de amenazas y crear la tabla relacional
	const threatGroups = formattedData.prioritizedThreatGroups || [];

	// Crear la tabla relacional campaign_threatGroups
	const campaignThreatGroupsRelation = threatGroups.map((edge) => ({
		campaignId: campaignId,
		threatGroupId: edge.id,
		threatGroupMitreId: edge.mitreId,
	}));

	return campaignThreatGroupsRelation;
};
