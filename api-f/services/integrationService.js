import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import { getIntegrationsQuery } from "../providers/graphql/querys/integrationsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getIntegrations = async () => {
	const rawIntegrations = await graphqlFetch(
		ENDPOINT,
		getIntegrationsQuery,
		{},
		HEADERS,
	);

	const formattedIntegrations = cleanGraphQLResponse(rawIntegrations);

	const integrations = formattedIntegrations.integrations.map((edge) => ({
		id: edge.id,
		name: edge.name,
		uuid: edge.uuid,
		description: edge.description,
	}));

	if (!integrations || integrations.length === 0) {
		console.log("Integrations not found.");
	}

	return integrations;
};
