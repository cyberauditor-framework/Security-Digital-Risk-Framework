export const getVulnerabilitiesQuery = `
  query DetectionsQuery($pageSize: Int!, $offset: Int! = 0, $orderBy: String!, $name_Icontains: String! = "", $states: String! = "", $severities: String! = "", $integrationNames: String! = "", $indicatorsCount_Gte: Int, $indicatorsCount_Lte: Int, $techniqueMitreIds: String! = "") {
    integrationNames
    detections(
      first: $pageSize
      offset: $offset
      orderBy: $orderBy
      search: $name_Icontains
      states: $states
      severities: $severities
      integrationNames: $integrationNames
      indicatorsCount_Gte: $indicatorsCount_Gte
      indicatorsCount_Lte: $indicatorsCount_Lte
      techniqueMitreIds: $techniqueMitreIds
    ) {
      totalCount
      edges {
        node {
          id
          name
          severity
          state
          integrationName
          indicatorsCount
          techniquesCount
          softwareCount
          threatGroupsCount
          createdTimestamp
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
