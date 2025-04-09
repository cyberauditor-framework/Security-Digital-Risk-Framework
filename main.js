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
    query TechniquesQuery($pageSize: Int!, $offset: Int! = 0, $domainName: String!, $orderBy: String!, $searchNameOrMitreId: String! = "", $tacticNames: String! = "", $integrationNames: String! = "", $platformNames: String! = "", $priority: String! = "", $content: String! = "", $mitreIds: String! = "", $campaignStixIds: String! = "", $softwareMitreIds: String! = "", $threatGroupMitreIds: String! = "", $telemetrySubcategoryNames: String! = "", $controlStixIds: String! = "", $telemetrySubcategoryId: ID! = "", $countries: [ThreatProfileCountries]! = [], $industries: [ThreatProfileIndustries]! = []) {
      platformNames
      tacticNames
      integrationNames
      prioritizedTechniques(
        first: $pageSize
        offset: $offset
        domainName: $domainName
        orderBy: $orderBy
        search: $searchNameOrMitreId
        tacticNames: $tacticNames
        integrationNames: $integrationNames
        platformNames: $platformNames
        priority: $priority
        content: $content
        mitreIds: $mitreIds
        campaignStixIds: $campaignStixIds
        softwareMitreIds: $softwareMitreIds
        threatGroupMitreIds: $threatGroupMitreIds
        telemetrySubcategoryNames: $telemetrySubcategoryNames
        controlStixIds: $controlStixIds
        telemetrySubcategoryId: $telemetrySubcategoryId
        countries: $countries
        industries: $industries
      ) {
        totalCount
        edges {
          node {
            id
            name
            description
            priority
            content
            modifiedTimestamp
            mitreId
            threatGroupsCount
            softwareCount
            campaignsCount
            platformNames
            tacticNames
            detectionsPercentageDescription
            telemetryPercentageDescription
            detectionsPercentage
            telemetryPercentage
            __typename
          }
          __typename
        }
        __typename
      }
    }
  `;

  const listVariables = {
    "offset": 0,
    "searchNameOrMitreId": "",
    "tacticNames": "",
    "integrationNames": "",
    "platformNames": "",
    "priority": "",
    "content": "",
    "mitreIds": "",
    "campaignStixIds": "",
    "softwareMitreIds": "",
    "threatGroupMitreIds": "",
    "telemetrySubcategoryNames": "",
    "controlStixIds": "",
    "telemetrySubcategoryId": "",
    "countries": [],
    "industries": [],
    "pageSize": 5,
    "domainName": "",
    "orderBy": "-priority"
  };

  // Ejecutar consulta de listado de tecnica usando graphqlFetch
  const listData = await graphqlFetch(ENDPOINT, listQuery, listVariables, HEADERS);
  const techniques = listData.prioritizedTechniques.edges;

  if (!techniques || techniques.length === 0) {
    console.log("No se encontró ninguna techniques.");
    return;
  }

  console.log(`Se encontraron ${techniques.length} techniques, procesando...`);

  // Query para obtener detalle de cada tecnica en cuanto a técnicas y detecciones DISABLED
  const detailQuery = `
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
        techniqueMitreId: $mitreId
        first: 20
        orderBy: "-indicatorsCount"
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

  
  // Procesar cada tecnica para obtener los techniqueMitreIds de detecciones con state "DISABLED"
  for (const { node: technique } of techniques) {
    console.log(`Test ${technique.mitreId}`)
    const detailVariables = { mitreId: technique.mitreId }
    const detailData = await graphqlFetch(ENDPOINT, detailQuery, detailVariables, HEADERS);

    const totalDetections = detailData.detections.totalCount || null;
    const totalEnabledDetections = []
    const totalDisabledDetections = []
    const detections = detailData.detections.edges || [];

    detections.forEach(detection => {
      if (detection.node.state === 'DISABLED') {
        totalDisabledDetections.push(detection.node);
      } else if (detection.node.state === 'ENABLED') {
        totalEnabledDetections.push(detection.node);
      }
    });
    
    console.log(`Total detecciones: ${totalDetections}`);
    console.log(`Total detecciones habilitadas: ${totalEnabledDetections.length}`);
    console.log(`Total detecciones deshabilitadas: ${totalDisabledDetections.length}`);
    console.log("Detalles de detecciones deshabilitadas:");
  }

  console.log("Proceso completado.");
}

main().catch(err => console.error("Error en la ejecución:", err));
