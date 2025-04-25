import * as techniqueModel from "../models/technique.model.js";

/**
 * Obtener todas las técnicas
 */
export async function getAllTechniques(req, res, next) {
	try {
		const techniques = await techniqueModel.findAll();
		res.json({ success: true, data: techniques });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una técnica por MITRE ID
 */
export async function getTechniqueByMitreId(req, res, next) {
	try {
		const technique = await techniqueModel.findByMitreId(req.params.mitreId);
		if (!technique) {
			const error = new Error("Técnica no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: technique });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una técnica con sus tácticas asociadas
 */
export async function getTechniqueWithTactics(req, res, next) {
	try {
		const techniqueWithTactics = await techniqueModel.findWithTactics(
			req.params.mitreId,
		);
		if (!techniqueWithTactics) {
			const error = new Error("Técnica no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: techniqueWithTactics });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una técnica con sus detecciones asociadas
 */
export async function getTechniqueWithDetections(req, res, next) {
	try {
		const techniqueWithDetections = await techniqueModel.findWithDetections(
			req.params.mitreId,
		);
		if (!techniqueWithDetections) {
			const error = new Error("Técnica no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: techniqueWithDetections });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una técnica con sus plataformas asociadas
 */
export async function getTechniqueWithPlatforms(req, res, next) {
	try {
		const techniqueWithPlatforms = await techniqueModel.findWithPlatforms(
			req.params.mitreId,
		);
		if (!techniqueWithPlatforms) {
			const error = new Error("Técnica no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: techniqueWithPlatforms });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una técnica con su software asociado
 */
export async function getTechniqueWithSoftware(req, res, next) {
	try {
		const techniqueWithSoftware = await techniqueModel.findWithSoftware(
			req.params.mitreId,
		);
		if (!techniqueWithSoftware) {
			const error = new Error("Técnica no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: techniqueWithSoftware });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una técnica con sus grupos de amenazas asociados
 */
export async function getTechniqueWithThreatGroups(req, res, next) {
	try {
		const techniqueWithThreatGroups = await techniqueModel.findWithThreatGroups(
			req.params.mitreId,
		);
		if (!techniqueWithThreatGroups) {
			const error = new Error("Técnica no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: techniqueWithThreatGroups });
	} catch (error) {
		next(error);
	}
}
