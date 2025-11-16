/**
 * Utility function to extract error messages from API responses
 * Handles the specific error format: { type: "failure", status: 400, data: "[{\"error\":1},\"Error message\"]" }
 */
export function extractErrorMessage(error: any): string {
    let errorMessage = 'An error occurred';

    // Check if error has response data
    if (error?.response?.data) {
        const responseData = error.response.data;

        // Handle the specific error format with data field
        if (responseData.data) {
            try {
                // Handle string data that might be JSON
                if (typeof responseData.data === 'string') {
                    const parsedData = JSON.parse(responseData.data);
                    if (Array.isArray(parsedData) && parsedData.length > 1) {
                        errorMessage = parsedData[1]; // Get the error message from the array
                    } else {
                        errorMessage = responseData.data;
                    }
                } else if (typeof responseData.data === 'object') {
                    errorMessage = responseData.data.message || responseData.data.error || errorMessage;
                } else {
                    errorMessage = responseData.data;
                }
            } catch (e) {
                // If parsing fails, use the raw data as error message
                errorMessage = responseData.data;
            }
        }
        // Handle direct message/error fields
        else if (responseData.message) {
            errorMessage = responseData.message;
        } else if (responseData.error) {
            errorMessage = responseData.error;
        }
        // Handle failure type responses
        else if (responseData.type === 'failure') {
            errorMessage = 'Request failed';
        }
    }
    // Handle error.message fallback
    else if (error?.message) {
        errorMessage = error.message;
    }

    return errorMessage;
}

/**
 * Check if a response should be treated as an error
 */
export function isErrorResponse(response: any): boolean {
    // Consider only actual error status codes as errors
    // 2xx status codes are success (200, 201, 202, 204, etc.)
    const isSuccessStatus = response.status >= 200 && response.status < 300;
    const hasFailureType = response.data && response.data.type === 'failure';
    
    return !isSuccessStatus || hasFailureType;
}