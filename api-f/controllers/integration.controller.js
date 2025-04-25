import * as integrationModel from "../models/integration.model.js";

/**
 * Obtener todas las integraciones
 */
export async function getAllIntegrations(req, res, next) {
	try {
		const integrations = await integrationModel.findAll();
		res.json({ success: true, data: integrations });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una integración por ID
 */
export async function getIntegrationById(req, res, next) {
	try {
		const integration = await integrationModel.findById(req.params.id);
		if (!integration) {
			const error = new Error("Integración no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: integration });
	} catch (error) {
		next(error);
	}
}

/**
 * Obtener una integración con sus detecciones asociadas
 */
export async function getIntegrationWithDetections(req, res, next) {
	try {
		const integrationWithDetections = await integrationModel.findWithDetections(
			req.params.id,
		);
		if (!integrationWithDetections) {
			const error = new Error("Integración no encontrada");
			error.status = 404;
			throw error;
		}
		res.json({ success: true, data: integrationWithDetections });
	} catch (error) {
		next(error);
	}
}
