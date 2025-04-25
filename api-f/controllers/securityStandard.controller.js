import * as securityStandardModel from "../models/securityStandard.model.js";

/**
 * Obtener todos los mapeos de estándares de seguridad
 */
export async function getAllSecurityStandards(req, res, next) {
	try {
		const securityStandards = await securityStandardModel.findAll();
		res.json({ success: true, data: securityStandards });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener un mapeo de estándar de seguridad por ID MITRE
 */
export async function getSecurityStandardByMitreId(req, res, next) {
	try {
		const securityStandard = await securityStandardModel.findByMitreId(
			req.params.idMitre,
		);
		if (!securityStandard) {
			const error = new Error("Mapeo de estándar de seguridad no encontrado");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: securityStandard });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener mapeos de estándares de seguridad por estándar
 */
export async function getSecurityStandardsByStandard(req, res, next) {
	try {
		const securityStandards = await securityStandardModel.findByStandard(
			req.params.standard,
		);
		res.json({ success: true, data: securityStandards });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener mapeos de estándares de seguridad por ID de control
 */
export async function getSecurityStandardsByControlId(req, res, next) {
	try {
		const securityStandards = await securityStandardModel.findByControlId(
			req.params.controlId,
		);
		res.json({ success: true, data: securityStandards });
	} catch (error) {
		next(error);
	}
}
