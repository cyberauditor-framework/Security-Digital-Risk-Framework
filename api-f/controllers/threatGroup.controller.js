import * as threatGroupModel from "../models/threatGroup.model.js";

/**
 * Obtener todos los grupos de amenazas
 */
export async function getAllThreatGroups(req, res, next) {
	try {
		const threatGroups = await threatGroupModel.findAll();
		res.json({ success: true, data: threatGroups });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener un grupo de amenazas por ID
 */
export async function getThreatGroupById(req, res, next) {
	try {
		const threatGroup = await threatGroupModel.findById(req.params.id);
		if (!threatGroup) {
			const error = new Error("Grupo de amenazas no encontrado");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: threatGroup });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener un grupo de amenazas con sus técnicas asociadas
 */
export async function getThreatGroupWithTechniques(req, res, next) {
	try {
		const threatGroupWithTechniques = await threatGroupModel.findWithTechniques(
			req.params.id,
		);
		if (!threatGroupWithTechniques) {
			const error = new Error("Grupo de amenazas no encontrado");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: threatGroupWithTechniques });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener un grupo de amenazas con sus campañas asociadas
 */
export async function getThreatGroupWithCampaigns(req, res, next) {
	try {
		const threatGroupWithCampaigns = await threatGroupModel.findWithCampaigns(
			req.params.id,
		);
		if (!threatGroupWithCampaigns) {
			const error = new Error("Grupo de amenazas no encontrado");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: threatGroupWithCampaigns });
	} catch (error) {
		next(error);
	}
}
