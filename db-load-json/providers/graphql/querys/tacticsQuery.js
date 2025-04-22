export const getTacticsQuery = `
query Tactics($offset: Int, $pageSize: Int) {
    tactics(offset: $offset, first: $pageSize) {
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
                mitreId
            }
            cursor
        }
    }
}

`;
