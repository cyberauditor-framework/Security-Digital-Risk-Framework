export const getCampaignSoftwareQuery = `
  query CampaignSoftwareQuery($campaignId: ID!) {
    prioritizedSoftware(prioritizedCampaignId: $campaignId) {
      totalCount
      edges {
        node {
          id
          mitreId
          name
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
