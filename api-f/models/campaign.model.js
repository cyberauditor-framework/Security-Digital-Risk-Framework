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
 * Buscar campañas por filtros de países y/o industrias
 */
export async function findByFilters(countries = [], industries = []) {
	const client = await getClient();
	try {
		let queryStr = "SELECT DISTINCT c.* FROM campaigns c";
		const params = [];
		let paramCounter = 1;
		let hasConditions = false;

		// Si hay filtros de países
		if (countries && countries.length > 0) {
			queryStr +=
				" JOIN campaign_country cc ON c.id = cc.campaign_id WHERE cc.country_id IN (";
			countries.forEach((_, index) => {
				queryStr += index === 0 ? `$${paramCounter++}` : `, $${paramCounter++}`;
				params.push(countries[index]);
			});
			queryStr += ")";
			hasConditions = true;
		}

		// Si hay filtros de industrias
		if (industries && industries.length > 0) {
			if (hasConditions) {
				// Ya teníamos condición WHERE, hay que usar AND
				queryStr +=
					" AND c.id IN (SELECT campaign_id FROM campaign_industry ci WHERE ci.industry_id IN (";
			} else {
				// No había condición WHERE, añadirla
				queryStr +=
					" JOIN campaign_industry ci ON c.id = ci.campaign_id WHERE ci.industry_id IN (";
				hasConditions = true;
			}

			industries.forEach((_, index) => {
				queryStr += index === 0 ? `$${paramCounter++}` : `, $${paramCounter++}`;
				params.push(industries[index]);
			});

			queryStr += countries && countries.length > 0 ? "))" : ")";
		}

		queryStr += " ORDER BY c.id";

		const result = await client.query(queryStr, params);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar campañas por filtros:", error);
		throw new Error(
			"Error al obtener las campañas filtradas de la base de datos",
		);
	} finally {
		client.release();
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

/**
 * Buscar una campaña con sus países asociados
 */
export async function findWithCountries(id) {
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

		// Obtener países asociados
		const countriesResult = await client.query(
			`SELECT c.* 
       FROM countries c
       JOIN campaign_country cc ON c.value = cc.country_id
       WHERE cc.campaign_id = $1`,
			[id],
		);

		return {
			...campaign,
			countries: countriesResult.rows,
		};
	} catch (error) {
		console.error(`Error al obtener campaña con países para ID ${id}:`, error);
		throw new Error(`Error al obtener la campaña con países para ID ${id}`);
	} finally {
		client.release();
	}
}

/**
 * Buscar una campaña con sus industrias asociadas
 */
export async function findWithIndustries(id) {
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

		// Obtener industrias asociadas
		const industriesResult = await client.query(
			`SELECT i.* 
       FROM industries i
       JOIN campaign_industry ci ON i.value = ci.industry_id
       WHERE ci.campaign_id = $1`,
			[id],
		);

		return {
			...campaign,
			industries: industriesResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener campaña con industrias para ID ${id}:`,
			error,
		);
		throw new Error(`Error al obtener la campaña con industrias para ID ${id}`);
	} finally {
		client.release();
	}
}
