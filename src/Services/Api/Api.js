import { BASE_URL } from "./Constant";
import request from "../requests";

function login(data) {
  return request({
    url: `${BASE_URL}/auth/login`,
    method: "POST",
    data,
  });
}

function verifyActivationAccountToken(token, type) {
  return request({
    url: `${BASE_URL}/auth/is-account-activation-token-expired?token=${token}&type=${type}`,
    method: "GET",
  });
}

function verifyResetPasswordToken(token, type) {
  return request({
    url: `${BASE_URL}/auth/is-password-reset-token-expired?token=${token}&type=${type}`,
    method: "GET",
  });
}

function getAllActiveUsers(page = 0, size = -1) {
  return request({
    url: `${BASE_URL}/users/getUsers?isActive=true&page=${page}&size=${size}`,
    method: "GET",
  });
}

function getAppSettings() {
  return request({
    url: `${BASE_URL}/appSettings/getAppSettings`,
    method: "GET",
  });
}

function getAllUsers(page, size) {
  return request({
    url: `${BASE_URL}/users/getUsers?&page=${page}&size=${size}`,
    method: "GET",
  });
}

function getBidStatuses() {
  return request({
    url: `${BASE_URL}/bidStatuses/getBidStatuses`,
    method: "GET",
  });
}

function getAllExternalUsers(page = 0, size = -1, sortColumn, sortBy) {
  let url = `${BASE_URL}/users/getUsers?isActive=true&role=${EXTERNAL_ROLE}&page=${page}&size=${size}`;
  if (sortColumn != "" && sortBy != "") {
    url += `&sortBy=${sortColumn} ${sortBy}`;
  }
  return request({
    url: url,
    method: "GET",
  });
}

function createUser(data) {
  return request({
    url: `${BASE_URL}/users/createUser`,
    method: "POST",
    data,
  });
}

function resendEmailVerification(userId) {
  return request({
    url: `${BASE_URL}/users/resendEmailVerification/${userId}`,
    method: "GET",
  });
}

function updateUser(userId, data) {
  return request({
    url: `${BASE_URL}/users/updateUser/` + userId,
    method: "PUT",
    data,
  });
}

function updateUserProfile(userId, data) {
  return request({
    url: `${BASE_URL}/users/updateUserProfile/` + userId,
    method: "PUT",
    data,
  });
}

const bidShushi = {
  login,
  createUser,
  resendEmailVerification,
  verifyActivationAccountToken,
  verifyResetPasswordToken,
  updateUser,
  updateUserProfile,
};

export default bidShushi;
