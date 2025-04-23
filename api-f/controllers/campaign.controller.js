import * as campaignModel from "../models/campaign.model.js";

/**
 * Obtener todas las campañas o filtrarlas por países e industrias
 */
export async function getAllCampaigns(req, res, next) {
	try {
		let campaigns;

		// Verificar si hay filtros de países o industrias
		const { countries, industries } = req.query;

		if (
			(countries && countries.length > 0) ||
			(industries && industries.length > 0)
		) {
			// Convertir a arrays si son strings
			const countriesArr = countries
				? Array.isArray(countries)
					? countries
					: [countries]
				: [];
			const industriesArr = industries
				? Array.isArray(industries)
					? industries
					: [industries]
				: [];

			campaigns = await campaignModel.findByFilters(
				countriesArr,
				industriesArr,
			);
		} else {
			campaigns = await campaignModel.findAll();
		}

		res.json({ success: true, data: campaigns });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una campaña por ID
 */
export async function getCampaignById(req, res, next) {
	try {
		const campaign = await campaignModel.findById(req.params.id);
		if (!campaign) {
			const error = new Error("Campaña no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: campaign });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una campaña con sus técnicas asociadas
 */
export async function getCampaignWithTechniques(req, res, next) {
	try {
		const campaignWithTechniques = await campaignModel.findWithTechniques(
			req.params.id,
		);
		if (!campaignWithTechniques) {
			const error = new Error("Campaña no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: campaignWithTechniques });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una campaña con su software asociado
 */
export async function getCampaignWithSoftware(req, res, next) {
	try {
		const campaignWithSoftware = await campaignModel.findWithSoftware(
			req.params.id,
		);
		if (!campaignWithSoftware) {
			const error = new Error("Campaña no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: campaignWithSoftware });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una campaña con sus grupos de amenazas asociados
 */
export async function getCampaignWithThreatGroups(req, res, next) {
	try {
		const campaignWithThreatGroups = await campaignModel.findWithThreatGroups(
			req.params.id,
		);
		if (!campaignWithThreatGroups) {
			const error = new Error("Campaña no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: campaignWithThreatGroups });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una campaña con sus vulnerabilidades asociadas
 */
export async function getCampaignWithVulnerabilities(req, res, next) {
	try {
		const campaignWithVulnerabilities =
			await campaignModel.findWithVulnerabilities(req.params.id);
		if (!campaignWithVulnerabilities) {
			const error = new Error("Campaña no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: campaignWithVulnerabilities });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una campaña con sus países asociados
 */
export async function getCampaignWithCountries(req, res, next) {
	try {
		const campaignWithCountries = await campaignModel.findWithCountries(
			req.params.id,
		);
		if (!campaignWithCountries) {
			const error = new Error("Campaña no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: campaignWithCountries });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una campaña con sus industrias asociadas
 */
export async function getCampaignWithIndustries(req, res, next) {
	try {
		const campaignWithIndustries = await campaignModel.findWithIndustries(
			req.params.id,
		);
		if (!campaignWithIndustries) {
			const error = new Error("Campaña no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: campaignWithIndustries });
	} catch (error) {
		next(error);
	}
}
