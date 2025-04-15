export const getThreatGroupsQuery = `
  query ThreatGroups {
    threatGroups {
      count
      totalCount
      edges {
        node {
          id
          name
          description
        }
      }
    }
  }
`;
