import * as platformModel from "../models/platform.model.js";

/**
 * Obtener todas las plataformas
 */
export async function getAllPlatforms(req, res, next) {
	try {
		const platforms = await platformModel.findAll();
		res.json({ success: true, data: platforms });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una plataforma por ID
 */
export async function getPlatformById(req, res, next) {
	try {
		const platform = await platformModel.findById(req.params.id);
		if (!platform) {
			const error = new Error("Plataforma no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: platform });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una plataforma con sus técnicas asociadas
 */
export async function getPlatformWithTechniques(req, res, next) {
	try {
		const platformWithTechniques = await platformModel.findWithTechniques(
			req.params.id,
		);
		if (!platformWithTechniques) {
			const error = new Error("Plataforma no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: platformWithTechniques });
	} catch (error) {
		next(error);
	}
}
