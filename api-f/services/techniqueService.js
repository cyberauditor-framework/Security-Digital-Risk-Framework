import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import { getTechniquesQuery } from "../providers/graphql/querys/techniquesQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getTechniques = async () => {
	const getTechniquesQueryVariable = {
		offset: 0,
		searchNameOrMitreId: "",
		tacticNames: "",
		integrationNames: "",
		platformNames: "",
		priority: "",
		content: "",
		mitreIds: "",
		campaignStixIds: "",
		softwareMitreIds: "",
		threatGroupMitreIds: "",
		telemetrySubcategoryNames: "",
		controlStixIds: "",
		telemetrySubcategoryId: "",
		countries: [],
		industries: [],
		pageSize: 10,
		domainName: "",
		orderBy: "-priority",
	};

	const rawTechniques = await graphqlFetch(
		ENDPOINT,
		getTechniquesQuery,
		getTechniquesQueryVariable,
		HEADERS,
	);

	const formattedTechniques = cleanGraphQLResponse(rawTechniques);

	const techniques = formattedTechniques.prioritizedTechniques;

	if (!techniques || techniques.length === 0) {
		console.log("Techniques not found.");
	}

	return techniques;
};
