import * as detectionModel from "../models/detection.model.js";

/**
 * Obtener todas las detecciones
 */
export async function getAllDetections(req, res, next) {
	try {
		const detections = await detectionModel.findAll();
		res.json({ success: true, data: detections });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una detección por ID
 */
export async function getDetectionById(req, res, next) {
	try {
		const detection = await detectionModel.findById(req.params.id);
		if (!detection) {
			const error = new Error("Detección no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: detection });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una detección con sus técnicas asociadas
 */
export async function getDetectionWithTechniques(req, res, next) {
	try {
		const detectionWithTechniques = await detectionModel.findWithTechniques(
			req.params.id,
		);
		if (!detectionWithTechniques) {
			const error = new Error("Detección no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: detectionWithTechniques });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una detección con su software asociado
 */
export async function getDetectionWithSoftware(req, res, next) {
	try {
		const detectionWithSoftware = await detectionModel.findWithSoftware(
			req.params.id,
		);
		if (!detectionWithSoftware) {
			const error = new Error("Detección no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: detectionWithSoftware });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una detección con sus grupos de amenazas asociados
 */
export async function getDetectionWithThreatGroups(req, res, next) {
	try {
		const detectionWithThreatGroups = await detectionModel.findWithThreatGroups(
			req.params.id,
		);
		if (!detectionWithThreatGroups) {
			const error = new Error("Detección no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: detectionWithThreatGroups });
	} catch (error) {
		next(error);
	}
}
