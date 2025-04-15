export const getSoftwareQuery = `
  query Software {
    software {
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
