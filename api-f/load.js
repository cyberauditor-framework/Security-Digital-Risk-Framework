import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadData } from "./persistence/jsonPersistence.js";
import { getClient } from "./persistence/dbConnection.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Function to read JSON files from db-json/common directory
const readJsonFile = async (filename) => {
	try {
		// Try to load using jsonPersistence first
		const jsonPath = path.join(
			__dirname,
			"../db-load-json",
			"db-json",
			"common",
		);
		const data = await loadData(filename.replace(".json", ""), jsonPath);
		if (data) return data;

		// Fallback to direct file reading if jsonPersistence fails
		const filePath = path.join(__dirname, "..", "db-json", "common", filename);
		console.log(`Reading file directly from ${filePath}`);

		const fileData = fs.readFileSync(filePath, "utf8");
		const parsedData = JSON.parse(fileData);

		// Verificar que tenemos datos
		if (Array.isArray(parsedData)) {
			console.log(
				`Successfully parsed ${parsedData.length} records from ${filename}`,
			);
			if (parsedData.length > 0) {
				console.log(
					`Sample record fields: ${Object.keys(parsedData[0]).join(", ")}`,
				);
			}
		} else {
			console.warn(`File ${filename} does not contain a JSON array`);
		}

		return parsedData;
	} catch (error) {
		console.error(`Error reading JSON file ${filename}:`, error);
		throw error;
	}
};

// Mapeo para normalizar nombres de campos (JSON → PostgreSQL)
const fieldMappings = {
	// Campos comunes
	mitreId: "mitre_id",
	stixId: "stix_id",
	id: "id",
	name: "name",
	description: "description",

	// Campos específicos de campaigns
	interpressId: "interpress_id",
	createdTimestamp: "created_timestamp",
	modifiedTimestamp: "modified_timestamp",
	firstSeenTimestamp: "first_seen_timestamp",
	lastSeenTimestamp: "last_seen_timestamp",
	techniquesCount: "techniques_count",
	softwareCount: "software_count",
	threatGroupsCount: "threat_groups_count",

	// Campos específicos de detections
	definitionSource: "definition_source",
	stateChangeTimestamp: "state_change_timestamp",
	indicatorsCount: "indicators_count",
	integrationName: "integration_name",

	// Campos específicos de techniques
	universalPriority: "universal_priority",
	update: "update_flag",

	// Campos específicos de security standards
	idMitre: "id_mitre",
	controlID: "control_id",
	controlId: "control_id",
	controlName: "control_name",
	techniqueName: "technique_name",

	// Campos específicos de vulnerabilities
	cveId: "cve_id",
	awarenessLevel: "awareness_level",
	cvssSeverityScore: "cvss_severity_score",
	cvssSeverityScoreVersion: "cvss_severity_score_version",
	nistImpactScore: "nist_impact_score",
	nistExploitabilityScore: "nist_exploitability_score",
	epssExploitabilityScore: "epss_exploitability_score",
	epssExploitabilityPercentile: "epss_exploitability_percentile",
	assetsCount: "assets_count",
};

// Función auxiliar para mapear campos del JSON a columnas PostgreSQL con más tolerancia
function mapJsonToDbFields(jsonItem, mappings) {
	const result = {};

	// Copiar valores mapeados
	Object.keys(jsonItem).forEach((key) => {
		// Si existe un mapeo, usar el nombre mapeado
		const dbFieldName = mappings[key] || key;
		result[dbFieldName] = jsonItem[key];
	});

	// Para archivos específicos como ttp-rel-standard.json, verificar variaciones en nombres de campos
	if (jsonItem.controlId !== undefined && result.control_id === undefined) {
		result.control_id = jsonItem.controlId;
	}

	if (jsonItem.controlID !== undefined && result.control_id === undefined) {
		result.control_id = jsonItem.controlID;
	}

	// Otras posibles variaciones
	if (jsonItem.standardID !== undefined && result.standard === undefined) {
		result.standard = jsonItem.standardID;
	}

	return result;
}

// Función de utilidad para verificar si posible convertir un array de objetos a formato para COPY FROM
function canUseCopyFrom(data, columns) {
	if (!data || data.length === 0) return false;

	// Verificar que todos los objetos tienen los mismos campos
	return data.every((item) =>
		columns.every((col) => typeof item[col] !== "undefined"),
	);
}

