export const getTechniqueTacticsQuery = `
  query TechniqueTacticsQuery($mitreId: String!) {
    prioritizedTechniques(
      mitreIds: $mitreId,
      first: 1
    ) {
      edges {
        node {
          id
          name
          mitreId
          tacticNames
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
