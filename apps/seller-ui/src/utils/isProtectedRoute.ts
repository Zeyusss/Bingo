export const isProtectedRoute = (pathname: string) => {
  const publicPaths = ["/login", "/register", "/forgot-password"];
  return !publicPaths.includes(pathname);
};
