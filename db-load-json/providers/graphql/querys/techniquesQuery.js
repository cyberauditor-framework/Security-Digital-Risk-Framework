export const getTechniquesQuery = `query Techniques($offset: Int, $pageSize: Int) {
    techniques(offset: $offset, first: $pageSize) {
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
                    pageInfo {
                        hasNextPage
                        hasPreviousPage
                        startCursor
                        endCursor
                    }
                    edges {
                        node {
                            name
                            description
                            mitreId
                            id
                        }
                        cursor
                    }
                }
                detections {
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
                software {
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
                        cursor
                    }
                }
            }
            cursor
        }
    }
}`;
