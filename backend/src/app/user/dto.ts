export interface UserDTO {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUsernameDTO {
  newUsername: string;
}

// DTO untuk pembaruan password
export interface UpdatePasswordDTO {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
