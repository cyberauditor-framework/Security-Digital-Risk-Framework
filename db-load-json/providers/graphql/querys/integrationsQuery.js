export const getIntegrationsQuery = `
  query Integrations($offset: Int, $pageSize: Int) {
    integrations(offset: $offset, first: $pageSize) {
      count
      totalCount
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        node {
          id
          name
          uuid
          description
        }
        cursor
      }
    }
  }
`;
