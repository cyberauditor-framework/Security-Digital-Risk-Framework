import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../../providers/graphql/graphqlClient.js";
import { getSoftwareTechniquesQuery } from "../../providers/graphql/querys/softwareTechniquesQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getSoftwareTechniquesRelation = async (softwareMitreId) => {
	const queryVariables = {
		softwareMitreId: softwareMitreId,
	};

	const rawData = await graphqlFetch(
		ENDPOINT,
		getSoftwareTechniquesQuery,
		queryVariables,
		HEADERS,
	);

	const formattedData = cleanGraphQLResponse(rawData);

	// Extraer las técnicas y crear la tabla relacional
	const techniques = formattedData.prioritizedTechniques || [];

	// Crear la tabla relacional software_techniques
	const softwareTechniquesRelation = techniques.map((edge) => ({
		softwareMitreId: softwareMitreId,
		techniqueId: edge.id,
		techniqueMitreId: edge.mitreId,
	}));

	return softwareTechniquesRelation;
};
