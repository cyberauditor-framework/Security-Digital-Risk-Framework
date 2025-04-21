export const getSoftwareQuery = `
  query Software {
    software {
      count
      totalCount
      edges {
        node {
          mitreId
          name
          description
        }
      }
    }
  }
`;
