export const getVulnerabilitiesQuery = `
  query Vulnerabilities($offset: Int, $pageSize: Int) {
    vulnerabilities(offset: $offset, first: $pageSize) {
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
                stixId
                description
                universalPriority
                awarenessLevel
                title
                cveId
                cvssSeverityScore
                cvssSeverityScoreVersion
                nistImpactScore
                nistExploitabilityScore
                epssExploitabilityScore
                epssExploitabilityPercentile
                assetsCount
                platforms {
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
                        }
                        cursor
                    }
                }
            }
            cursor
        }
    }
  }
`;
