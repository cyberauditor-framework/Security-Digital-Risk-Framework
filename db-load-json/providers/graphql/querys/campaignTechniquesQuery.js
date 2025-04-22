export const getCampaignTechniquesQuery = `
  query CampaignTechniquesQuery($campaignId: ID!) {
    prioritizedTechniques(prioritizedCampaignId: $campaignId) {
      totalCount
      edges {
        node {
          id
          name
          mitreId
          priority
          content
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
