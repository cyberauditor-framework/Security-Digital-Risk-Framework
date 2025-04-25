import { query, getClient } from "../persistence/dbConnection.js";

/**
 * Buscar todas las técnicas
 */
export async function findAll() {
	try {
		const result = await query(
			"SELECT * FROM techniques ORDER BY mitre_id",
			[],
		);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar técnicas:", error);
		throw new Error("Error al obtener las técnicas de la base de datos");
	}
}

/**
 * Buscar una técnica por MITRE ID
 */
export async function findByMitreId(mitreId) {
	try {
		const result = await query("SELECT * FROM techniques WHERE mitre_id = $1", [
			mitreId,
		]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error al buscar técnica con MITRE ID ${mitreId}:`, error);
		throw new Error(`Error al obtener la técnica con MITRE ID ${mitreId}`);
	}
}

/**
 * Buscar una técnica con sus tácticas asociadas
 */
export async function findWithTactics(mitreId) {
	const client = await getClient();
	try {
		// Verificar si la técnica existe
		const techniqueResult = await client.query(
			"SELECT * FROM techniques WHERE mitre_id = $1",
			[mitreId],
		);

		if (techniqueResult.rows.length === 0) {
			return null;
		}

		const technique = techniqueResult.rows[0];

		// Obtener tácticas asociadas
		const tacticsResult = await client.query(
			`SELECT t.* 
       FROM tactics t
       JOIN technique_tactic tt ON t.mitre_id = tt.tactic_id
       WHERE tt.technique_id = $1`,
			[mitreId],
		);

		return {
			...technique,
			tactics: tacticsResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener técnica con tácticas para MITRE ID ${mitreId}:`,
			error,
		);
		throw new Error(
			`Error al obtener la técnica con tácticas para MITRE ID ${mitreId}`,
		);
	} finally {
		client.release();
	}
}

/**
 * Buscar una técnica con sus detecciones asociadas
 */
export async function findWithDetections(mitreId) {
	const client = await getClient();
	try {
		// Verificar si la técnica existe
		const techniqueResult = await client.query(
			"SELECT * FROM techniques WHERE mitre_id = $1",
			[mitreId],
		);

		if (techniqueResult.rows.length === 0) {
			return null;
		}

		const technique = techniqueResult.rows[0];

		// Obtener detecciones asociadas
		const detectionsResult = await client.query(
			`SELECT d.*, td.effectiveness 
       FROM detections d
       JOIN technique_detection td ON d.id = td.detection_id
       WHERE td.technique_id = $1`,
			[mitreId],
		);

		return {
			...technique,
			detections: detectionsResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener técnica con detecciones para MITRE ID ${mitreId}:`,
			error,
		);
		throw new Error(
			`Error al obtener la técnica con detecciones para MITRE ID ${mitreId}`,
		);
	} finally {
		client.release();
	}
}

/**
 * Buscar una técnica con sus plataformas asociadas
 */
export async function findWithPlatforms(mitreId) {
	const client = await getClient();
	try {
		// Verificar si la técnica existe
		const techniqueResult = await client.query(
			"SELECT * FROM techniques WHERE mitre_id = $1",
			[mitreId],
		);

		if (techniqueResult.rows.length === 0) {
			return null;
		}

		const technique = techniqueResult.rows[0];

		// Obtener plataformas asociadas
		const platformsResult = await client.query(
			`SELECT p.* 
       FROM platforms p
       JOIN technique_platform tp ON p.id = tp.platform_id
       WHERE tp.technique_id = $1`,
			[mitreId],
		);

		return {
			...technique,
			platforms: platformsResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener técnica con plataformas para MITRE ID ${mitreId}:`,
			error,
		);
		throw new Error(
			`Error al obtener la técnica con plataformas para MITRE ID ${mitreId}`,
		);
	} finally {
		client.release();
	}
}

/**
 * Buscar una técnica con su software asociado
 */
export async function findWithSoftware(mitreId) {
	const client = await getClient();
	try {
		// Verificar si la técnica existe
		const techniqueResult = await client.query(
			"SELECT * FROM techniques WHERE mitre_id = $1",
			[mitreId],
		);

		if (techniqueResult.rows.length === 0) {
			return null;
		}

		const technique = techniqueResult.rows[0];

		// Obtener software asociado
		const softwareResult = await client.query(
			`SELECT s.* 
       FROM software s
       JOIN technique_software ts ON s.id = ts.software_id
       WHERE ts.technique_id = $1`,
			[mitreId],
		);

		return {
			...technique,
			software: softwareResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener técnica con software para MITRE ID ${mitreId}:`,
			error,
		);
		throw new Error(
			`Error al obtener la técnica con software para MITRE ID ${mitreId}`,
		);
	} finally {
		client.release();
	}
}

/**
 * Buscar una técnica con sus grupos de amenazas asociados
 */
export async function findWithThreatGroups(mitreId) {
	const client = await getClient();
	try {
		// Verificar si la técnica existe
		const techniqueResult = await client.query(
			"SELECT * FROM techniques WHERE mitre_id = $1",
			[mitreId],
		);

		if (techniqueResult.rows.length === 0) {
			return null;
		}

		const technique = techniqueResult.rows[0];

		// Obtener grupos de amenazas asociados
		const threatGroupsResult = await client.query(
			`SELECT tg.* 
       FROM threat_groups tg
       JOIN threat_group_technique tgt ON tg.id = tgt.threat_group_id
       WHERE tgt.technique_id = $1`,
			[mitreId],
		);

		return {
			...technique,
			threatGroups: threatGroupsResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener técnica con grupos de amenazas para MITRE ID ${mitreId}:`,
			error,
		);
		throw new Error(
			`Error al obtener la técnica con grupos de amenazas para MITRE ID ${mitreId}`,
		);
	} finally {
		client.release();
	}
}
