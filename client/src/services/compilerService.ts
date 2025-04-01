import api from './config';

/**
 * Executes the provided code in the specified programming language by making a POST request
 * to the server's `/execute` endpoint.
 *
 * @param code - The source code to be executed.
 * @param language - The programming language of the provided source code.
 * @returns A promise that resolves to the output of the executed code as a string.
 *          If an error occurs during execution, it returns an error message.
 *
 * @throws Will log an error to the console if the request fails.
 */
const executeCode = async (code: string, language: string) => {
  try {
    const response = await api.post(`${process.env.REACT_APP_SERVER_URL}/execute`, {
      script: code,
      language,
      versionIndex: '0',
    });
    return response.data.output;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error executing code:', error); // log to console for debugging
    return `Error executing code. ${error}`;
  }
};

export default executeCode;
