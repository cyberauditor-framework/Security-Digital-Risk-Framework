const graphqlFetch = async (url, query, variables = {}, headers = {}) => {
    try {
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...headers
      };
  
      const body = JSON.stringify({
        query,
        variables
      });
  
      const response = await fetch(url, {
        method: 'POST',
        headers: defaultHeaders,
        body
      });
  
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
  
      if (data.errors && data.errors.length > 0) {
        throw {
          message: 'Error GraphQL response',
          errors: data.errors,
          data: data.data
        };
      }
  
      return data.data;
    } catch (error) {
      console.error('Error GraphQL request:', error);
      throw error;
    }
  };
