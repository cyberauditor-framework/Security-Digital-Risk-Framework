export const getCampaignsQuery = `query Campaigns {
    campaigns {
        count
        totalCount
        edges {
            node {
                id
                name
                stixId
                description
                deprecated
                revoked
                createdTimestamp
                modifiedTimestamp
                update
                type
                origin
                firstSeenTimestamp
                lastSeenTimestamp
                aliasNames
                techniquesCount
                softwareCount
                threatGroupsCount
                vulnerabilityCveIds
                vulnerabilitiesCount
                assetsCount
                techniques {
                    count
                    totalCount
                    edges {
                        node {
                            id
                            name
                            stixId
                            description
                            deprecated
                            createdTimestamp
                            modifiedTimestamp
                            update
                            mitreId
                            universalPriority
                            subtechnique
                            priority
                            content
                        }
                    }
                }
                software {
                    count
                    totalCount
                    edges {
                        node {
                            id
                            name
                            stixId
                            description
                            deprecated
                            revoked
                            createdTimestamp
                            modifiedTimestamp
                            update
                            softwareType
                            mitreId
                            universalPriority
                            priority
                            content
                        }
                    }
                }
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
                            configurations
                            assetsCount
                            configuration
                        }
                    }
                }
                threatGroups {
                    count
                    totalCount
                    edges {
                        node {
                            id
                            name
                            stixId
                            description
                            deprecated
                            revoked
                            createdTimestamp
                            modifiedTimestamp
                            update
                            mitreId
                            universalPriority
                            priority
                            content
                        }
                    }
                }
            }
        }
    }
}`;

export const getCampaignDetailQuery = `query CampaignDetail($id: ID!) {
    campaigns(id: $id) {
        edges {
            node {
                id
                name
                stixId
                description
                deprecated
                revoked
                createdTimestamp
                modifiedTimestamp
                update
                type
                origin
                firstSeenTimestamp
                lastSeenTimestamp
                aliasNames
                techniquesCount
                softwareCount
                threatGroupsCount
                vulnerabilityCveIds
                vulnerabilitiesCount
                assetsCount
                techniques {
                    edges {
                        node {
                            id
                            name
                            mitreId
                            priority
                            content
                        }
                    }
                }
                software {
                    edges {
                        node {
                            id
                            name
                            mitreId
                            priority
                            content
                        }
                    }
                }
                threatGroups {
                    edges {
                        node {
                            id
                            name
                            mitreId
                            priority
                            content
                        }
                    }
                }
                vulnerabilities {
                    edges {
                        node {
                            id
                            name
                            priority
                            integrationNames
                            assetCount
                            cvssSeverityScore
                        }
                    }
                }
            }
        }
    }
}`;
