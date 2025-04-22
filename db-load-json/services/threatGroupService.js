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
	console.log("Fetching threat groups with pagination...");
	const rawThreatGroups = await graphqlFetch(
		ENDPOINT,
		getThreatGroupsQuery,
		{ offset: 0, pageSize: 100 },
		HEADERS,
	);

	const formattedThreatGroups = cleanGraphQLResponse(rawThreatGroups);

	// Log the total vs fetched count
	console.log(
		`Successfully fetched ${formattedThreatGroups.threatGroups.length} threat groups out of ${rawThreatGroups.threatGroups.totalCount} total`,
	);

	// Format simplified threat groups for normal use
	const threatGroups = formattedThreatGroups.threatGroups.map(
		(threatGroup) => ({
			id: threatGroup.mitreId,
			name: threatGroup.name,
			description: threatGroup.description,
		}),
	);

	// Format full threat groups with techniques for relationship processing
	const fullThreatGroups = formattedThreatGroups.threatGroups.map(
		(threatGroup) => {
			// Extract techniques if they exist
			const techniques =
				threatGroup.techniques?.map((technique) => ({
					mitreId: technique.mitreId,
					name: technique.name,
				})) || [];

			return {
				mitreId: threatGroup.mitreId,
				name: threatGroup.name,
				description: threatGroup.description,
				techniques: techniques,
			};
		},
	);

	if (!threatGroups || threatGroups.length === 0) {
		console.log("Threat Groups not found.");
	}

	return { threatGroups, fullThreatGroups };
};
