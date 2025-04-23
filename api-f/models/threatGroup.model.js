import { query, getClient } from "../persistence/dbConnection.js";

/**
 * Buscar todos los grupos de amenazas
 */
export async function findAll() {
	try {
		const result = await query("SELECT * FROM threat_groups ORDER BY id", []);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar grupos de amenazas:", error);
		throw new Error(
			"Error al obtener los grupos de amenazas de la base de datos",
		);
	}
}

/**
 * Buscar un grupo de amenazas por ID
 */
export async function findById(id) {
	try {
		const result = await query("SELECT * FROM threat_groups WHERE id = $1", [
			id,
		]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error al buscar grupo de amenazas con ID ${id}:`, error);
		throw new Error(`Error al obtener el grupo de amenazas con ID ${id}`);
	}
}

/**
 * Buscar un grupo de amenazas con sus técnicas asociadas
 */
export async function findWithTechniques(id) {
	const client = await getClient();
	try {
		// Verificar si el grupo de amenazas existe
		const threatGroupResult = await client.query(
			"SELECT * FROM threat_groups WHERE id = $1",
			[id],
		);

		if (threatGroupResult.rows.length === 0) {
			return null;
		}

		const threatGroup = threatGroupResult.rows[0];

		// Obtener técnicas asociadas con sus tácticas
		const techniquesResult = await client.query(
			`WITH technique_tactics AS (
                SELECT t.*, 
                       json_agg(
                           json_build_object(
                               'mitre_id', tac.mitre_id,
                               'name', tac.name,
                               'description', tac.description
                           )
                       ) as tactics
                FROM techniques t
                LEFT JOIN technique_tactic tt ON t.mitre_id = tt.technique_id
                LEFT JOIN tactics tac ON tt.tactic_id = tac.mitre_id
                WHERE EXISTS (
                    SELECT 1 
                    FROM threat_group_technique tgt 
                    WHERE tgt.technique_id = t.mitre_id 
                    AND tgt.threat_group_id = $1
                )
                GROUP BY t.mitre_id, t.name, t.description
            )
            SELECT * FROM technique_tactics`,
			[id],
		);

		return {
			...threatGroup,
			techniques: techniquesResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener grupo de amenazas con técnicas para ID ${id}:`,
			error,
		);
		throw new Error(
			`Error al obtener el grupo de amenazas con técnicas para ID ${id}`,
		);
	} finally {
		client.release();
	}
}

/**
 * Buscar un grupo de amenazas con sus campañas asociadas
 */
export async function findWithCampaigns(id) {
	const client = await getClient();
	try {
		// Verificar si el grupo de amenazas existe
		const threatGroupResult = await client.query(
			"SELECT * FROM threat_groups WHERE id = $1",
			[id],
		);

		if (threatGroupResult.rows.length === 0) {
			return null;
		}

		const threatGroup = threatGroupResult.rows[0];

		// Obtener campañas asociadas
		const campaignsResult = await client.query(
			`SELECT c.* 
       FROM campaigns c
       JOIN campaign_threat_group ctg ON c.id = ctg.campaign_id
       WHERE ctg.threat_group_id = $1`,
			[id],
		);

		return {
			...threatGroup,
			campaigns: campaignsResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener grupo de amenazas con campañas para ID ${id}:`,
			error,
		);
		throw new Error(
			`Error al obtener el grupo de amenazas con campañas para ID ${id}`,
		);
	} finally {
		client.release();
	}
}
