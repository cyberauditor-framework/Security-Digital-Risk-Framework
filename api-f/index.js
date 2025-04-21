import {
	listFiles,
	loadData,
	saveData,
} from "../persistence/jsonPersistence.js";
import { getCampaignsWithThreatProfile } from "./services/campaignService.js";

const STORAGE_DIR = "../db/common";

const analyzeDetectionsFromCampaignDetail = (data) => {
	const techniqueDetails = [];
	let totalTechniques = 0;
	let totalDetections = 0;
	let totalEnabled = 0;
	let totalDisabled = 0;

	// Loop through each technique
	data.techniques.forEach((technique) => {
		totalTechniques++;

		// Extract detections if they exist
		const detections = technique.technique?.detections || [];
		totalDetections += detections.length;

		// Count enabled and disabled detections
		let enabledCount = 0;
		let disabledCount = 0;

		detections.forEach((detection) => {
			if (detection.state === "ENABLED") {
				enabledCount++;
				totalEnabled++;
			} else if (detection.state === "DISABLED") {
				disabledCount++;
				totalDisabled++;
			}
		});

		// Add result for this technique
		techniqueDetails.push({
			techniqueId: technique.id,
			techniqueName: technique.name,
			mitreTechniqueId: technique.mitreId,
			totalDetections: detections.length,
			enabledDetections: enabledCount,
			disabledDetections: disabledCount,
		});
	});

	// Create result object with details and summary
	return {
		techniqueDetails: techniqueDetails,
		summary: {
			totalTechniques: totalTechniques,
			totalDetections: totalDetections,
			totalEnabledDetections: totalEnabled,
			totalDisabledDetections: totalDisabled,
		},
	};
};

export const campaignAnalysisDetections = async (storageDir = STORAGE_DIR) => {
	const campaignFiles = await listFiles(storageDir);
	console.log("Campaign files:", campaignFiles);

	const listCampaignsDetailsClient = [];

	for (const campaignFile of campaignFiles) {
		const campaignDetail = await loadData(`${campaignFile}`, storageDir);
		const campaignAnalysisDetections =
			analyzeDetectionsFromCampaignDetail(campaignDetail);

		const campaignDetailWithAnalysis = {
			campaignId: campaignFile,
			campaignAnalysisDetections: campaignAnalysisDetections,
		};
		listCampaignsDetailsClient.push(campaignDetailWithAnalysis);
	}

	return listCampaignsDetailsClient;
};

export const getThreatGroupData = async (
	threatGroupId,
	storageDir = STORAGE_DIR,
) => {
	// Load all required JSON files
	const campaignThreatGroups = await loadData(
		"campaign_threatGroups",
		storageDir,
	);
	const campaigns = await loadData("campaigns", storageDir);
	const threatGroupTechniques = await loadData(
		"threatGroup_techniques",
		storageDir,
	);
	const techniqueTactics = await loadData("technique_tactics", storageDir);

	// Find campaigns related to this threat group
	const relatedCampaignIds = campaignThreatGroups
		.filter((relation) => relation.threat_group_id === threatGroupId)
		.map((relation) => relation.campaign_id);

	// Get campaign names
	const relatedCampaigns = relatedCampaignIds.map((campaignId) => {
		const campaign = campaigns.find((c) => c.id === campaignId);
		return {
			id: campaignId,
			name: campaign ? campaign.name : "Unknown Campaign",
		};
	});

	// Get techniques associated with this threat group
	const relatedTechniques = threatGroupTechniques
		.filter((relation) => relation.threat_group_id === threatGroupId)
		.map((relation) => relation.technique_id);

	// Map techniques to tactics
	const techniquesWithTactics = relatedTechniques.map((techniqueId) => {
		const tactics = techniqueTactics
			.filter((relation) => relation.technique_id === techniqueId)
			.map((relation) => relation.tactic_id);

		return {
			mitreTechniqueId: techniqueId,
			tactics: tactics,
		};
	});

	// Create final result
	const result = {
		threatGroupId,
		campaigns: relatedCampaigns,
		techniques: techniquesWithTactics,
	};

	console.log("Threat Group Data:", JSON.stringify(result, null, 2));
	return result;
};

