export const getAccountResource = async (
  address: string,
  resourceType: string
) => {
  const res = await fetch(
    `${process.env.API_URL}/accounts/${address}/resource/${resourceType}`
  );
  return await res.json();
};
export const getAccountResources = async (address: string) => {
  const res = await fetch(
    `${process.env.API_URL}/accounts/${address}/resources`
  );
  return await res.json();
};

export const getAccountEvents = async (
  address: string,
  structTag: string,
  fieldName: string,
  start?: number,
  limit?: number
) => {
  const res = await fetch(
    `${
      process.env.API_URL
    }/accounts/${address}/events/${structTag}/${fieldName}?${
      typeof start !== "undefined" ? "&start=" + start : ""
    }${typeof limit !== "undefined" ? "&limit=" + limit : ""}`
  );
  return await res.json();
};
