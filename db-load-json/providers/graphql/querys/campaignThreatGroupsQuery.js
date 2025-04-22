export const getCampaignThreatGroupsQuery = `
  query CampaignThreatGroupsQuery($campaignId: ID!) {
    prioritizedThreatGroups(prioritizedCampaignId: $campaignId) {
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
