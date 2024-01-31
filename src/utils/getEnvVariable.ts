const getEnvVariable = (name: string, fallback: any = null) => {
  const envVariables = process.env;
  const variableValue = envVariables[`REACT_APP_${name}`] || fallback;
  return variableValue;
};

export default getEnvVariable;
