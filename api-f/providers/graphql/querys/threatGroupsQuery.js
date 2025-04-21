export const getThreatGroupsQuery = `
  query ThreatGroups {
    threatGroups {
      count
      totalCount
      edges {
        node {
          mitreId
          name
          description
          techniques {
            edges {
              node {
                mitreId
                name
              }
            }
          }
        }
      }
    }
  }
`;
