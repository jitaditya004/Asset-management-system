// minimal client-side helpers: we rely on cookie for auth
export const logout = async (api) => {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    console.error(err);
    // ignore
  } finally {
    window.location.href = "/login";
  }
};
