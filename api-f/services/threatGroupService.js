import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import { getThreatGroupsQuery } from "../providers/graphql/querys/threatGroupsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getThreatGroups = async () => {
	const rawThreatGroups = await graphqlFetch(
		ENDPOINT,
		getThreatGroupsQuery,
		{},
		HEADERS,
	);

	const formattedThreatGroups = cleanGraphQLResponse(rawThreatGroups);

	const threatGroups = formattedThreatGroups.threatGroups.map((edge) => ({
		id: edge.id,
		name: edge.name,
		description: edge.description,
	}));

	if (!threatGroups || threatGroups.length === 0) {
		console.log("Threat Groups not found.");
	}

	return threatGroups;
};