// Helper para convertir un objeto JavaScript a formato CSV para PostgreSQL
function convertToCsvFormat(item, columns) {
	return columns
		.map((col) => {
			const value = item[col];

			if (value === null || value === undefined) {
				return "\\N"; // Formato NULL para PostgreSQL
			}

			if (typeof value === "boolean") {
				return value ? "t" : "f"; // Formato de booleanos para PostgreSQL
			}

			if (typeof value === "number") {
				return value.toString();
			}

			if (value instanceof Date) {
				return value.toISOString();
			}

			// Escapar comillas y caracteres especiales
			return `"${String(value).replace(/"/g, '""').replace(/\\/g, "\\\\")}"`;
		})
		.join(",");
}

// Helper avanzado para bulk inserts utilizando COPY FROM cuando sea posible
async function performBulkCopyInsert(client, tableName, data, columns) {
	if (!data || data.length === 0) return 0;

	const COPY_BATCH_SIZE = 10000; // Número de filas por operación COPY
	let totalInserted = 0;

	// Construir stream de datos en memoria
	const { Readable } = require("node:stream");

	for (let i = 0; i < data.length; i += COPY_BATCH_SIZE) {
		const batch = data.slice(i, i + COPY_BATCH_SIZE);
		console.log(
			`COPY FROM batch ${Math.floor(i / COPY_BATCH_SIZE) + 1} for ${tableName} (${batch.length} records)`,
		);

		try {
			// Crear stream de datos
			const dataStream = new Readable();

			// Llenar el stream con los datos formateados como CSV
			batch.forEach((item) => {
				dataStream.push(`${convertToCsvFormat(item, columns)}\n`);
			});
			dataStream.push(null); // Finalizar stream

			// Ejecutar COPY FROM utilizando el stream
			const result = await client.query(`
				COPY ${tableName} (${columns.join(", ")}) 
				FROM STDIN WITH (FORMAT csv, NULL '\\N')
			`);

			// Incrementar contador de filas insertadas
			totalInserted += batch.length;
			console.log(
				`Completed COPY FROM for batch, ${totalInserted} total rows inserted`,
			);
		} catch (error) {
			console.error(`Error performing COPY FROM for ${tableName}:`, error);
			// Continuar con el siguiente lote si hay error
		}
	}

	return totalInserted;
}

