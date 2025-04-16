export const getVulnerabilitiesQuery = `
  query Vulnerabilities {
    vulnerabilities {
        count
        totalCount
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
                    edges {
                        node {
                            id
                            name
                            description
                        }
                    }
                }
            }
        }
    }
  }
`;
