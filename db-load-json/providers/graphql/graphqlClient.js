export const graphqlFetch = async (
	url,
	query,
	variables = {},
	headers = {},
	isRecursivePaginationCall = false,
) => {
	try {
		const defaultHeaders = {
			"Content-Type": "application/json",
			Accept: "application/json",
			...headers,
		};

		const body = JSON.stringify({
			query,
			variables,
		});

		const response = await fetch(url, {
			method: "POST",
			headers: defaultHeaders,
			body,
		});

		if (!response.ok) {
			throw new Error(
				`Error de red: ${response.status} ${response.statusText}`,
			);
		}

		const data = await response.json();

		if (data.errors && data.errors.length > 0) {
			throw {
				message: "Error GraphQL response",
				errors: data.errors,
				data: data.data,
			};
		}

		// If this is a recursive call for pagination, just return the data as is
		if (isRecursivePaginationCall) {
			return data.data;
		}

		// Handle pagination by checking for paginated fields and fetching all pages
		const completePaginatedData = await handlePagination(
			url,
			query,
			data.data,
			headers,
		);
		return completePaginatedData;
	} catch (error) {
		console.error("Error GraphQL request:", error);
		throw error;
	}
};

// Function to recursively handle pagination for all fields that contain pagination info
const handlePagination = async (url, originalQuery, data, headers) => {
	if (!data) return null;

	// Create a deep copy of the data to avoid modifying the original
	const result = JSON.parse(JSON.stringify(data));

	// Process each field that might contain pagination
	const paginationPromises = [];

	for (const [key, value] of Object.entries(result)) {
		// Check if the field has pagination structure
		if (value?.edges?.length > 0 && value?.pageInfo?.hasNextPage === true) {
			// This field has more pages to fetch
			paginationPromises.push(
				fetchAllPages(url, originalQuery, key, value, headers).then(
					(allData) => {
						result[key] = allData;
					},
				),
			);
		} else if (value && typeof value === "object" && !Array.isArray(value)) {
			// Recursively check nested objects for pagination
			paginationPromises.push(
				handlePagination(url, originalQuery, value, headers).then(
					(processed) => {
						result[key] = processed;
					},
				),
			);
		}
	}

	// Wait for all pagination promises to resolve
	await Promise.all(paginationPromises);

	return result;
};