// Helper function to handle batch inserts with error handling
async function batchInsert(client, tableName, data, columns, idField = "id") {
	if (!data || data.length === 0) {
		console.log(`No data to insert for table ${tableName}`);
		return;
	}

	// Filtrar registros con ID vacío
	const validData = data.filter((item) => {
		const hasValidId =
			item[idField] !== undefined &&
			item[idField] !== null &&
			item[idField] !== "";
		if (!hasValidId) {
			console.warn(`Skipping record in ${tableName} with empty ${idField}`);
		}
		return hasValidId;
	});

	console.log(
		`Table ${tableName}: ${data.length} total records, ${validData.length} valid records after filtering`,
	);

	if (validData.length === 0) {
		console.log(
			`No valid data to insert for table ${tableName} after filtering`,
		);
		return;
	}

	let inserted = 0;
	let errors = 0;

	// Primero intentar usar COPY FROM para máxima velocidad si hay muchos registros
	if (validData.length > 500 && canUseCopyFrom(validData, columns)) {
		try {
			console.log(
				`Attempting fast COPY FROM for ${tableName} with ${validData.length} records`,
			);

			// Comenzar transacción para COPY FROM
			await client.query("BEGIN");

			// Ejecutar COPY FROM
			inserted = await performBulkCopyInsert(
				client,
				tableName,
				validData,
				columns,
			);
			console.log(
				`COPY FROM successful for ${tableName}, inserted ${inserted} records`,
			);

			await client.query("COMMIT");

			// Si todos los registros se insertaron correctamente, terminar aquí
			if (inserted === validData.length) {
				console.log(
					`${tableName} summary: Successfully inserted all ${inserted} records using COPY FROM`,
				);
				return;
			}

			// Si no se insertaron todos, continuar con el método normal para los registros restantes
			console.log(
				`COPY FROM inserted ${inserted}/${validData.length} records, continuing with standard inserts for remaining`,
			);
		} catch (copyError) {
			// Si falla COPY FROM, hacer rollback y continuar con el método estándar
			await client.query("ROLLBACK");
			console.error(
				`COPY FROM failed for ${tableName}, falling back to standard inserts:`,
				copyError.message,
			);
			inserted = 0; // Reiniciar contador
		}
	}

	// Si no se pudo usar COPY FROM o quedan registros por insertar, usar el método estándar
	if (inserted < validData.length) {
		// Definir tamaño de lote para inserciones masivas
		const BATCH_SIZE = 1000;

		// Preparar la consulta base
		const columnsList = columns.join(", ");
		const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
		const query = `INSERT INTO ${tableName}(${columnsList}) VALUES(${placeholders}) ON CONFLICT DO NOTHING`;

		// Determinar registros restantes (si COPY FROM insertó algunos)
		const remainingData = inserted > 0 ? validData.slice(inserted) : validData;

		// Procesar datos en lotes
		for (let i = 0; i < remainingData.length; i += BATCH_SIZE) {
			const batch = remainingData.slice(i, i + BATCH_SIZE);
			console.log(
				`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(remainingData.length / BATCH_SIZE)} for ${tableName} (${batch.length} records)`,
			);

			try {
				// Usar un enfoque de inserción masiva por lote
				await client.query("BEGIN");

				// Preparar valores para consulta masiva
				const valueParams = [];
				const valueStrings = [];

				batch.forEach((item, idx) => {
					const rowStart = idx * columns.length + 1;
					const rowValues = columns.map(
						(col, colIdx) => `$${rowStart + colIdx}`,
					);
					valueStrings.push(`(${rowValues.join(", ")})`);

					// Agregar valores a la lista de parámetros
					columns.forEach((col) => {
						valueParams.push(item[col] ?? null);
					});
				});

				// Construir consulta para inserción masiva
				const bulkQuery = `
					INSERT INTO ${tableName}(${columnsList}) 
					VALUES ${valueStrings.join(", ")}
					ON CONFLICT DO NOTHING
				`;

				// Ejecutar inserción masiva
				try {
					const result = await client.query(bulkQuery, valueParams);
					const batchInserted = result.rowCount || 0;
					inserted += batchInserted;

					// Si no se insertaron todas las filas del lote, puede haber errores de clave foránea
					if (batchInserted < batch.length) {
						console.warn(
							`Some rows in batch were not inserted (${batchInserted}/${batch.length})`,
						);
						errors += batch.length - batchInserted;
					}
				} catch (bulkError) {
					// Si la inserción masiva falla, intentar inserción individual
					console.warn(
						`Bulk insert failed for ${tableName}, falling back to individual inserts: ${bulkError.message}`,
					);

					// Insertar registros uno por uno
					for (const item of batch) {
						try {
							const values = columns.map((col) => item[col] ?? null);
							await client.query(query, values);
							inserted++;
						} catch (error) {
							errors++;
							// Log error but continue with next record
							if (error.code === "23503") {
								// Foreign key violation
								console.warn(
									`FK constraint violation in ${tableName}: ${error.detail}`,
								);
							} else if (errors <= 5 || errors % 1000 === 0) {
								// Limitar logs
								console.error(`Error inserting into ${tableName}:`, {
									error: error.message,
									code: error.code,
								});
							}
						}
					}
				}

				await client.query("COMMIT");
				console.log(
					`Batch progress: ${inserted} inserted, ${errors} failed (${tableName})`,
				);
			} catch (batchError) {
				// Si hay error general en el lote, hacer rollback
				await client.query("ROLLBACK");
				console.error(`Error processing batch in ${tableName}:`, batchError);
			}
		}
	}

	console.log(
		`${tableName} summary: Inserted ${inserted} records, Failed ${errors} records`,
	);
}

