process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { graphqlFetch } from './services/graphql.js';

const ENDPOINT = 'https://interpres.io/api/graphql/';

const HEADERS = {
  'Cookie': process.env.COOKIE
};

async function main() {
  console.log("Iniciando obtención de campañas...");

  // Consulta para obtener el listado de campañas (solo se obtienen id y nombre)
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

  const listVariables = {
    offset: 0,
    name_Icontains: "",
    pageSize: 5,
    orderBy: "-createdTimestamp",
  };

  // Ejecutar consulta de listado de campañas usando graphqlFetch
  const listData = await graphqlFetch(ENDPOINT, listQuery, listVariables, HEADERS);
  const campaigns = listData.prioritizedCampaigns.edges;

  if (!campaigns || campaigns.length === 0) {
    console.log("No se encontró ninguna campaña.");
    return;
  }

  console.log(`Se encontraron ${campaigns.length} campañas, procesando...`);

  // Query para obtener detalle de cada campaña en cuanto a técnicas y detecciones DISABLED
  const detailQuery = `
    query CampaignsQuery($id: ID!) {
      prioritizedTechniques(prioritizedCampaignId: $id) {
        edges {
          node {
            technique {
              detections {
                edges {
                  node {
                    state
                    techniqueMitreIds
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  // Procesar cada campaña para obtener los techniqueMitreIds de detecciones con state "DISABLED"
  for (const { node: campaign } of campaigns) {
    console.log(`Procesando campaña: ${campaign.name} (ID: ${campaign.id})`);

    const detailData = await graphqlFetch(ENDPOINT, detailQuery, { id: campaign.id }, HEADERS);

    let disabledTechniqueMitreIds = [];
    const techniques = detailData.prioritizedTechniques.edges || [];
    techniques.forEach(edge => {
      const detections = edge.node.technique?.detections.edges || [];
      detections.forEach(det => {
        if (det.node.state === "DISABLED") {
          disabledTechniqueMitreIds.push(...det.node.techniqueMitreIds);
        }
      });
    });
    console.log(`\tTechnique Mitre IDs (DISABLED): ${disabledTechniqueMitreIds.join(', ') || 'Ninguno'}`);
  }

  console.log("Proceso completado.");
}

main().catch(err => console.error("Error en la ejecución:", err));
