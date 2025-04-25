import { query, getClient } from "../persistence/dbConnection.js";

/**
 * Buscar todas las integraciones
 */
export async function findAll() {
	try {
		const result = await query("SELECT * FROM integrations ORDER BY id", []);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar integraciones:", error);
		throw new Error("Error al obtener las integraciones de la base de datos");
	}
}

/**
 * Buscar una integración por ID
 */
export async function findById(id) {
	try {
		const result = await query("SELECT * FROM integrations WHERE id = $1", [
			id,
		]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error al buscar integración con ID ${id}:`, error);
		throw new Error(`Error al obtener la integración con ID ${id}`);
	}
}

/**
 * Buscar una integración con sus detecciones asociadas
 */
export async function findWithDetections(id) {
	const client = await getClient();
	try {
		// Verificar si la integración existe
		const integrationResult = await client.query(
			"SELECT * FROM integrations WHERE id = $1",
			[id],
		);

		if (integrationResult.rows.length === 0) {
			return null;
		}

		const integration = integrationResult.rows[0];

		// Obtener detecciones asociadas por el nombre de integración
		const detectionsResult = await client.query(
			`SELECT * 
       FROM detections 
       WHERE integration_name = $1`,
			[integration.name],
		);

		return {
			...integration,
			detections: detectionsResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener integración con detecciones para ID ${id}:`,
			error,
		);
		throw new Error(
			`Error al obtener la integración con detecciones para ID ${id}`,
		);
	} finally {
		client.release();
	}
}
