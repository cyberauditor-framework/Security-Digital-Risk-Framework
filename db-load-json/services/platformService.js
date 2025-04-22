import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import { getPlatformsQuery } from "../providers/graphql/querys/platformsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getPlatforms = async () => {
	console.log("Fetching platforms with pagination...");
	const rawPlatforms = await graphqlFetch(
		ENDPOINT,
		getPlatformsQuery,
		{ offset: 0, pageSize: 100 },
		HEADERS,
	);

	const formattedPlatforms = cleanGraphQLResponse(rawPlatforms);

	// Log the total vs fetched count
	console.log(
		`Successfully fetched ${formattedPlatforms.platforms.length} platforms out of ${rawPlatforms.platforms.totalCount} total`,
	);

	const platforms = formattedPlatforms.platforms.map((edge) => ({
		id: edge.id,
		name: edge.name,
		description: edge.description,
	}));

	if (!platforms || platforms.length === 0) {
		console.log("Platforms not found.");
	}

	return platforms;
};
