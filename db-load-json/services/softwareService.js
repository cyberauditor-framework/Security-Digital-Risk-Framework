import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import { getSoftwareQuery } from "../providers/graphql/querys/softwareQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getSoftware = async () => {
	console.log("Fetching software with pagination...");
	const rawSoftware = await graphqlFetch(
		ENDPOINT,
		getSoftwareQuery,
		{ offset: 0, pageSize: 100 },
		HEADERS,
	);

	const formattedSoftware = cleanGraphQLResponse(rawSoftware);

	// Log the total vs fetched count
	console.log(
		`Successfully fetched ${formattedSoftware.software.length} software items out of ${rawSoftware.software.totalCount} total`,
	);

	const software = formattedSoftware.software.map((edge) => ({
		id: edge.mitreId,
		name: edge.name,
		description: edge.description,
	}));

	if (!software || software.length === 0) {
		console.log("Software not found.");
	}

	return software;
};