async function insertJunctionData(
	client,
	tableName,
	data,
	columns,
	idFields = ["id"],
) {
	if (!data || data.length === 0) {
		console.log(`No data to insert for table ${tableName}`);
		return;
	}

	// Filtrar registros con IDs vacíos
	const validData = data.filter((item) => {
		const hasValidIds = idFields.every(
			(field) =>
				item[field] !== undefined && item[field] !== null && item[field] !== "",
		);
		if (!hasValidIds) {
			console.warn(`Skipping record in ${tableName} with empty ID field`);
		}
		return hasValidIds;
	});

	console.log(
		`Junction table ${tableName}: ${data.length} total records, ${validData.length} valid records after filtering`,
	);

	if (validData.length === 0) {
		console.log(
			`No valid data to insert for junction table ${tableName} after filtering`,
		);
		return;
	}

	// Definir tamaño de lote para inserciones masivas
	const BATCH_SIZE = 5000; // Lotes más grandes para tablas de unión
	let inserted = 0;
	let errors = 0;

	// Preparar la consulta base
	const columnsList = columns.join(", ");
	const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
	const query = `INSERT INTO ${tableName}(${columnsList}) VALUES(${placeholders}) ON CONFLICT DO NOTHING`;

	// Procesamiento por lotes
	for (let i = 0; i < validData.length; i += BATCH_SIZE) {
		const batch = validData.slice(i, i + BATCH_SIZE);
		console.log(
			`Processing junction batch ${i / BATCH_SIZE + 1} of ${Math.ceil(validData.length / BATCH_SIZE)} for ${tableName} (${batch.length} records)`,
		);

		try {
			// Usar transacción por lote para mejorar rendimiento
			await client.query("BEGIN");

			// Preparar valores para inserción masiva con un solo comando SQL
			const valueParams = [];
			const valueStrings = [];

			batch.forEach((item, idx) => {
				const rowStart = idx * columns.length + 1;
				const rowValues = columns.map((col, colIdx) => `$${rowStart + colIdx}`);
				valueStrings.push(`(${rowValues.join(", ")})`);

				// Agregar valores a la lista de parámetros
				columns.forEach((col) => {
					valueParams.push(item[col] ?? null);
				});
			});

			// Construir consulta para inserción masiva
			const bulkQuery = `
				INSERT INTO ${tableName}(${columnsList}) 
				VALUES ${valueStrings.join(", ")}
				ON CONFLICT DO NOTHING
			`;

			// Ejecutar inserción masiva
			try {
				const result = await client.query(bulkQuery, valueParams);
				inserted += result.rowCount || 0;
			} catch (error) {
				// Si la inserción masiva falla, intentar inserción individual
				console.warn(
					`Bulk insert failed for ${tableName}, falling back to individual inserts`,
				);

				// Insertar registros uno por uno
				for (const item of batch) {
					try {
						const values = columns.map((col) => item[col] ?? null);
						await client.query(query, values);
						inserted++;
					} catch (itemError) {
						errors++;
						// Limitar logs para no saturar la consola
						if (errors <= 5 || errors % 1000 === 0) {
							if (itemError.code === "23503") {
								// Foreign key violation
								console.warn(
									`FK constraint in ${tableName}: ${itemError.detail || "unknown constraint"}`,
								);
							} else {
								console.error(`Error in ${tableName}:`, {
									error: itemError.message,
									code: itemError.code,
								});
							}
						}
					}
				}
			}

			await client.query("COMMIT");
			console.log(
				`Junction batch complete: ${inserted} inserted so far, ${errors} failed (${tableName})`,
			);
		} catch (batchError) {
			// Si hay error en el lote, hacer rollback y registrar
			await client.query("ROLLBACK");
			console.error(
				`Error processing junction batch in ${tableName}:`,
				batchError,
			);
		}
	}

	console.log(
		`${tableName} summary: Inserted ${inserted} records, Failed ${errors} records`,
	);
}

