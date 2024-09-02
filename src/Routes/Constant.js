const RoutesConstant = {
	main: "/",
	login: "/login",
	updatePassword: "/update-password",
	updatePasswordSuccess: "/update-password/success",
	accountActivation: "/account-activation",
	accountActivationSuccess: "/account-activation/success",
	forgotPassword: "/forgot-password",
	forgotPasswordSuccess: "/forgot-password/success",
	calendar: "/calendar",
	userList: "/user-list",
	bidSetup: "/bidsetup",
	bidSetupEdit: "/bidsetup/:bidId",
	bidManagement: "/bidmanagement/:bidId",
	externalUserList: "/external-user-list",
	calendarManagement: "/calendar-management",
	userManagement: "/user-management",
	userProfile: "/user-profile",
	userForm: "/user-management/user-form",
	userFormEdit: "/user-management/user-form/:userId",
	externalUserManagement: "/external-user-management",
	externalUserForm: "/external-user-management/external-user-form",
	externalUserFormEdit:
		"/external-user-management/external-user-form/:externalUserId",
	stageMasterList: "/stage-master-list",
	crudTable: "/crud-table",
}

export default RoutesConstant