export const getCampaignsSummary = async (storageDir = STORAGE_DIR) => {
	// Cargar los archivos JSON necesarios
	const campaigns = await loadData("campaigns", storageDir);
	const campaignTechniques = await loadData("campaign_techniques", storageDir);
	const techniques = await loadData("techniques", storageDir);
	const techniqueTactics = await loadData("technique_tactics", storageDir);
	const tactics = await loadData("tactics", storageDir);

	// Crear un resumen para cada campaña
	const campaignsSummary = campaigns.map((campaign) => {
		// Obtener las técnicas asociadas a esta campaña
		const relatedTechniqueIds = campaignTechniques
			.filter((relation) => relation.campaign_id === campaign.id)
			.map((relation) => relation.technique_id);

		// Obtener información detallada de cada técnica y sus tácticas
		const techniqueDetails = relatedTechniqueIds.map((techniqueId) => {
			// ⚠️ Importante: Buscar la técnica por mitreId, no por id
			const technique = techniques.find((t) => t.mitreId === techniqueId);

			if (!technique) {
				console.log(`Warning: Technique with mitreId ${techniqueId} not found`);
				return {
					id: techniqueId,
					name: "Technique not found",
					description: "No data available for this technique",
					tactics: [],
				};
			}

			// Obtener tácticas asociadas a esta técnica usando el mitreId
			const tacticIds = techniqueTactics
				.filter((relation) => relation.technique_id === technique.mitreId)
				.map((relation) => relation.tactic_id);

			// Obtener nombres de las tácticas usando el mitreId de tactics.json
			const tacticDetails = tacticIds.map((tacticId) => {
				// ⚠️ Importante: Buscar la táctica por mitreId, no por id
				const tactic = tactics.find((t) => t.mitreId === tacticId);

				if (!tactic) {
					console.log(`Warning: Tactic with mitreId ${tacticId} not found`);
					return {
						id: tacticId,
						name: "Tactic not found",
					};
				}

				return {
					id: tacticId,
					name: tactic.name,
					description: tactic.description,
				};
			});

			return {
				id: techniqueId,
				internalId: technique.id,
				name: technique.name,
				description: technique.description || "No description available",
				tactics: tacticDetails,
			};
		});

		// Crear el objeto de resumen para esta campaña
		return {
			id: campaign.id,
			name: campaign.name,
			description: campaign.description || "No description available",
			techniques: techniqueDetails,
		};
	});

	// Crear el objeto result
	const result = {
		totalCampaigns: campaignsSummary.length,
		campaigns: campaignsSummary,
	};

	// Mostrar el resumen en la consola
	console.log(`Generated summary for ${campaignsSummary.length} campaigns`);
	console.log("Campaigns Summary:", JSON.stringify(result, null, 2));

	return result;
};

