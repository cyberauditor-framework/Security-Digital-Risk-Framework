import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import { getTechniquesQuery } from "../providers/graphql/querys/techniquesQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getTechniques = async () => {
	const getTechniquesQueryVariable = {
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

	const rawTechniques = await graphqlFetch(
		ENDPOINT,
		getTechniquesQuery,
		getTechniquesQueryVariable,
		HEADERS,
	);

	const formattedTechniques = cleanGraphQLResponse(rawTechniques);

	if (
		!formattedTechniques ||
		!formattedTechniques.techniques ||
		formattedTechniques.techniques.length === 0
	) {
		console.log("Techniques not found.");
		return { techniques: [], fullTechniques: [] };
	}

	// Crear una versión simplificada para el JSON
	const simplifiedTechniques = formattedTechniques.techniques.map(
		(technique) => ({
			id: technique.id,
			name: technique.name,
			description: technique.description,
			priority: technique.priority,
			content: technique.content,
			modifiedTimestamp: technique.modifiedTimestamp,
			mitreId: technique.mitreId,
			universalPriority: technique.universalPriority,
			subtechnique: technique.subtechnique,
			deprecated: technique.deprecated,
			createdTimestamp: technique.createdTimestamp,
			update: technique.update,
			stixId: technique.stixId,
		}),
	);

	return {
		techniques: simplifiedTechniques,
		fullTechniques: formattedTechniques.techniques,
	};
};
