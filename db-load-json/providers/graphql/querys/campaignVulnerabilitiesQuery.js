export const getCampaignVulnerabilitiesQuery = `
  query CampaignVulnerabilitiesQuery($campaignId: ID!) {
    prioritizedVulnerabilities(prioritizedCampaignId: $campaignId) {
      totalCount
      edges {
        node {
          id
          name
          priority
          integrationNames
          assetCount
          cvssSeverityScore
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
