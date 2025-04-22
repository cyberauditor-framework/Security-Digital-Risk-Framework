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
	console.log("Fetching tactics with pagination...");
	const rawTactics = await graphqlFetch(
		ENDPOINT,
		getTacticsQuery,
		{ offset: 0, pageSize: 100 },
		HEADERS,
	);

	const formattedTactics = cleanGraphQLResponse(rawTactics);

	console.log(
		`Successfully fetched ${formattedTactics.tactics.length} tactics out of ${rawTactics.tactics.totalCount} total`,
	);

	const tactics = formattedTactics.tactics.map((edge) => ({
		mitreId: edge.mitreId,
		name: edge.name,
		description: edge.description,
	}));

	if (!tactics || tactics.length === 0) {
		console.log("Tactics not found.");
	}

	return tactics;
};
