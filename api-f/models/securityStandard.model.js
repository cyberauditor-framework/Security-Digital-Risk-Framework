import { query } from "../persistence/dbConnection.js";

/**
 * Buscar todos los mapeos de estándares de seguridad
 */
export async function findAll() {
	try {
		const result = await query(
			"SELECT * FROM security_standard_mappings ORDER BY id_mitre",
			[],
		);
		return result.rows;
	} catch (error) {
		console.error("Error al buscar mapeos de estándares de seguridad:", error);
		throw new Error(
			"Error al obtener los mapeos de estándares de seguridad de la base de datos",
		);
	}
}

/**
 * Buscar un mapeo de estándar de seguridad por ID MITRE
 */
export async function findByMitreId(idMitre) {
	try {
		const result = await query(
			"SELECT * FROM security_standard_mappings WHERE id_mitre = $1",
			[idMitre],
		);
		return result.rows[0];
	} catch (error) {
		console.error(
			`Error al buscar mapeo de estándar de seguridad con ID MITRE ${idMitre}:`,
			error,
		);
		throw new Error(
			`Error al obtener el mapeo de estándar de seguridad con ID MITRE ${idMitre}`,
		);
	}
}

/**
 * Buscar mapeos de estándares de seguridad por estándar
 */
export async function findByStandard(standard) {
	try {
		const result = await query(
			"SELECT * FROM security_standard_mappings WHERE standard = $1 ORDER BY id_mitre",
			[standard],
		);
		return result.rows;
	} catch (error) {
		console.error(
			`Error al buscar mapeos de estándares de seguridad para estándar ${standard}:`,
			error,
		);
		throw new Error(
			`Error al obtener los mapeos de estándares de seguridad para estándar ${standard}`,
		);
	}
}

/**
 * Buscar mapeos de estándares de seguridad por ID de control
 */
export async function findByControlId(controlId) {
	try {
		const result = await query(
			"SELECT * FROM security_standard_mappings WHERE control_id = $1 ORDER BY id_mitre",
			[controlId],
		);
		return result.rows;
	} catch (error) {
		console.error(
			`Error al buscar mapeos de estándares de seguridad para ID de control ${controlId}:`,
			error,
		);
		throw new Error(
			`Error al obtener los mapeos de estándares de seguridad para ID de control ${controlId}`,
		);
	}
}
