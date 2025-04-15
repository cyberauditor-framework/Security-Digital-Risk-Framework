import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import { getTacticsQuery } from "../providers/graphql/querys/tacticsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getTactics = async () => {
	const rawTactics = await graphqlFetch(ENDPOINT, getTacticsQuery, {}, HEADERS);

	const formattedTactics = cleanGraphQLResponse(rawTactics);

	const tactics = formattedTactics.tactics.map((edge) => ({
		id: edge.id,
		name: edge.name,
		description: edge.description,
		mitreId: edge.mitreId,
	}));

	if (!tactics || tactics.length === 0) {
		console.log("Tactics not found.");
	}

	return tactics;
};
