export const getPlatformsQuery = `
  query Platforms {
    platforms {
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
