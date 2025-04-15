import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../../providers/graphql/graphqlClient.js";
import { getCampaignTechniquesQuery } from "../../providers/graphql/querys/campaignTechniquesQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getCampaignTechniquesRelation = async (campaignId) => {
	const queryVariables = {
		campaignId: campaignId,
	};

	const rawData = await graphqlFetch(
		ENDPOINT,
		getCampaignTechniquesQuery,
		queryVariables,
		HEADERS,
	);

	const formattedData = cleanGraphQLResponse(rawData);

	// Extraer las técnicas y crear la tabla relacional
	const techniques = formattedData.prioritizedTechniques || [];

	// Crear la tabla relacional campaign_techniques
	const campaignTechniquesRelation = techniques.map((edge) => ({
		campaignId: campaignId,
		techniqueId: edge.id,
		techniqueMitreId: edge.mitreId,
	}));

	return campaignTechniquesRelation;
};
