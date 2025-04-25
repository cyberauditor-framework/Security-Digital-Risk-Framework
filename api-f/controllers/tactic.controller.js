import * as tacticModel from "../models/tactic.model.js";

/**
 * Obtener todas las tácticas
 */
export async function getAllTactics(req, res, next) {
	try {
		const tactics = await tacticModel.findAll();
		res.json({ success: true, data: tactics });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una táctica por MITRE ID
 */
export async function getTacticByMitreId(req, res, next) {
	try {
		const tactic = await tacticModel.findByMitreId(req.params.mitreId);
		if (!tactic) {
			const error = new Error("Táctica no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: tactic });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una táctica con sus técnicas asociadas
 */
export async function getTacticWithTechniques(req, res, next) {
	try {
		const tacticWithTechniques = await tacticModel.findWithTechniques(
			req.params.mitreId,
		);
		if (!tacticWithTechniques) {
			const error = new Error("Táctica no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: tacticWithTechniques });
	} catch (error) {
		next(error);
	}
}
