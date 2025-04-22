import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../../providers/graphql/graphqlClient.js";
import { getTechniqueTacticsQuery } from "../../providers/graphql/querys/techniqueTacticsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getTechniqueTacticsRelation = async (techniqueId, techniqueMitreId) => {
	const queryVariables = {
		mitreId: techniqueMitreId,
	};

	const rawData = await graphqlFetch(
		ENDPOINT,
		getTechniqueTacticsQuery,
		queryVariables,
		HEADERS,
	);

	const formattedData = cleanGraphQLResponse(rawData);

	// Extraer las tácticas y crear la tabla relacional
	const techniques = formattedData.prioritizedTechniques?.edges || [];
	if (techniques.length === 0) {
		return [];
	}
	
	const technique = techniques[0].node;
	const tacticNames = technique.tacticNames || [];
	
	// Crear la tabla relacional technique_tactics
	const techniqueTacticsRelation = tacticNames.map((tacticName) => ({
		techniqueId: techniqueId,
		techniqueMitreId: techniqueMitreId,
		tacticName: tacticName
	}));

	return techniqueTacticsRelation;
};
