import { query, getClient } from "../persistence/dbConnection.js";

/**
 * Buscar todas las tácticas
 */
export async function findAll() {
	try {
		const result = await query("SELECT * FROM tactics ORDER BY mitre_id", []);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar tácticas:", error);
		throw new Error("Error al obtener las tácticas de la base de datos");
	}
}

/**
 * Buscar una táctica por MITRE ID
 */
export async function findByMitreId(mitreId) {
	try {
		const result = await query("SELECT * FROM tactics WHERE mitre_id = $1", [
			mitreId,
		]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error al buscar táctica con MITRE ID ${mitreId}:`, error);
		throw new Error(`Error al obtener la táctica con MITRE ID ${mitreId}`);
	}
}

/**
 * Buscar una táctica con sus técnicas asociadas
 */
export async function findWithTechniques(mitreId) {
	const client = await getClient();
	try {
		// Verificar si la táctica existe
		const tacticResult = await client.query(
			"SELECT * FROM tactics WHERE mitre_id = $1",
			[mitreId],
		);

		if (tacticResult.rows.length === 0) {
			return null;
		}

		const tactic = tacticResult.rows[0];

		// Obtener técnicas asociadas
		const techniquesResult = await client.query(
			`SELECT t.* 
       FROM techniques t
       JOIN technique_tactic tt ON t.mitre_id = tt.technique_id
       WHERE tt.tactic_id = $1`,
			[mitreId],
		);

		return {
			...tactic,
			techniques: techniquesResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener táctica con técnicas para MITRE ID ${mitreId}:`,
			error,
		);
		throw new Error(
			`Error al obtener la táctica con técnicas para MITRE ID ${mitreId}`,
		);
	} finally {
		client.release();
	}
}
