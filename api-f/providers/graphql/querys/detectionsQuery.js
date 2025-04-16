export const getDetectionsQuery = `query Detections {
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
                type
                integrationName
                notional
                softwareCount
                threatGroupsCount
            }
        }
    }
}`;
