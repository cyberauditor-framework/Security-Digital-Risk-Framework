export const getIntegrationsQuery = `
  query Integrations {
    integrations {
      count
      totalCount
      edges {
        node {
          id
          name
          uuid
          description
        }
      }
    }
  }
`;
