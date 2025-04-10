export const graphqlFetch = async (
	url,
	query,
	variables = {},
	headers = {},
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

		return data.data;
	} catch (error) {
		console.error("Error GraphQL request:", error);
		throw error;
	}
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