export const getCampaignDetailedInfo = async (
	campaignId,
	storageDir = STORAGE_DIR,
) => {
	// Cargar los archivos JSON necesarios
	const campaigns = await loadData("campaigns", storageDir);
	const campaignTechniques = await loadData("campaign_techniques", storageDir);
	const techniques = await loadData("techniques", storageDir);
	const techniqueTactics = await loadData("technique_tactics", storageDir);
	const tactics = await loadData("tactics", storageDir);
	const techniqueDetections = await loadData(
		"technique_detections",
		storageDir,
	);
	const detections = await loadData("detections", storageDir);

	// Encontrar la campaña específica
	const campaign = campaigns.find((c) => c.id === campaignId);
	if (!campaign) {
		console.log(`Campaign with ID ${campaignId} not found`);
		return { error: "Campaign not found" };
	}

	// Obtener las técnicas asociadas a esta campaña
	const relatedTechniqueIds = campaignTechniques
		.filter((relation) => relation.campaign_id === campaignId)
		.map((relation) => relation.technique_id);

	// Obtener información detallada de cada técnica
	const techniqueDetails = relatedTechniqueIds.map((techniqueId) => {
		// Buscar la técnica por mitreId
		const technique = techniques.find((t) => t.mitreId === techniqueId);

		if (!technique) {
			console.log(`Warning: Technique with mitreId ${techniqueId} not found`);
			return {
				id: techniqueId,
				name: "Technique not found",
				description: "No data available for this technique",
				tactics: [],
				detections: [],
			};
		}

		// Obtener tácticas asociadas a esta técnica
		const tacticIds = techniqueTactics
			.filter((relation) => relation.technique_id === technique.mitreId)
			.map((relation) => relation.tactic_id);

		// Obtener detalles de las tácticas
		const tacticDetails = tacticIds.map((tacticId) => {
			const tactic = tactics.find((t) => t.mitreId === tacticId);

			if (!tactic) {
				console.log(`Warning: Tactic with mitreId ${tacticId} not found`);
				return {
					id: tacticId,
					name: "Tactic not found",
				};
			}

			return {
				id: tacticId,
				name: tactic.name,
				description: tactic.description,
			};
		});

		// Obtener las reglas de detección asociadas a esta técnica
		const detectionRelations = techniqueDetections.filter(
			(relation) => relation.technique_id === technique.mitreId,
		);

		// Obtener los detalles de las reglas de detección
		const detectionDetails = detectionRelations.map((relation) => {
			const detection = detections.find((d) => d.id === relation.detection_id);

			if (!detection) {
				console.log(
					`Warning: Detection with ID ${relation.detection_id} not found`,
				);
				return {
					id: relation.detection_id,
					name: "Detection not found",
					effectiveness: relation.effectiveness,
				};
			}

			return {
				id: detection.id,
				name: detection.name,
				description: detection.description,
				effectiveness: relation.effectiveness,
			};
		});

		return {
			id: techniqueId,
			name: technique.name,
			description: technique.description || "No description available",
			tactics: tacticDetails,
			detections: detectionDetails,
			detectionCount: detectionDetails.length,
		};
	});

	// Agrupar técnicas por táctica para el resumen técnico
	const tacticSummary = {};
	techniqueDetails.forEach((technique) => {
		technique.tactics.forEach((tactic) => {
			if (!tacticSummary[tactic.name]) {
				tacticSummary[tactic.name] = {
					name: tactic.name,
					techniqueCount: 0,
					techniques: [],
				};
			}
			tacticSummary[tactic.name].techniqueCount++;
			tacticSummary[tactic.name].techniques.push({
				id: technique.id,
				name: technique.name,
			});
		});
	});

	// Crear el resumen de detecciones por técnica
	const detectionSummary = techniqueDetails.map((technique) => {
		return {
			techniqueId: technique.id,
			techniqueName: technique.name,
			rulesCount: technique.detectionCount,
			rules: technique.detections.map((detection) => ({
				id: detection.id,
				name: detection.name,
			})),
		};
	});

	// Crear el resultado final
	const result = {
		campaignId: campaign.id,
		campaignName: campaign.name,
		description: campaign.description || "No description available",
		totalTechniques: techniqueDetails.length,
		techniques: techniqueDetails,
		tacticSummary: Object.values(tacticSummary),
		detectionSummary: detectionSummary,

		// Crear un resumen formateado para mostrar
		formattedSummary: {
			campaignSummary: `${campaign.name} has ${techniqueDetails.length} associated techniques.`,
			techniquesList: `**${campaign.name}** is associated with specific MITRE ATT&CK techniques. The identified techniques used in this campaign include:
  ${techniqueDetails
		.map(
			(technique) =>
				`* **${technique.id} – ${technique.name}:**
	 * ${technique.description.replace(/<\/?p>|<\/?code>/g, "").split("\n")[0]}`,
		)
		.join("\n")}`,
			tacticalSummary: Object.entries(tacticSummary)
				.map(
					([tacticName, data]) =>
						`${campaign.name} uses ${data.techniqueCount} techniques in the ${tacticName} tactic.`,
				)
				.join("\n"),
			detectionRulesSummary: `Summary detection rules by technique for the ${campaign.name} campaign
  technique | rules
  --------- | -----
  ${detectionSummary
		.map((item) => `${item.techniqueId} | ${item.rulesCount}`)
		.join("\n")}`,
		},
	};

	console.log(`Generated detailed information for campaign: ${campaign.name}`);
	return result;
};

