export const getDetectionsQuery = `
query Detections($offset: Int, $pageSize: Int) {
  detections(offset: $offset, first: $pageSize) {
    count
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    edges {
      node {
        id
        name
        description
        createdTimestamp
        modifiedTimestamp
        state
        definitionSource
        verified
        prevention
        severity
        referenceId
        license
        author
        logic
        stateChangeTimestamp
        indicatorsCount
        techniquesCount
        stixId
        techniqueMitreIds
        type
        integrationName
        notional
        softwareCount
        threatGroupsCount
      }
      cursor
    }
  }
}
`;
