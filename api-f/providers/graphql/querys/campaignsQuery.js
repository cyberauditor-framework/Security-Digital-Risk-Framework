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
export const getCampaignsQueryWithThreatProfile = `query PrioritizedCampaignQuery($pageSize: Int!, $offset: Int! = 0, $orderBy: String!, $name_Icontains: String! = "", $origins: String! = "", $content: String! = "", $showOnlyWithExploits: Boolean! = false, $limitCampaigns: Boolean! = true, $techniqueMitreIds: String! = "", $softwareMitreIds: String! = "", $threatGroupsMitreIds: String! = "", $industries: [ThreatProfileIndustries]! = [], $countries: [ThreatProfileCountries]! = []) {
  campaignOrigins
  prioritizedCampaigns(
    first: $pageSize
    offset: $offset
    orderBy: $orderBy
    search: $name_Icontains
    origins: $origins
    content: $content
    showOnlyWithExploits: $showOnlyWithExploits
    limitCampaigns: $limitCampaigns
    techniqueMitreIds: $techniqueMitreIds
    softwareMitreIds: $softwareMitreIds
    threatGroupsMitreIds: $threatGroupsMitreIds
    industries: $industries
    countries: $countries
  ) {
    totalCount
    edges {
      node {
        id
        name
        origin
        content
        aliasNames
        techniquesCount
        softwareCount
        threatGroupsCount
        createdTimestamp
        lastSeenTimestamp
        vulnerabilityCveIds
        vulnerabilityCount
        assetCount
        stixId
        campaignId
        __typename
      }
      __typename
    }
    __typename
  }
  industries {
    label
    value
    __typename
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