export const getCampaignsThreatProfile = async (storageDir = STORAGE_DIR) => {
	// Cargar los archivos JSON necesarios
	const campaignThreatProfile = await loadData(
		"campaign_with_threat_profile",
		storageDir,
	);
	const campaignSoftware = await loadData("campaign_software", storageDir);
	const softwareData = await loadData("software", storageDir);
	const campaignThreatGroups = await loadData(
		"campaign_threatGroups",
		storageDir,
	);
	const threatGroupsData = await loadData("threatGroups", storageDir);
	const campaignTechniques = await loadData("campaign_techniques", storageDir);
	const techniquesData = await loadData("techniques", storageDir);
	const techniqueDetections = await loadData(
		"technique_detections",
		storageDir,
	);
	const detectionsData = await loadData("detections", storageDir);

	// Obtener las campañas del perfil de amenazas
	const campaigns =
		campaignThreatProfile.fullCampaigns ||
		campaignThreatProfile.campaigns ||
		[];

	// Resumen global para todas las campañas
	const globalSummary = {
		totalCampaigns: campaigns.length,
		totalSoftware: 0,
		totalTechniques: 0,
		totalThreatGroups: 0,
		totalDetections: 0,
		activeDetections: 0,
		inactiveDetections: 0,
	};

	// Procesar cada campaña
	const campaignsData = await Promise.all(
		campaigns.map(async (campaign) => {
			const campaignId = campaign.id;

			// 1. Obtener el software asociado a esta campaña
			const softwareIds = campaignSoftware
				.filter((relation) => relation.campaign_id === campaignId)
				.map((relation) => relation.software_id);

			const softwareDetails = softwareIds.map((softwareId) => {
				const software = softwareData.find((s) => s.id === softwareId);
				return software
					? {
							id: softwareId,
							name: software.name,
							description: software.description,
						}
					: {
							id: softwareId,
							name: "Unknown Software",
							description: "No information available",
						};
			});

			// 2. Obtener los grupos de amenazas asociados a esta campaña
			const threatGroupIds = campaignThreatGroups
				.filter((relation) => relation.campaign_id === campaignId)
				.map((relation) => relation.threat_group_id);

			const threatGroupDetails = threatGroupIds.map((threatGroupId) => {
				const threatGroup = threatGroupsData.find(
					(tg) => tg.id === threatGroupId,
				);
				return threatGroup
					? {
							id: threatGroupId,
							name: threatGroup.name,
							description: threatGroup.description,
						}
					: {
							id: threatGroupId,
							name: "Unknown Threat Group",
							description: "No information available",
						};
			});

			// 3. Obtener las técnicas asociadas a esta campaña
			const techniqueIds = campaignTechniques
				.filter((relation) => relation.campaign_id === campaignId)
				.map((relation) => relation.technique_id);

			// 4. Para cada técnica, obtener sus detecciones
			const techniqueWithDetections = await Promise.all(
				techniqueIds.map(async (techniqueId) => {
					const technique = techniquesData.find(
						(t) => t.mitreId === techniqueId,
					);

					if (!technique) {
						return {
							id: techniqueId,
							name: "Unknown Technique",
							description: "No information available",
							detections: [],
						};
					}

					// Obtener las detecciones asociadas a esta técnica
					const detectionIds = techniqueDetections
						.filter((relation) => relation.technique_id === techniqueId)
						.map((relation) => relation.detection_id);

					const detectionDetails = detectionIds.map((detectionId) => {
						const detection = detectionsData.find((d) => d.id === detectionId);

						if (!detection) {
							return {
								id: detectionId,
								name: "Unknown Detection",
								isActive: false,
							};
						}

						// Determinar si la detección está activa
						const isActive = detection.state === "ENABLED";

						return {
							id: detectionId,
							name: detection.name,
							description: detection.description,
							isActive: isActive,
							severity: detection.severity,
							type: detection.type,
						};
					});

					// Contar detecciones activas e inactivas para esta técnica
					const activeDetectionsCount = detectionDetails.filter(
						(d) => d.isActive,
					).length;
					const inactiveDetectionsCount =
						detectionDetails.length - activeDetectionsCount;

					return {
						id: techniqueId,
						name: technique.name,
						description: technique.description,
						detections: detectionDetails,
						activeDetectionsCount,
						inactiveDetectionsCount,
						totalDetectionsCount: detectionDetails.length,
					};
				}),
			);

			// Calcular resúmenes para esta campaña
			const campaignActiveDetections = techniqueWithDetections.reduce(
				(sum, technique) => sum + technique.activeDetectionsCount,
				0,
			);

			const campaignInactiveDetections = techniqueWithDetections.reduce(
				(sum, technique) => sum + technique.inactiveDetectionsCount,
				0,
			);

			const campaignTotalDetections =
				campaignActiveDetections + campaignInactiveDetections;

			// Actualizar resumen global
			globalSummary.totalSoftware += softwareDetails.length;
			globalSummary.totalTechniques += techniqueWithDetections.length;
			globalSummary.totalThreatGroups += threatGroupDetails.length;
			globalSummary.totalDetections += campaignTotalDetections;
			globalSummary.activeDetections += campaignActiveDetections;
			globalSummary.inactiveDetections += campaignInactiveDetections;

			// Crear el objeto de resumen para esta campaña
			return {
				id: campaignId,
				name: campaign.name,
				origin: campaign.origin,
				createdTimestamp: campaign.createdTimestamp,
				lastSeenTimestamp: campaign.lastSeenTimestamp,

				software: softwareDetails,
				threatGroups: threatGroupDetails,
				techniques: techniqueWithDetections,

				summary: {
					softwareCount: softwareDetails.length,
					threatGroupsCount: threatGroupDetails.length,
					techniquesCount: techniqueWithDetections.length,
					totalDetections: campaignTotalDetections,
					activeDetections: campaignActiveDetections,
					inactiveDetections: campaignInactiveDetections,
				},
			};
		}),
	);

	// Crear el resultado final
	const result = {
		campaigns: campaignsData,
		globalSummary: globalSummary,
	};

	console.log(`Generated threat profile for ${campaignsData.length} campaigns`);
	console.log(
		`Total active detections: ${globalSummary.activeDetections}, inactive: ${globalSummary.inactiveDetections}`,
	);

	return result;
};

