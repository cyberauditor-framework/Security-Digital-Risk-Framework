import { query, getClient } from "../persistence/dbConnection.js";

/**
 * Buscar todas las detecciones
 */
export async function findAll() {
	try {
		const result = await query("SELECT * FROM detections ORDER BY id", []);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar detecciones:", error);
		throw new Error("Error al obtener las detecciones de la base de datos");
	}
}

/**
 * Buscar una detección por ID
 */
export async function findById(id) {
	try {
		const result = await query("SELECT * FROM detections WHERE id = $1", [id]);
		return result.rows[0];
	} catch (error) {
		console.error(`Error al buscar detección con ID ${id}:`, error);
		throw new Error(`Error al obtener la detección con ID ${id}`);
	}
}

/**
 * Buscar una detección con sus técnicas asociadas
 */
export async function findWithTechniques(id) {
	const client = await getClient();
	try {
		// Verificar si la detección existe
		const detectionResult = await client.query(
			"SELECT * FROM detections WHERE id = $1",
			[id],
		);

		if (detectionResult.rows.length === 0) {
			return null;
		}

		const detection = detectionResult.rows[0];

		// Obtener técnicas asociadas con nivel de efectividad
		const techniquesResult = await client.query(
			`SELECT t.*, td.effectiveness 
       FROM techniques t
       JOIN technique_detection td ON t.mitre_id = td.technique_id
       WHERE td.detection_id = $1`,
			[id],
		);

		return {
			...detection,
			techniques: techniquesResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener detección con técnicas para ID ${id}:`,
			error,
		);
		throw new Error(`Error al obtener la detección con técnicas para ID ${id}`);
	} finally {
		client.release();
	}
}

/**
 * Buscar una detección con su software asociado
 */
export async function findWithSoftware(id) {
	const client = await getClient();
	try {
		// Verificar si la detección existe
		const detectionResult = await client.query(
			"SELECT * FROM detections WHERE id = $1",
			[id],
		);

		if (detectionResult.rows.length === 0) {
			return null;
		}

		const detection = detectionResult.rows[0];

		// Obtener software asociado mediante técnicas
		// Primero obtenemos las técnicas asociadas a la detección
		const techniquesResult = await client.query(
			`SELECT DISTINCT technique_id
       FROM technique_detection
       WHERE detection_id = $1`,
			[id],
		);

		// Si no hay técnicas, retornamos la detección sin software
		if (techniquesResult.rows.length === 0) {
			return {
				...detection,
				software: [],
			};
		}

		// Obtenemos los IDs de las técnicas
		const techniqueIds = techniquesResult.rows.map((row) => row.technique_id);

		// Consulta para obtener software asociado a esas técnicas
		const softwareResult = await client.query(
			`SELECT DISTINCT s.*
       FROM software s
       JOIN technique_software ts ON s.id = ts.software_id
       WHERE ts.technique_id = ANY($1)`,
			[techniqueIds],
		);

		return {
			...detection,
			software: softwareResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener detección con software para ID ${id}:`,
			error,
		);
		throw new Error(`Error al obtener la detección con software para ID ${id}`);
	} finally {
		client.release();
	}
}

/**
 * Buscar una detección con sus grupos de amenazas asociados
 */
export async function findWithThreatGroups(id) {
	const client = await getClient();
	try {
		// Verificar si la detección existe
		const detectionResult = await client.query(
			"SELECT * FROM detections WHERE id = $1",
			[id],
		);

		if (detectionResult.rows.length === 0) {
			return null;
		}

		const detection = detectionResult.rows[0];

		// Obtener grupos de amenazas asociados mediante técnicas
		// Primero obtenemos las técnicas asociadas a la detección
		const techniquesResult = await client.query(
			`SELECT DISTINCT technique_id
       FROM technique_detection
       WHERE detection_id = $1`,
			[id],
		);

		// Si no hay técnicas, retornamos la detección sin grupos de amenazas
		if (techniquesResult.rows.length === 0) {
			return {
				...detection,
				threatGroups: [],
			};
		}

		// Obtenemos los IDs de las técnicas
		const techniqueIds = techniquesResult.rows.map((row) => row.technique_id);

		// Consulta para obtener grupos de amenazas asociados a esas técnicas
		const threatGroupsResult = await client.query(
			`SELECT DISTINCT tg.*
       FROM threat_groups tg
       JOIN threat_group_technique tgt ON tg.id = tgt.threat_group_id
       WHERE tgt.technique_id = ANY($1)`,
			[techniqueIds],
		);

		return {
			...detection,
			threatGroups: threatGroupsResult.rows,
		};
	} catch (error) {
		console.error(
			`Error al obtener detección con grupos de amenazas para ID ${id}:`,
			error,
		);
		throw new Error(
			`Error al obtener la detección con grupos de amenazas para ID ${id}`,
		);
	} finally {
		client.release();
	}
}
