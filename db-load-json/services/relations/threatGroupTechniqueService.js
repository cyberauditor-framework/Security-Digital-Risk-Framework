import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../../providers/graphql/graphqlClient.js";
import { getThreatGroupTechniquesQuery } from "../../providers/graphql/querys/threatGroupTechniquesQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getThreatGroupTechniquesRelation = async (threatGroupMitreId) => {
	const queryVariables = {
		threatGroupMitreId: threatGroupMitreId,
	};

	const rawData = await graphqlFetch(
		ENDPOINT,
		getThreatGroupTechniquesQuery,
		queryVariables,
		HEADERS,
	);

	const formattedData = cleanGraphQLResponse(rawData);

	// Extraer las técnicas y crear la tabla relacional
	const techniques = formattedData.prioritizedTechniques || [];

	// Crear la tabla relacional threatGroup_techniques
	const threatGroupTechniquesRelation = techniques.map((edge) => ({
		threatGroupMitreId: threatGroupMitreId,
		techniqueId: edge.id,
		techniqueMitreId: edge.mitreId,
	}));

	return threatGroupTechniquesRelation;
};