process.on("uncaughtException", (err) => {
	console.error("Error no capturado:", err);
	process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Promesa rechazada no manejada:", reason);
	process.exit(1);
});

(async () => {
	try {
		console.log("Inicializando index");

		await getThreatGroupData("G0099", STORAGE_DIR);
		const campaignSummary = await getCampaignsSummary(STORAGE_DIR);
		await saveData("campaign_summary", campaignSummary, "../db/results");
		const campaignId = "Q2FtcGFpZ25UeXBlOjcwNQ==";
		const campaignDetailInfo = await getCampaignDetailedInfo(
			campaignId,
			STORAGE_DIR,
		);
		await saveData(
			`campaign_detail_info_${campaignId}`,
			campaignDetailInfo,
			"../db/results",
		);
		// const campaignsWithThreatProfile = await getCampaignsWithThreatProfile();
		// await saveData(
		// 	"campaign_with_threat_profile",
		// 	campaignsWithThreatProfile,
		// 	//db/common -> Provisional
		// 	"../db/common",
		// );
		const campaignsWithThreatProfile =
			await getCampaignsThreatProfile(STORAGE_DIR);
		await saveData(
			"campaignsWithThreatProfile",
			campaignsWithThreatProfile,
			"../db/results",
		);
	} catch (error) {
		console.error("Error de inicialización:", error);
		process.exit(1);
	}
})();
