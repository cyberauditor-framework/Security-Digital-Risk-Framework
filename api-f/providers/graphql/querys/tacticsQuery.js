export const getTacticsQuery = `
query Tactics {
    tactics {
        count
        totalCount
        edges {
            node {
                id
                name
                description
                mitreId
            }
        }
    }
}

`;
