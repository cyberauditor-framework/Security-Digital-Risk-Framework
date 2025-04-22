export const getSoftwareQuery = `
  query Software($offset: Int, $pageSize: Int) {
    software(offset: $offset, first: $pageSize) {
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
          mitreId
          name
          description
        }
        cursor
      }
    }
  }
`;
