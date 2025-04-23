import { query, getClient } from "../persistence/dbConnection.js";

/**
 * Buscar todo el software
 */
export async function findAll() {
	try {
		const result = await query("SELECT * FROM software ORDER BY id", []);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar software:", error);
		throw new Error("Error al obtener el software de la base de datos");
	}
}

/**
 * Buscar un software por ID
 */
export async function findById(id) {
	try {
		const result = await query("SELECT * FROM software WHERE id = $1", [id]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error al buscar software con ID ${id}:`, error);
		throw new Error(`Error al obtener el software con ID ${id}`);
	}
}

/**
 * Buscar un software con sus técnicas asociadas
 */
export async function findWithTechniques(id) {
	const client = await getClient();
	try {
		// Verificar si el software existe
		const softwareResult = await client.query(
			"SELECT * FROM software WHERE id = $1",
			[id],
		);

		if (softwareResult.rows.length === 0) {
			return null;
		}

		const software = softwareResult.rows[0];

		// Obtener técnicas asociadas
		const techniquesResult = await client.query(
			`SELECT t.* 
       FROM techniques t
       JOIN technique_software ts ON t.mitre_id = ts.technique_id
       WHERE ts.software_id = $1`,
			[id],
		);

		return {
			...software,
			techniques: techniquesResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener software con técnicas para ID ${id}:`,
			error,
		);
		throw new Error(`Error al obtener el software con técnicas para ID ${id}`);
	} finally {
		client.release();
	}
}

/**
 * Buscar un software con sus campañas asociadas
 */
export async function findWithCampaigns(id) {
	const client = await getClient();
	try {
		// Verificar si el software existe
		const softwareResult = await client.query(
			"SELECT * FROM software WHERE id = $1",
			[id],
		);

		if (softwareResult.rows.length === 0) {
			return null;
		}

		const software = softwareResult.rows[0];

		// Obtener campañas asociadas
		const campaignsResult = await client.query(
			`SELECT c.* 
       FROM campaigns c
       JOIN campaign_software cs ON c.id = cs.campaign_id
       WHERE cs.software_id = $1`,
			[id],
		);

		return {
			...software,
			campaigns: campaignsResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener software con campañas para ID ${id}:`,
			error,
		);
		throw new Error(`Error al obtener el software con campañas para ID ${id}`);
	} finally {
		client.release();
	}
}
