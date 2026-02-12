const normalizeBasePath = (basePath = "/") => {
  if (!basePath) return "/";
  return basePath.endsWith("/") ? basePath : `${basePath}/`;
};

const BASE_PATH = normalizeBasePath(import.meta.env.BASE_URL || "/");

export const withBasePath = (path = "") => {
  const safePath = String(path).replace(/^\/+/, "");
  return `${BASE_PATH}${safePath}`;
};

