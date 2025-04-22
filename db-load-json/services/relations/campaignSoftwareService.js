import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../../providers/graphql/graphqlClient.js";
import { getCampaignSoftwareQuery } from "../../providers/graphql/querys/campaignSoftwareQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getCampaignSoftwareRelation = async (campaignId) => {
	const queryVariables = {
		campaignId: campaignId,
	};

	const rawData = await graphqlFetch(
		ENDPOINT,
		getCampaignSoftwareQuery,
		queryVariables,
		HEADERS,
	);

	const formattedData = cleanGraphQLResponse(rawData);

	// Extraer el software y crear la tabla relacional
	const software = formattedData.prioritizedSoftware || [];

	// Crear la tabla relacional campaign_software
	const campaignSoftwareRelation = software.map((edge) => ({
		campaignId: campaignId,
		softwareId: edge.id,
		softwareMitreId: edge.mitreId,
	}));

	return campaignSoftwareRelation;
};
