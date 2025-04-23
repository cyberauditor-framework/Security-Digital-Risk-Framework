import { query, getClient } from "../persistence/dbConnection.js";

/**
 * Buscar todas las campañas
 */
export async function findAll() {
	try {
		const result = await query("SELECT * FROM campaigns ORDER BY id", []);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar campañas:", error);
		throw new Error("Error al obtener las campañas de la base de datos");
	}
}

/**
 * Buscar una campaña por ID
 */
export async function findById(id) {
	try {
		const result = await query("SELECT * FROM campaigns WHERE id = $1", [id]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error al buscar campaña con ID ${id}:`, error);
		throw new Error(`Error al obtener la campaña con ID ${id}`);
	}
}

/**
 * Buscar una campaña con sus técnicas asociadas
 */
export async function findWithTechniques(id) {
	const client = await getClient();
	try {
		// Verificar si la campaña existe
		const campaignResult = await client.query(
			"SELECT * FROM campaigns WHERE id = $1",
			[id],
		);

		if (campaignResult.rows.length === 0) {
			return null;
		}

		const campaign = campaignResult.rows[0];

		// Obtener técnicas asociadas
		const techniquesResult = await client.query(
			`SELECT t.* 
       FROM techniques t
       JOIN campaign_technique ct ON t.mitre_id = ct.technique_id
       WHERE ct.campaign_id = $1`,
			[id],
		);

		return {
			...campaign,
			techniques: techniquesResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener campaña con técnicas para ID ${id}:`,
			error,
		);
		throw new Error(`Error al obtener la campaña con técnicas para ID ${id}`);
	} finally {
		client.release();
	}
}

/**
 * Buscar una campaña con su software asociado
 */
export async function findWithSoftware(id) {
	const client = await getClient();
	try {
		// Verificar si la campaña existe
		const campaignResult = await client.query(
			"SELECT * FROM campaigns WHERE id = $1",
			[id],
		);

		if (campaignResult.rows.length === 0) {
			return null;
		}

		const campaign = campaignResult.rows[0];

		// Obtener software asociado
		const softwareResult = await client.query(
			`SELECT s.* 
       FROM software s
       JOIN campaign_software cs ON s.id = cs.software_id
       WHERE cs.campaign_id = $1`,
			[id],
		);

		return {
			...campaign,
			software: softwareResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener campaña con software para ID ${id}:`,
			error,
		);
		throw new Error(`Error al obtener la campaña con software para ID ${id}`);
	} finally {
		client.release();
	}
}

/**
 * Buscar una campaña con sus grupos de amenazas asociados
 */
export async function findWithThreatGroups(id) {
	const client = await getClient();
	try {
		// Verificar si la campaña existe
		const campaignResult = await client.query(
			"SELECT * FROM campaigns WHERE id = $1",
			[id],
		);

		if (campaignResult.rows.length === 0) {
			return null;
		}

		const campaign = campaignResult.rows[0];

		// Obtener grupos de amenazas asociados
		const threatGroupsResult = await client.query(
			`SELECT tg.* 
       FROM threat_groups tg
       JOIN campaign_threat_group ctg ON tg.id = ctg.threat_group_id
       WHERE ctg.campaign_id = $1`,
			[id],
		);

		return {
			...campaign,
			threatGroups: threatGroupsResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener campaña con grupos de amenazas para ID ${id}:`,
			error,
		);
		throw new Error(
			`Error al obtener la campaña con grupos de amenazas para ID ${id}`,
		);
	} finally {
		client.release();
	}
}

/**
 * Buscar una campaña con sus vulnerabilidades asociadas
 */
export async function findWithVulnerabilities(id) {
	const client = await getClient();
	try {
		// Verificar si la campaña existe
		const campaignResult = await client.query(
			"SELECT * FROM campaigns WHERE id = $1",
			[id],
		);

		if (campaignResult.rows.length === 0) {
			return null;
		}

		const campaign = campaignResult.rows[0];

		// Obtener vulnerabilidades asociadas
		const vulnerabilitiesResult = await client.query(
			`SELECT v.* 
       FROM vulnerabilities v
       JOIN campaign_vulnerability cv ON v.id = cv.vulnerability_id
       WHERE cv.campaign_id = $1`,
			[id],
		);

		return {
			...campaign,
			vulnerabilities: vulnerabilitiesResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener campaña con vulnerabilidades para ID ${id}:`,
			error,
		);
		throw new Error(
			`Error al obtener la campaña con vulnerabilidades para ID ${id}`,
		);
	} finally {
		client.release();
	}
}
