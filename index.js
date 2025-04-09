process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { graphqlFetch } from './services/graphql.js';

const ENDPOINT = 'https://interpres.io/api/graphql/';

const HEADERS = {
  'Cookie': process.env.COOKIE
};

const listQuery = `
  query PrioritizedCampaignQuery(
    $pageSize: Int!,
    $offset: Int! = 0,
    $orderBy: String!,
    $name_Icontains: String! = ""
  ) {
    prioritizedCampaigns(
      first: $pageSize,
      offset: $offset,
      orderBy: $orderBy,
      search: $name_Icontains
    ) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const detailQuery = `
  query CampaignsQuery($id: ID!) {
    prioritizedCampaigns(id: $id) {
      edges {
        node {
          name
          content
          id
          stixId
          description
          modifiedTimestamp
          lastSeenTimestamp
          aliasNames
          origin
          referenceUrls
          countries
          industries
          __typename
        }
        __typename
      }
      __typename
    }
    prioritizedTechniques(prioritizedCampaignId: $id) {
      totalCount
      edges {
        node {
          id
          name
          priority
          content
          mitreId
          technique {
            detections {
              edges {
                node {
                  id
                  name
                  state
                  integrationName
                  techniqueMitreIds
                  __typename
                }
                __typename
              }
              __typename
            }
            referenceDetections {
              edges {
                node {
                  id
                  name
                  techniqueMitreIds
                  __typename
                }
                __typename
              }
              __typename
            }
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    prioritizedSoftware(prioritizedCampaignId: $id) {
      totalCount
      edges {
        node {
          id
          mitreId
          name
          priority
          content
          __typename
        }
        __typename
      }
      __typename
    }
    prioritizedThreatGroups(prioritizedCampaignId: $id) {
      totalCount
      edges {
        node {
          id
          mitreId
          name
          priority
          content
          __typename
        }
        __typename
      }
      __typename
    }
    prioritizedVulnerabilities(prioritizedCampaignId: $id) {
      totalCount
      edges {
        node {
          id
          name
          priority
          integrationNames
          assetCount
          cvssSeverityScore
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

const techniqueDetailQuery = `
  query getTechnique($mitreId: String!) {
    prioritizedTechniques(mitreId: $mitreId) {
      edges {
        node {
          id
          name
          mitreId
          modifiedTimestamp
          description
          content
          priority
          detectionsPercentage
          telemetryPercentage
          tacticNames
          platformNames
          domainNames
          indicatorsCount
          tactics {
            id
            name
            __typename
          }
          platforms {
            id
            name
            __typename
          }
          __typename
        }
        __typename
      }
      __typename
    }
    threatGroups: prioritizedThreatGroups(techniqueMitreIds: $mitreId) {
      totalCount
      edges {
        node {
          id
          name
          priority
          content
          mitreId
          __typename
        }
        __typename
      }
      __typename
    }
    software: prioritizedSoftware(techniqueMitreIds: $mitreId) {
      totalCount
      edges {
        node {
          id
          name
          priority
          content
          mitreId
          __typename
        }
        __typename
      }
      __typename
    }
    telemetrySubcategories(techniqueMitreIds: $mitreId) {
      totalCount
      edges {
        node {
          id
          name
          isAvailable
          isMonitored
          __typename
        }
        __typename
      }
      __typename
    }
    campaigns: prioritizedCampaigns(techniqueMitreIds: $mitreId) {
      totalCount
      edges {
        node {
          id
          name
          __typename
        }
        __typename
      }
      __typename
    }
    referenceDetections(techniqueMitreIds: $mitreId) {
      totalCount
      edges {
        node {
          id
          name
          severity
          __typename
        }
        __typename
      }
      __typename
    }
    detections(techniqueMitreId: $mitreId) {
      totalCount
      edges {
        node {
          id
          name
          state
          integrationName
          __typename
        }
        __typename
      }
      __typename
    }
    detectionsWithAlerts: detections(
      techniqueMitreId: $mitreId,
      first: 20,
      orderBy: "-indicatorsCount",
      indicatorsCount_Gt: 0
    ) {
      totalCount
      edges {
        node {
          id
          name
          state
          integrationName
          indicatorsCount
          __typename
        }
        __typename
      }
      __typename
    }
    enabledDetections: detections(techniqueMitreId: $mitreId, state: ENABLED) {
      totalCount
      edges {
        node {
          id
          name
          state
          integrationName
          __typename
        }
        __typename
      }
      __typename
    }
    disabledDetections: detections(techniqueMitreId: $mitreId, state: DISABLED) {
      totalCount
      edges {
        node {
          id
          name
          state
          integrationName
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;

async function main() {
  console.log("Iniciando obtención de campañas...\n");

  // Ejecutar consulta para obtener el listado de campañas
  const listVariables = {
    offset: 0,
    name_Icontains: "",
    pageSize: 5,
    orderBy: "-createdTimestamp",
  };

  const listData = await graphqlFetch(ENDPOINT, listQuery, listVariables, HEADERS);
  const campaigns = listData.prioritizedCampaigns.edges;

  if (!campaigns || campaigns.length === 0) {
    console.log("No se encontró ninguna campaña.");
    return;
  }

  console.log(`Se encontraron ${campaigns.length} campañas, procesando...\n`);

  for (const { node: campaign } of campaigns) {
    console.log("=============================================");
    console.log(`Campaña: ${campaign.name}`);
    console.log("---------------------------------------------");

    // Obtener detalle de la campaña
    const detailVariables = { id: campaign.id };
    const detailData = await graphqlFetch(ENDPOINT, detailQuery, detailVariables, HEADERS);

    // Arrays para técnicas habilitadas y deshabilitadas (con duplicados)
    const disabledTechniqueMitreIds = [];
    const enabledTechniqueMitreIds = [];

    const techniques = (detailData.prioritizedTechniques.edges || []);
    techniques.forEach(edge => {
      const detections = edge.node.technique?.detections.edges || [];
      detections.forEach(det => {
        const mitreIds = det.node.techniqueMitreIds || [];
        if (det.node.state === "DISABLED") {
          disabledTechniqueMitreIds.push(...mitreIds);
        }
        enabledTechniqueMitreIds.push(...mitreIds);
      });
    });

    // Eliminar duplicados
    const uniqueDisabledMitreIds = Array.from(new Set(disabledTechniqueMitreIds));
    const uniqueEnabledMitreIds = Array.from(new Set(enabledTechniqueMitreIds));

    console.log(`Técnicas DISABLED: ${uniqueDisabledMitreIds.length}`);
    console.log(`Técnicas ENABLED: ${uniqueEnabledMitreIds.length}\n`);

    // Para cada técnica deshabilitada, obtener detalles usando la consulta getTechnique
    if (uniqueDisabledMitreIds.length > 0) {
      console.log("Detalle de técnicas DISABLED:");
      for (const mitreId of uniqueDisabledMitreIds) {
        const techniqueVariables = { mitreId };
        try {
          const techniqueDetailData = await graphqlFetch(ENDPOINT, techniqueDetailQuery, techniqueVariables, HEADERS);
          // Se asume que la información principal está en prioritizedTechniques.edges
          const techEdges = techniqueDetailData.prioritizedTechniques.edges || [];
          if (techEdges.length > 0) {
            const technique = techEdges[0].node;
            console.log("  -----------------------------------------");
            console.log(`  Técnica: ${technique.name} (Mitre ID: ${technique.mitreId})`);
            console.log(`    Prioridad     : ${technique.priority || "No especificado"}`);
            console.log(`    Última modificación: ${technique.modifiedTimestamp || "No disponible"}`);
            console.log(`    Detecciones % : ${technique.detectionsPercentage || "N/A"}`);
            console.log(`    Telemetría %  : ${technique.telemetryPercentage || "N/A"}`);
            // Se pueden agregar otros campos importantes según sea necesario
          } else {
            console.log(`  No se encontró detalle para la técnica con Mitre ID: ${mitreId}`);
          }
        } catch (error) {
          console.error(`  Error obteniendo datos para la técnica ${mitreId}:`, error);
        }
      }
      console.log("  -----------------------------------------\n");
    } else {
      console.log("No se encontraron técnicas DISABLED para esta campaña.\n");
    }
  }

  console.log("Proceso completado.");
}

main().catch(err => console.error("Error en la ejecución:", err));
