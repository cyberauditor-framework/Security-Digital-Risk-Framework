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
	const rawSoftware = await graphqlFetch(
		ENDPOINT,
		getSoftwareQuery,
		{},
		HEADERS,
	);

	const formattedSoftware = cleanGraphQLResponse(rawSoftware);
	//console.log(formattedSoftware);

	const software = formattedSoftware.software.map((edge) => ({
		id: edge.id,
		name: edge.name,
		description: edge.description,
	}));

	if (!software || software.length === 0) {
		console.log("Software not found.");
	}

	return software;
};
