export const getCampaignsQuery = `
    query PrioritizedCampaignQuery(
      $pageSize: Int!,
      $offset: Int! = 0,
      $orderBy: String!,
      $name_Icontains: String! = ""
    ) {
      prioritizedCampaigns(
        first: $pageSize,
        offset: $offset,
        orderBy: $orderBy,
        search: $name_Icontains
      ) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `;

export const getCampaignDetailQuery = `
  query CampaignsQuery($id: ID!) {
      prioritizedCampaigns(id: $id) {
          edges {
          node {
              name
              content
              id
              stixId
              description
              modifiedTimestamp
              lastSeenTimestamp
              description
              aliasNames
              origin
              referenceUrls
              countries
              industries
              __typename
          }
          __typename
          }
          __typename
      }
      prioritizedTechniques(prioritizedCampaignId: $id) {
          totalCount
          edges {
          node {
              id
              name
              priority
              content
              mitreId
              technique {
              detections {
                  edges {
                  node {
                      id
                      name
                      state
                      integrationName
                      techniqueMitreIds
                      __typename
                  }
                  __typename
                  }
                  __typename
              }
              referenceDetections {
                  edges {
                  node {
                      id
                      name
                      techniqueMitreIds
                      __typename
                  }
                  __typename
                  }
                  __typename
              }
              __typename
              }
              __typename
          }
          __typename
          }
          __typename
      }
      prioritizedSoftware(prioritizedCampaignId: $id) {
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
      prioritizedThreatGroups(prioritizedCampaignId: $id) {
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
      prioritizedVulnerabilities(prioritizedCampaignId: $id) {
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
