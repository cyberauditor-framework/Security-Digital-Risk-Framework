import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import { getDetectionsQuery } from "../providers/graphql/querys/detectionsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getDetections = async () => {
	const getDetectionsQueryVariable = {
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

	const rawDetections = await graphqlFetch(
		ENDPOINT,
		getDetectionsQuery,
		getDetectionsQueryVariable,
		HEADERS,
	);

	const formattedDetections = cleanGraphQLResponse(rawDetections);

	if (
		!formattedDetections ||
		!formattedDetections.detections ||
		formattedDetections.detections.length === 0
	) {
		console.log("Detections not found.");
		return [];
	}

	return formattedDetections.detections;
};
