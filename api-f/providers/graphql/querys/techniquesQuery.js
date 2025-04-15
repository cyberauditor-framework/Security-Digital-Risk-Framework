export const getTechniquesQuery = `
  query TechniquesQuery(
    $pageSize: Int!,
    $offset: Int! = 0,
    $domainName: String!,
    $orderBy: String!,
    $searchNameOrMitreId: String! = "",
    $tacticNames: String! = "",
    $integrationNames: String! = "",
    $platformNames: String! = "",
    $priority: String! = "",
    $content: String! = "",
    $mitreIds: String! = "",
    $campaignStixIds: String! = "",
    $softwareMitreIds: String! = "",
    $threatGroupMitreIds: String! = "",
    $telemetrySubcategoryNames: String! = "",
    $controlStixIds: String! = "",
    $telemetrySubcategoryId: ID! = "",
    $countries: [ThreatProfileCountries]! = [],
    $industries: [ThreatProfileIndustries]! = []
  ) {
    prioritizedTechniques(
      first: $pageSize,
      offset: $offset,
      domainName: $domainName,
      orderBy: $orderBy,
      search: $searchNameOrMitreId,
      tacticNames: $tacticNames,
      integrationNames: $integrationNames,
      platformNames: $platformNames,
      priority: $priority,
      content: $content,
      mitreIds: $mitreIds,
      campaignStixIds: $campaignStixIds,
      softwareMitreIds: $softwareMitreIds,
      threatGroupMitreIds: $threatGroupMitreIds,
      telemetrySubcategoryNames: $telemetrySubcategoryNames,
      controlStixIds: $controlStixIds,
      telemetrySubcategoryId: $telemetrySubcategoryId,
      countries: $countries,
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
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
