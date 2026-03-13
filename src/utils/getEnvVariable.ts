/**
 * Reads a CRA environment variable by name.
 * By default, prepends the `REACT_APP_` prefix automatically.
 * Pass `raw: true` to access the variable name as-is (e.g. PUBLIC_URL).
 */
const getEnvVariable = (name: string, fallback: any = null, raw = false) => {
  const key = raw ? name : `REACT_APP_${name}`;
  return process.env[key] || fallback;
};

export default getEnvVariable;
