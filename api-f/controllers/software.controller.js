import * as softwareModel from "../models/software.model.js";

/**
 * Obtener todo el software
 */
export async function getAllSoftware(req, res, next) {
	try {
		const software = await softwareModel.findAll();
		res.json({ success: true, data: software });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener un software por ID
 */
export async function getSoftwareById(req, res, next) {
	try {
		const software = await softwareModel.findById(req.params.id);
		if (!software) {
			const error = new Error("Software no encontrado");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: software });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener un software con sus técnicas asociadas
 */
export async function getSoftwareWithTechniques(req, res, next) {
	try {
		const softwareWithTechniques = await softwareModel.findWithTechniques(
			req.params.id,
		);
		if (!softwareWithTechniques) {
			const error = new Error("Software no encontrado");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: softwareWithTechniques });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener un software con sus campañas asociadas
 */
export async function getSoftwareWithCampaigns(req, res, next) {
	try {
		const softwareWithCampaigns = await softwareModel.findWithCampaigns(
			req.params.id,
		);
		if (!softwareWithCampaigns) {
			const error = new Error("Software no encontrado");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: softwareWithCampaigns });
	} catch (error) {
		next(error);
	}
}
