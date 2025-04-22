export const getPlatformsQuery = `
  query Platforms($offset: Int, $pageSize: Int) {
    platforms(offset: $offset, first: $pageSize) {
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
          description
        }
        cursor
      }
    }
  }
`;
