import {
	graphqlFetch,
	cleanGraphQLResponse,
} from "../providers/graphql/graphqlClient.js";
import {
	getCampaignsQuery,
	getCampaignsQueryWithThreatProfile,
	getCampaignDetailQuery,
} from "../providers/graphql/querys/campaignsQuery.js";

const ENDPOINT = "https://interpres.io/api/graphql/";

const HEADERS = {
	Cookie: process.env.COOKIE,
};

export const getCampaigns = async () => {
	try {
		const getCampaignsQueryVariable = {
			offset: 0,
			name_Icontains: "",
			origins: "",
			content: "",
			showOnlyWithExploits: false,
			limitCampaigns: false,
			techniqueMitreIds: "",
			softwareMitreIds: "",
			threatGroupsMitreIds: "",
			industries: [],
			countries: [],
			pageSize: 100,
			orderBy: "-createdTimestamp",
		};

		console.log("Fetching campaigns with pagination...");
		const rawCampaigns = await graphqlFetch(
			ENDPOINT,
			getCampaignsQuery,
			getCampaignsQueryVariable,
			HEADERS,
		);

		const formattedCampaigns = cleanGraphQLResponse(rawCampaigns);

		if (
			!formattedCampaigns ||
			!formattedCampaigns.prioritizedCampaigns ||
			formattedCampaigns.prioritizedCampaigns.length === 0
		) {
			console.log("Campaigns not found.");
			return { campaigns: [], fullCampaigns: [] };
		}

		// Log the total campaigns vs fetched campaigns
		console.log(
			`Successfully fetched ${formattedCampaigns.prioritizedCampaigns.length} campaigns out of ${rawCampaigns.prioritizedCampaigns.totalCount} total campaigns`,
		);

		// Crear una versión simplificada para el JSON
		const simplifiedCampaigns = formattedCampaigns.prioritizedCampaigns.map(
			(campaign) => ({
				id: campaign.campaign?.id || campaign.id,
				interpressId: campaign.id,
				name: campaign.name,
				stixId: campaign.stixId,
				description: campaign.description,
				deprecated: campaign.deprecated,
				revoked: campaign.revoked,
				createdTimestamp: campaign.createdTimestamp,
				modifiedTimestamp: campaign.modifiedTimestamp,
				origin: campaign.origin || "",
				priority: campaign.priority || 0,
				firstSeenTimestamp: campaign.firstSeenTimestamp,
				lastSeenTimestamp: campaign.lastSeenTimestamp,
				aliasNames: campaign.aliasNames || [],
				vulnerabilityCveIds: campaign.vulnerabilityCveIds || [],
				referenceUrls: campaign.referenceUrls || [],
				industries: campaign.industries || [],
				countries: campaign.countries || [],
			}),
		);

		// Construir los fullCampaigns conservando las propiedades relevantes del nivel superior
		const fullCampaignsWithIndustriesAndCountries =
			formattedCampaigns.prioritizedCampaigns
				.map((campaign) => {
					// Solo considerar campañas que tienen el objeto campaign interno
					if (!campaign.campaign) return null;

					// Combinar el objeto campaign interno con las propiedades de nivel superior
					return {
						...campaign.campaign,
						interpressId: campaign.id,
						industries: campaign.industries || [],
						countries: campaign.countries || [],
					};
				})
				.filter(Boolean);

		return {
			campaigns: simplifiedCampaigns,
			fullCampaigns: fullCampaignsWithIndustriesAndCountries,
		};
	} catch (error) {
		console.error("Error fetching campaigns:", error);
		throw error;
	}
};

export const getCampaignsWithThreatProfile = async () => {
	const getCampaignsQueryVariable = {
		offset: 0,
		name_Icontains: "",
		origins: "",
		content: "0,100",
		showOnlyWithExploits: false,
		limitCampaigns: true,
		techniqueMitreIds: "",
		softwareMitreIds: "",
		threatGroupsMitreIds: "",
		industries: ["FINANCE_AND_INSURANCE"],
		countries: ["DEU"],
		pageSize: 100,
		orderBy: "-createdTimestamp",
	};

	const rawCampaigns = await graphqlFetch(
		ENDPOINT,
		getCampaignsQueryWithThreatProfile,
		getCampaignsQueryVariable,
		HEADERS,
	);

	const formattedCampaigns = cleanGraphQLResponse(rawCampaigns);
	console.log(
		"test",
		JSON.stringify(rawCampaigns.prioritizedCampaigns, null, 2),
	);

	if (
		!formattedCampaigns ||
		!formattedCampaigns.prioritizedCampaigns ||
		formattedCampaigns.prioritizedCampaigns.length === 0
	) {
		console.log("Campaigns not found.");
		return { campaigns: [], fullCampaigns: [] };
	}

	// Crear una versión simplificada para el JSON
	const simplifiedCampaigns = formattedCampaigns.prioritizedCampaigns.map(
		(campaign) => ({
			id: campaign.campaign?.id || campaign.id,
			interpressId: campaign.id,
			name: campaign.name,
			stixId: campaign.stixId,
			description: campaign.description,
			deprecated: campaign.deprecated,
			revoked: campaign.revoked,
			createdTimestamp: campaign.createdTimestamp,
			modifiedTimestamp: campaign.modifiedTimestamp,
			update: campaign.update,
			type: campaign.type,
			origin: campaign.origin,
			firstSeenTimestamp: campaign.firstSeenTimestamp,
			lastSeenTimestamp: campaign.lastSeenTimestamp,
			aliasNames: campaign.aliasNames,
			techniquesCount: campaign.techniquesCount,
			softwareCount: campaign.softwareCount,
			threatGroupsCount: campaign.threatGroupsCount,
			vulnerabilityCveIds: campaign.vulnerabilityCveIds,
			vulnerabilitiesCount: campaign.vulnerabilitiesCount,
			assetsCount: campaign.assetsCount,
		}),
	);

	// Construir los fullCampaigns conservando las propiedades relevantes del nivel superior
	const fullCampaignsWithIndustriesAndCountries =
		formattedCampaigns.prioritizedCampaigns
			.map((campaign) => {
				// Solo considerar campañas que tienen el objeto campaign interno
				if (!campaign.campaign) return null;

				// Combinar el objeto campaign interno con las propiedades de nivel superior
				return {
					...campaign.campaign,
					interpressId: campaign.id,
					industries: campaign.industries || [],
					countries: campaign.countries || [],
				};
			})
			.filter(Boolean);

	return {
		campaigns: simplifiedCampaigns,
		fullCampaigns: fullCampaignsWithIndustriesAndCountries,
	};
};

export const getCampaignDetail = async (campaignId) => {
	const getCampaignDetailQueryVariable = {
		id: campaignId,
	};

	const rawCampaignDetail = await graphqlFetch(
		ENDPOINT,
		getCampaignDetailQuery,
		getCampaignDetailQueryVariable,
		HEADERS,
	);

	const formattedCampaignDetail = cleanGraphQLResponse(rawCampaignDetail);

	if (
		!formattedCampaignDetail ||
		!formattedCampaignDetail.campaigns ||
		formattedCampaignDetail.campaigns.length === 0
	) {
		console.log("Campaign detail not found.");
		return null;
	}

	const campaign = formattedCampaignDetail.campaigns[0];

	return {
		...campaign,
		techniques: campaign.techniques || [],
		software: campaign.software || [],
		threatGroups: campaign.threatGroups || [],
		vulnerabilities: campaign.vulnerabilities || [],
	};
};
