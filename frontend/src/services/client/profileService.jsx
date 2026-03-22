import httpClient from "../../utils/httpClient";

/** GET /users/me → UserResponse */
export const getMyProfile = async () => {
  const res = await httpClient.get("/users/me");
  return res.data;
};

/**
 * PUT /users/me  (multipart/form-data)
 * data: UserUpdateRequest { fullName, dob, gender, phone, address, password? }
 * avatar: File (optional)
 */
export const updateMyProfile = async (data, avatarFile = null) => {
  const form = new FormData();
  form.append(
    "data",
    new Blob([JSON.stringify(data)], { type: "application/json" }),
  );
  if (avatarFile) form.append("avatar", avatarFile);

  const res = await httpClient.put("/users/me", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

/**
 * PATCH /users/me/password
 * { oldPassword, newPassword }
 */
export const changePassword = async (oldPassword, newPassword) => {
  const res = await httpClient.patch("/users/me/password", {
    oldPassword,
    newPassword,
  });
  return res.data;
};
