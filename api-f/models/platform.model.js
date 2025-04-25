import { query, getClient } from "../persistence/dbConnection.js";

/**
 * Buscar todas las plataformas
 */
export async function findAll() {
	try {
		const result = await query("SELECT * FROM platforms ORDER BY id", []);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar plataformas:", error);
		throw new Error("Error al obtener las plataformas de la base de datos");
	}
}

/**
 * Buscar una plataforma por ID
 */
export async function findById(id) {
	try {
		const result = await query("SELECT * FROM platforms WHERE id = $1", [id]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error al buscar plataforma con ID ${id}:`, error);
		throw new Error(`Error al obtener la plataforma con ID ${id}`);
	}
}

/**
 * Buscar una plataforma con sus técnicas asociadas
 */
export async function findWithTechniques(id) {
	const client = await getClient();
	try {
		// Verificar si la plataforma existe
		const platformResult = await client.query(
			"SELECT * FROM platforms WHERE id = $1",
			[id],
		);

		if (platformResult.rows.length === 0) {
			return null;
		}

		const platform = platformResult.rows[0];

		// Obtener técnicas asociadas
		const techniquesResult = await client.query(
			`SELECT t.* 
       FROM techniques t
       JOIN technique_platform tp ON t.mitre_id = tp.technique_id
       WHERE tp.platform_id = $1`,
			[id],
		);

		return {
			...platform,
			techniques: techniquesResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener plataforma con técnicas para ID ${id}:`,
			error,
		);
		throw new Error(
			`Error al obtener la plataforma con técnicas para ID ${id}`,
		);
	} finally {
		client.release();
	}
}
