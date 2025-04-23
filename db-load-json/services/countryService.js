import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getCountries = async () => {
	try {
		const query = `
      query Countries {
        countries {
          value
          label
        }
      }
    `;

		const rawCountries = await graphqlFetch(ENDPOINT, query, {}, HEADERS);

		const formattedCountries = cleanGraphQLResponse(rawCountries);

		if (!formattedCountries || !formattedCountries.countries) {
			throw new Error("Failed to fetch countries data");
		}

		return formattedCountries.countries;
	} catch (error) {
		console.error("Error fetching countries:", error);
		throw error;
	}
};
