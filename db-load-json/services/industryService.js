import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getIndustries = async () => {
	try {
		const query = `
      query Industries {
        industries {
          value
          label
        }
      }
    `;

		const rawIndustries = await graphqlFetch(ENDPOINT, query, {}, HEADERS);

		const formattedIndustries = cleanGraphQLResponse(rawIndustries);

		if (!formattedIndustries || !formattedIndustries.industries) {
			throw new Error("Failed to fetch industries data");
		}

		return formattedIndustries.industries;
	} catch (error) {
		console.error("Error fetching industries:", error);
		throw error;
	}
};
