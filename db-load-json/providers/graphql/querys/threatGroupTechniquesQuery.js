export const getThreatGroupTechniquesQuery = `
  query ThreatGroupTechniquesQuery($threatGroupMitreId: String!) {
    prioritizedTechniques(
      threatGroupMitreIds: $threatGroupMitreId,
      first: 100
    ) {
      totalCount
      edges {
        node {
          id
          name
          mitreId
          priority
          content
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