// Main function to load all data
export async function loadAllData() {
	const client = await getClient();
	const results = {
		success: true,
		tables: {},
		errors: [],
	};

	try {
		// No TRANSACTION - we want to continue even if some inserts fail

		// Load integrations
		console.log("Loading integrations...");
		try {
			const integrations = await readJsonFile("integrations.json");
			// Mapear campos del JSON a columnas de PostgreSQL
			const mappedIntegrations = integrations.map((item) =>
				mapJsonToDbFields(item, fieldMappings),
			);
			await batchInsert(
				client,
				"integrations",
				mappedIntegrations,
				["id", "name", "uuid", "description"],
				"id",
			);
			results.tables.integrations = { loaded: true };
		} catch (error) {
			console.error("Failed to load integrations:", error);
			results.tables.integrations = { loaded: false, error: error.message };
			results.errors.push({ table: "integrations", error: error.message });
			// Continue with other tables even if this one fails
		}

		// Load campaigns
		console.log("Loading campaigns...");
		try {
			const campaigns = await readJsonFile("campaigns.json");
			// Mapear campos del JSON a columnas de PostgreSQL
			const mappedCampaigns = campaigns.map((item) =>
				mapJsonToDbFields(item, fieldMappings),
			);
			await batchInsert(
				client,
				"campaigns",
				mappedCampaigns,
				[
					"id",
					"interpress_id",
					"stix_id",
					"name",
					"description",
					"deprecated",
					"revoked",
					"created_timestamp",
					"modified_timestamp",
					"origin",
					"first_seen_timestamp",
					"last_seen_timestamp",
					"techniques_count",
					"software_count",
					"threat_groups_count",
				],
				"id",
			);
			results.tables.campaigns = { loaded: true };
		} catch (error) {
			console.error("Failed to load campaigns:", error);
			results.tables.campaigns = { loaded: false, error: error.message };
			results.errors.push({ table: "campaigns", error: error.message });
		}

		// Load detections
		console.log("Loading detections...");
		try {
			const detections = await readJsonFile("detections.json");
			// Mapear campos del JSON a columnas de PostgreSQL
			const mappedDetections = detections.map((item) =>
				mapJsonToDbFields(item, fieldMappings),
			);
			await batchInsert(
				client,
				"detections",
				mappedDetections,
				[
					"id",
					"name",
					"description",
					"created_timestamp",
					"modified_timestamp",
					"state",
					"definition_source",
					"verified",
					"prevention",
					"severity",
					"reference_id",
					"license",
					"author",
					"logic",
					"state_change_timestamp",
					"indicators_count",
					"techniques_count",
					"stix_id",
					"type",
					"integration_name",
					"notional",
					"software_count",
					"threat_groups_count",
				],
				"id",
			);
			results.tables.detections = { loaded: true };
		} catch (error) {
			console.error("Failed to load detections:", error);
			results.tables.detections = { loaded: false, error: error.message };
			results.errors.push({ table: "detections", error: error.message });
		}

		// Load platforms
		console.log("Loading platforms...");
		try {
			const platforms = await readJsonFile("platforms.json");
			// Mapear campos del JSON a columnas de PostgreSQL
			const mappedPlatforms = platforms.map((item) =>
				mapJsonToDbFields(item, fieldMappings),
			);
			await batchInsert(
				client,
				"platforms",
				mappedPlatforms,
				["id", "name", "description"],
				"id",
			);
			results.tables.platforms = { loaded: true };
		} catch (error) {
			console.error("Failed to load platforms:", error);
			results.tables.platforms = { loaded: false, error: error.message };
			results.errors.push({ table: "platforms", error: error.message });
		}

		// Load software
		console.log("Loading software...");
		try {
			const software = await readJsonFile("software.json");
			// Mapear campos del JSON a columnas de PostgreSQL
			const mappedSoftware = software.map((item) =>
				mapJsonToDbFields(item, fieldMappings),
			);
			await batchInsert(
				client,
				"software",
				mappedSoftware,
				["id", "name", "description"],
				"id",
			);
			results.tables.software = { loaded: true };
		} catch (error) {
			console.error("Failed to load software:", error);
			results.tables.software = { loaded: false, error: error.message };
			results.errors.push({ table: "software", error: error.message });
		}

		// Load tactics
		console.log("Loading tactics...");
		try {
			const tactics = await readJsonFile("tactics.json");
			// Mapear campos del JSON a columnas de PostgreSQL usando mapeo específico
			const mappedTactics = tactics.map((item) =>
				mapJsonToDbFields(item, fieldMappings),
			);
			await batchInsert(
				client,
				"tactics",
				mappedTactics,
				["mitre_id", "name", "description"],
				"mitre_id",
			);
			results.tables.tactics = { loaded: true };
		} catch (error) {
			console.error("Failed to load tactics:", error);
			results.tables.tactics = { loaded: false, error: error.message };
			results.errors.push({ table: "tactics", error: error.message });
		}

		// Load techniques
		console.log("Loading techniques...");
		try {
			const techniques = await readJsonFile("techniques.json");
			// Mapear campos del JSON a columnas de PostgreSQL
			const mappedTechniques = techniques.map((item) =>
				mapJsonToDbFields(item, fieldMappings),
			);
			await batchInsert(
				client,
				"techniques",
				mappedTechniques,
				[
					"mitre_id",
					"id_json",
					"stix_id",
					"name",
					"description",
					"priority",
					"universal_priority",
					"content",
					"subtechnique",
					"deprecated",
					"created_timestamp",
					"modified_timestamp",
					"update_flag",
				],
				"mitre_id",
			);
			results.tables.techniques = { loaded: true };
		} catch (error) {
			console.error("Failed to load techniques:", error);
			results.tables.techniques = { loaded: false, error: error.message };
			results.errors.push({ table: "techniques", error: error.message });
		}

		// Load threat groups
		console.log("Loading threat groups...");
		try {
			const threatGroups = await readJsonFile("threatGroups.json");
			// Mapear campos del JSON a columnas de PostgreSQL
			const mappedThreatGroups = threatGroups.map((item) =>
				mapJsonToDbFields(item, fieldMappings),
			);
			await batchInsert(
				client,
				"threat_groups",
				mappedThreatGroups,
				["id", "name", "description"],
				"id",
			);
			results.tables.threat_groups = { loaded: true };
		} catch (error) {
			console.error("Failed to load threat groups:", error);
			results.tables.threat_groups = { loaded: false, error: error.message };
			results.errors.push({ table: "threat_groups", error: error.message });
		}

		// Load vulnerabilities
		console.log("Loading vulnerabilities...");
		try {
			const vulnerabilities = await readJsonFile("vulnerabilities.json");
			// Mapear campos del JSON a columnas de PostgreSQL
			const mappedVulnerabilities = vulnerabilities.map((item) =>
				mapJsonToDbFields(item, fieldMappings),
			);
			await batchInsert(
				client,
				"vulnerabilities",
				mappedVulnerabilities,
				[
					"id",
					"stix_id",
					"name",
					"title",
					"description",
					"cve_id",
					"universal_priority",
					"awareness_level",
					"cvss_severity_score",
					"cvss_severity_score_version",
					"nist_impact_score",
					"nist_exploitability_score",
					"epss_exploitability_score",
					"epss_exploitability_percentile",
					"assets_count",
				],
				"id",
			);
			results.tables.vulnerabilities = { loaded: true };
		} catch (error) {
			console.error("Failed to load vulnerabilities:", error);
			results.tables.vulnerabilities = { loaded: false, error: error.message };
			results.errors.push({ table: "vulnerabilities", error: error.message });
		}

		// Load security standard mappings
		console.log("Loading security standard mappings...");
		try {
			// Imprimir información detallada sobre el proceso de carga
			console.log("Beginning ttp-rel-standard.json processing");

			// Leer archivo para procesamiento especial
			const filePath = path.join(
				__dirname,
				"..",
				"db-json",
				"common",
				"ttp-rel-standard.json",
			);
			console.log(
				"Reading ttp-rel-standard.json directly for special processing",
			);

			const fileData = fs.readFileSync(filePath, "utf8");
			const rawData = JSON.parse(fileData);

			// Comprobar la estructura de los datos
			let securityStandardMappings;

			if (Array.isArray(rawData)) {
				console.log("ttp-rel-standard.json contains an array at root level");
				securityStandardMappings = rawData;
			} else if (typeof rawData === "object") {
				// Buscar si los datos están en alguna propiedad del objeto
				console.log(
					"ttp-rel-standard.json contains an object. Keys:",
					Object.keys(rawData),
				);

				// Buscar una propiedad que tenga un array
				const possibleArrayProps = Object.keys(rawData).filter(
					(key) => Array.isArray(rawData[key]) && rawData[key].length > 0,
				);

				if (possibleArrayProps.length > 0) {
					const arrayProp = possibleArrayProps[0];
					console.log(
						`Found array data in property: ${arrayProp} with ${rawData[arrayProp].length} items`,
					);
					securityStandardMappings = rawData[arrayProp];
				} else {
					// Último recurso: buscar si hay propiedades que contengan los datos esperados
					const firstLevelKeys = Object.keys(rawData);
					if (
						firstLevelKeys.length > 0 &&
						typeof rawData[firstLevelKeys[0]] === "object"
					) {
						console.log("Converting object to array of records");
						securityStandardMappings = Object.keys(rawData).map((key) => {
							const item = rawData[key];
							// Asegurar que el ID esté disponible
							if (!item.id) item.id = key;
							return item;
						});
					} else {
						throw new Error(
							"Could not find array data in ttp-rel-standard.json",
						);
					}
				}
			} else {
				throw new Error(
					"ttp-rel-standard.json contains unexpected data format",
				);
			}

			console.log(
				`Processed ${securityStandardMappings.length} security standard mappings from file`,
			);

			// Validar que el archivo no esté vacío
			if (!securityStandardMappings || securityStandardMappings.length === 0) {
				throw new Error(
					"ttp-rel-standard.json data is empty or not properly formatted",
				);
			}

			// Mapeo específico para security_standard_mappings con verificación adicional
			const mappedSecurityStandardMappings = securityStandardMappings.map(
				(item, index) => {
					// Verificar campos esenciales y mapear con tolerancia a variaciones
					// y respaldos para valores faltantes
					return {
						id_standard:
							item.id || `map_${Math.random().toString(36).substring(2, 10)}`,
						id_mitre: item.idMitre || item.id_mitre || null,
						standard: item.standard || item.standardID || null,
						control_id:
							item.controlId || item.controlID || item.control_id || null,
						control_name: item.controlName || item.control_name || null,
						technique_name: item.techniqueName || item.technique_name || null,
						description: item.description || null,
					};
				},
			);

			await batchInsert(
				client,
				"security_standard_mappings",
				mappedSecurityStandardMappings,
				[
					"id_mitre",
					"id_standard",
					"standard",
					"control_id",
					"control_name",
					"technique_name",
					"description",
				],
				"id_mitre", // Especificar campo ID
			);

			console.log("Security standard mappings batch insert completed");
			results.tables.security_standard_mappings = {
				loaded: true,
				count: mappedSecurityStandardMappings.length,
			};
		} catch (error) {
			console.error("Failed to load security standard mappings:", error);
			results.tables.security_standard_mappings = {
				loaded: false,
				error: error.message,
			};
			results.errors.push({
				table: "security_standard_mappings",
				error: error.message,
			});
		}

		// Load junction tables
		console.log("Loading junction tables...");

		// campaign_software
		try {
			const campaignSoftware = await readJsonFile("campaign_software.json");
			await insertJunctionData(
				client,
				"campaign_software",
				campaignSoftware,
				["campaign_id", "software_id"],
				["campaign_id", "software_id"],
			);
			results.tables.campaign_software = { loaded: true };
		} catch (error) {
			console.error("Failed to load campaign_software:", error);
			results.tables.campaign_software = {
				loaded: false,
				error: error.message,
			};
			results.errors.push({ table: "campaign_software", error: error.message });
		}

		// campaign_technique
		try {
			const campaignTechnique = await readJsonFile("campaign_techniques.json");
			await insertJunctionData(
				client,
				"campaign_technique",
				campaignTechnique,
				["campaign_id", "technique_id"],
				["campaign_id", "technique_id"],
			);
			results.tables.campaign_technique = { loaded: true };
		} catch (error) {
			console.error("Failed to load campaign_technique:", error);
			results.tables.campaign_technique = {
				loaded: false,
				error: error.message,
			};
			results.errors.push({
				table: "campaign_technique",
				error: error.message,
			});
		}

		// campaign_threat_group
		try {
			const campaignThreatGroup = await readJsonFile(
				"campaign_threatGroups.json",
			);
			await insertJunctionData(
				client,
				"campaign_threat_group",
				campaignThreatGroup,
				["campaign_id", "threat_group_id"],
				["campaign_id", "threat_group_id"],
			);
			results.tables.campaign_threat_group = { loaded: true };
		} catch (error) {
			console.error("Failed to load campaign_threat_group:", error);
			results.tables.campaign_threat_group = {
				loaded: false,
				error: error.message,
			};
			results.errors.push({
				table: "campaign_threat_group",
				error: error.message,
			});
		}

		// campaign_vulnerability
		try {
			const campaignVulnerability = await readJsonFile(
				"campaign_vulnerabilities.json",
			);
			await insertJunctionData(
				client,
				"campaign_vulnerability",
				campaignVulnerability,
				["campaign_id", "vulnerability_id"],
				["campaign_id", "vulnerability_id"],
			);
			results.tables.campaign_vulnerability = { loaded: true };
		} catch (error) {
			console.error("Failed to load campaign_vulnerability:", error);
			results.tables.campaign_vulnerability = {
				loaded: false,
				error: error.message,
			};
			results.errors.push({
				table: "campaign_vulnerability",
				error: error.message,
			});
		}

		// technique_detection
		try {
			const techniqueDetection = await readJsonFile(
				"technique_detections.json",
			);
			await insertJunctionData(
				client,
				"technique_detection",
				techniqueDetection,
				["technique_id", "detection_id", "effectiveness"],
				["technique_id", "detection_id"],
			);
			results.tables.technique_detection = { loaded: true };
		} catch (error) {
			console.error("Failed to load technique_detection:", error);
			results.tables.technique_detection = {
				loaded: false,
				error: error.message,
			};
			results.errors.push({
				table: "technique_detection",
				error: error.message,
			});
		}

		// technique_platform
		try {
			const techniquePlatform = await readJsonFile("technique_platforms.json");
			await insertJunctionData(
				client,
				"technique_platform",
				techniquePlatform,
				["technique_id", "platform_id"],
				["technique_id", "platform_id"],
			);
			results.tables.technique_platform = { loaded: true };
		} catch (error) {
			console.error("Failed to load technique_platform:", error);
			results.tables.technique_platform = {
				loaded: false,
				error: error.message,
			};
			results.errors.push({
				table: "technique_platform",
				error: error.message,
			});
		}

		// technique_software
		try {
			const techniqueSoftware = await readJsonFile("technique_software.json");
			await insertJunctionData(
				client,
				"technique_software",
				techniqueSoftware,
				["technique_id", "software_id"],
				["technique_id", "software_id"],
			);
			results.tables.technique_software = { loaded: true };
		} catch (error) {
			console.error("Failed to load technique_software:", error);
			results.tables.technique_software = {
				loaded: false,
				error: error.message,
			};
			results.errors.push({
				table: "technique_software",
				error: error.message,
			});
		}

		// technique_tactic
		try {
			const techniqueTactic = await readJsonFile("technique_tactics.json");
			await insertJunctionData(
				client,
				"technique_tactic",
				techniqueTactic,
				["technique_id", "tactic_id"],
				["technique_id", "tactic_id"],
			);
			results.tables.technique_tactic = { loaded: true };
		} catch (error) {
			console.error("Failed to load technique_tactic:", error);
			results.tables.technique_tactic = { loaded: false, error: error.message };
			results.errors.push({ table: "technique_tactic", error: error.message });
		}

		// threat_group_technique
		try {
			const threatGroupTechnique = await readJsonFile(
				"threatGroup_techniques.json",
			);
			await insertJunctionData(
				client,
				"threat_group_technique",
				threatGroupTechnique,
				["threat_group_id", "technique_id"],
				["threat_group_id", "technique_id"],
			);
			results.tables.threat_group_technique = { loaded: true };
		} catch (error) {
			console.error("Failed to load threat_group_technique:", error);
			results.tables.threat_group_technique = {
				loaded: false,
				error: error.message,
			};
			results.errors.push({
				table: "threat_group_technique",
				error: error.message,
			});
		}

		if (results.errors.length > 0) {
			results.success = false;
			results.message = `Data load completed with ${results.errors.length} errors`;
		} else {
			results.message = "All data loaded successfully";
		}

		console.log(results.message);
		return results;
	} catch (error) {
		console.error("Error in load process:", error);
		return {
			success: false,
			message: `Error in load process: ${error.message}`,
			errors: [{ general: error.message }],
		};
	} finally {
		client.release();
	}
}

// Export a function that can be used via an API endpoint
export async function initLoad() {
	console.log("Starting data load process...");
	try {
		const result = await loadAllData();
		console.log("Data load process completed");
		return result;
	} catch (error) {
		console.error("Data load process failed:", error);
		return {
			success: false,
			message: `Error in data load process: ${error.message}`,
		};
	}
}
