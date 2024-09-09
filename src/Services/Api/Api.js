import {BASE_URL} from "./Constant"
import request from "../requests"

function login(data) {
	return request({
		url: `${BASE_URL}/auth/login`,
		method: "POST",
		data,
	})
}

function verifyActivationAccountToken(token, type) {
	return request({
		url: `${BASE_URL}/auth/is-account-activation-token-expired?token=${token}&type=${type}`,
		method: "GET",
	})
}

function verifyResetPasswordToken(token, type) {
	return request({
		url: `${BASE_URL}/auth/is-password-reset-token-expired?token=${token}&type=${type}`,
		method: "GET",
	})
}

function createUser(data) {
	return request({
		url: `${BASE_URL}/users/createUser`,
		method: "POST",
		data,
	})
}

function resendEmailVerification(userId) {
	return request({
		url: `${BASE_URL}/users/resendEmailVerification/${userId}`,
		method: "GET",
	})
}

function updateUser(userId, data) {
	return request({
		url: `${BASE_URL}/users/updateUser/` + userId,
		method: "PUT",
		data,
	})
}

function updateUserProfile(userId, data) {
	return request({
		url: `${BASE_URL}/users/updateUserProfile/` + userId,
		method: "PUT",
		data,
	})
}

const Tornado = {
	login,
	createUser,
	resendEmailVerification,
	verifyActivationAccountToken,
	verifyResetPasswordToken,
	updateUser,
	updateUserProfile,
}

export default Tornado
