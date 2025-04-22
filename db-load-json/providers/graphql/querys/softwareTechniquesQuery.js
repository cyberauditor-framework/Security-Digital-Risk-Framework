export const getSoftwareTechniquesQuery = `
  query SoftwareTechniquesQuery($softwareMitreId: String!) {
    prioritizedTechniques(
      softwareMitreIds: $softwareMitreId,
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
