export const getThreatGroupsQuery = `
  query ThreatGroups($offset: Int, $pageSize: Int) {
    threatGroups(offset: $offset, first: $pageSize) {
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
          techniques {
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
              }
              cursor
            }
          }
        }
        cursor
      }
    }
  }
`;
