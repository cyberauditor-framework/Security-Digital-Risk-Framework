export const getTechniquesQuery = `query Techniques {
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
                tactics {
                    count
                    totalCount
                    edges {
                        node {
                            name
                            description
                            mitreId
                            id
                        }
                    }
                }
                detections {
                    count
                    totalCount
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
                    }
                }
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
            }
        }
    }
}`;