// Function to fetch all pages for a specific paginated field
const fetchAllPages = async (
	url,
	originalQuery,
	fieldName,
	initialData,
	headers,
) => {
	// Start with the initial data
	const result = {
		...initialData,
		edges: [...initialData.edges],
	};

	let hasNextPage = initialData.pageInfo?.hasNextPage;
	let currentOffset = initialData.edges?.length || 0; // Start with the count of items from the first page
	const pageSize = 100; // Fixed page size for offset calculation

	// Keep track of processed cursors to avoid duplicates
	const processedCursors = new Set(
		initialData.edges.map((edge) => edge.cursor),
	);

	// Maximum number of retries for failed requests
	const MAX_RETRIES = 3;
	// Delay between pagination requests to avoid overwhelming the server (in ms)
	const PAGINATION_DELAY = 500;

	let pagesCount = 1; // We already have the first page

	// Continue fetching as long as there are more pages
	while (hasNextPage) {
		// Add delay between requests to avoid overwhelming the server
		await new Promise((resolve) => setTimeout(resolve, PAGINATION_DELAY));

		// Try fetching the next page with retries
		let nextPageData = null;
		let retryCount = 0;
		let fetchError = null;

		while (retryCount < MAX_RETRIES && !nextPageData) {
			try {
				// If we're retrying, wait longer between attempts
				if (retryCount > 0) {
					await new Promise((resolve) =>
						setTimeout(resolve, PAGINATION_DELAY * retryCount * 2),
					);
					console.log(
						`Retrying pagination request (attempt ${retryCount + 1} of ${MAX_RETRIES}) for ${fieldName} at offset ${currentOffset}`,
					);
				}

				// Fetch the next page
				nextPageData = await graphqlFetch(
					url,
					originalQuery,
					{ offset: currentOffset, pageSize: pageSize },
					headers,
					true, // Flag to indicate this is a recursive pagination call
				);

				// Reset error if successful
				fetchError = null;
			} catch (error) {
				fetchError = error;
				retryCount++;
				console.error(
					`Error fetching page (attempt ${retryCount}): ${error.message}`,
				);

				// If it's a 502 or 504 error (server overload), wait longer
				if (
					error.message &&
					(error.message.includes("502") || error.message.includes("504"))
				) {
					await new Promise((resolve) =>
						setTimeout(resolve, PAGINATION_DELAY * 4),
					);
				}

				// If we've exhausted retries or got a 401/403 error, break out
				if (
					retryCount >= MAX_RETRIES ||
					(error.message &&
						(error.message.includes("401") || error.message.includes("403")))
				) {
					break;
				}
			}
		}

		// If we still have an error after all retries, throw it
		if (fetchError && !nextPageData) {
			console.error(
				`Failed to fetch pagination data after ${MAX_RETRIES} retries for ${fieldName}`,
			);
			// Return what we have so far instead of failing completely
			return result;
		}

		// Get the field's data from the response
		const fieldPath = fieldName.split(".");
		let nextPageField = nextPageData;
		for (const pathPart of fieldPath) {
			nextPageField = nextPageField?.[pathPart];
			if (!nextPageField) break;
		}

		if (
			!nextPageField ||
			!nextPageField.edges ||
			nextPageField.edges.length === 0
		) {
			console.log(
				`No more data found for ${fieldName} after ${pagesCount} pages`,
			);
			break;
		}

		// Filter out any duplicates and add only new edges
		const newEdges = nextPageField.edges.filter(
			(edge) => !processedCursors.has(edge.cursor),
		);

		// If we didn't get any new edges after filtering, we've got all the data
		if (newEdges.length === 0) {
			console.log(
				`All data already fetched for ${fieldName} (detected duplicate cursors)`,
			);
			break;
		}

		// Add all new cursors to our processed set
		newEdges.forEach((edge) => processedCursors.add(edge.cursor));

		// Append only the new edges to our result
		result.edges = [...result.edges, ...newEdges];

		// Update pagination info
		hasNextPage = nextPageField.pageInfo?.hasNextPage;

		// Update the offset for the next request
		currentOffset += pageSize;

		// Update page info and count
		result.pageInfo = nextPageField.pageInfo;
		result.count = result.edges.length;

		// Increment page counter
		pagesCount++;

		// Log progress for monitoring
		console.log(
			`Fetched page ${pagesCount} for ${fieldName}: ${newEdges.length} new items (total: ${result.edges.length}/${nextPageField.totalCount || "unknown"})`,
		);

		// Safety check to prevent infinite loops
		if (
			result.edges.length >= (nextPageField.totalCount || 40000) ||
			pagesCount > 4000
		) {
			console.log(`Reached data limit or max pages for ${fieldName}`);
			break;
		}
	}

	console.log(
		`Completed pagination for ${fieldName}: ${result.edges.length} total items in ${pagesCount} pages`,
	);
	return result;
};

// Function to update the query with a new offset
const updateQueryWithOffset = (query, fieldName, offset) => {
	// Simple regex-based approach to update the offset parameter
	// This assumes the field structure is consistent
	const fieldRoot = fieldName.split(".")[0];
	const regex = new RegExp(`${fieldRoot}\\s*\\([^)]*\\)`, "g");

	return query.replace(regex, `${fieldRoot}(offset: ${offset})`);
};

export const cleanGraphQLResponse = (input) => {
	if (!input) return null;

	const isPrimitiveType = (test) => {
		return test !== Object(test);
	};

	if (isPrimitiveType(input)) return input;

	const output = {};
	const isObject = (obj) => {
		return obj !== null && typeof obj === "object" && !Array.isArray(obj);
	};

	Object.keys(input).forEach((key) => {
		if (input[key]?.edges) {
			output[key] = input[key].edges.map((edge) =>
				cleanGraphQLResponse(edge.node),
			);
		} else if (isObject(input[key])) {
			output[key] = cleanGraphQLResponse(input[key]);
		} else if (key !== "__typename") {
			output[key] = input[key];
		}
	});

	return output;
};
