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
	const rawPlatforms = await graphqlFetch(
		ENDPOINT,
		getPlatformsQuery,
		{},
		HEADERS,
	);

	const formattedPlatforms = cleanGraphQLResponse(rawPlatforms);

	const platforms = formattedPlatforms.platformNames;

	if (!platforms || platforms.length === 0) {
		console.log("Platforms not found.");
	}

	return platforms;
};
