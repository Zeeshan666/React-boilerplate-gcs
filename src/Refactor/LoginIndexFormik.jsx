import {Formik, Field, ErrorMessage, Form} from "formik"
import {useEffect} from "react"
import {notification} from "antd"
import {Link, useNavigate, useLocation} from "react-router-dom"
import {useAuthContext} from "hooks/useAuthContext"
import {LOGIN_ACTION, USER_ROLE} from "Context/Actions"

import RoutesConstant from "Routes/Constant"
import bidShushi from "Services/Api/Api"
import {LoginSvg} from "Common/Svg"

const Index = () => {
	const location = useLocation()
	const searchParams = new URLSearchParams(location.search)
	const message = searchParams.get("message")

	const {api, contextHolder} = notification.useNotification()

	const {user, dispatch} = useAuthContext()
	const navigate = useNavigate()

	//Notifications messages
	const ERROR_MESSAGES = {
		loginFailed: "Login Failed",
		tokenExpired: "Token Expired. This link has already been used or expired.",
	}

	//Notifications
	const handleTokenExpiredNotification = () => {
		if (message) {
			api.error({
				message: ERROR_MESSAGES.tokenExpired,
				description: "This link has already been used or expired.",
				placement: "topRight",
			})
		}
	}

	useEffect(() => {
		if (user) {
			//If user is already logged in navigate to main page
			navigate(RoutesConstant.main)
		}
		//If login session is expired show notification
		handleTokenExpiredNotification()
	}, [user, message])

	// form submission handler
	const handleSubmit = (values, {setSubmitting}) => {
		const {email, password} = values
		// alert(
		// 	"Email: " +
		// 		email +
		// 		" Password: " +
		// 		password +
		// 		" RememberMe: " +
		// 		values.rememberMe +
		// 		" Location: " +
		// 		searchParams.get("location") +
		// 		" Date of Birth: " +
		// 		values.date +
		// 		" Cities: " +
		// 		values.selectedOption +
		// 		" Gender: " +
		// 		values.gender +
		// 		" Description " +
		// 		values.description +
		// 		" Checkbox: " +
		// 		values.checkbox
		// );
		console.log(values)
		const userData = {
			email: email.trim().toLowerCase(),
			password: password.trim(),
		}

		console.log(userData)

		bidShushi
			.login(userData)
			.then((res) => {
				if (values.rememberMe) {
					localStorage.setItem("email", email)
					localStorage.setItem("password", password)
					console.log(res)
				}
				localStorage.setItem("user", JSON.stringify(res.user))
				localStorage.setItem("bidshushi_tokens", JSON.stringify(res.tokens))
				dispatch({type: LOGIN_ACTION, payload: res.user})
				dispatch({type: USER_ROLE, payload: res.user.userRole.name})
				const locationParam = searchParams.get("location")
				navigate(locationParam ? `/${locationParam}` : RoutesConstant.main)
			})
			.catch((err) => {
				api.error({
					message: ERROR_MESSAGES.loginFailed,
					description: err?.message,
					placement: "topRight",
				})
				console.log(err)
			})
			.finally(() => setSubmitting(false))
	}

	return (
		<section className="account-wrapper">
			{contextHolder}
			<main className="main">
				<div className="login-container ">
					<div className="login-form-wrapper mt-3">
						<LoginSvg />
						<h1>Login to Your Account</h1>
						{/* <Formik
							initialValues={loginInitialValues}
							validationSchema={loginValidationSchema}
							onSubmit={handleSubmit}
						>
							{({isSubmitting, isValid, values}) => (
								<Form>
									<div className="form-group form-control">
										<FormControls
											control="input"
											type="text"
											name="email"
											imgsrc="/images/user-icon.png"
											placeholder="Enter Your Email"
											tabIndex="1"
											label="Username"
											labelClass="float-end"
											fieldClass="form-control"
											errorClass="text-danger"
										/>
									</div>
									<div className="form-group form-control">
										<FormControls
											control="input"
											type="password"
											name="password"
											imgsrc="/images/key-icon.png"
											placeholder="Enter Your Password"
											tabIndex="2"
											label="Password"
											labelClass="float-end"
											fieldClass="form-control"
											errorClass="text-danger"
										/>
									</div>
									<div className="row mb-2 mt-4">
										<div className="col-md-6">
											<div className="form-group-check pt-0">
												<FormControls
													control="checkboxBool"
													name="rememberMe"
													label="Remember Me"
													tabIndex="3"
													options={[{key: "Remember Me", value: "rememberMe"}]}
													labelClass="form-check-label simple-label no-style"
													keyClass="form-check form-check-inline"
													fieldClass="form-check-input"
													errorClass="text-danger"
												/>
											</div>
										</div>

										<div className="col-md-6 text-end">
											<Link
												to={RoutesConstant.forgotPassword}
												className="small"
											>
												Forgot Password?
											</Link>
										</div>
									</div>
									<div className="form-group form-control">
										<FormControls
											control="select"
											name="selectedOption"
											label="Select your fav city"
											tabIndex="4"
											placeholder="Select City"
											options={[
												{key: "KHI", value: "karachi"},
												{key: "LHR", value: "lahore"},
												{key: "ISL", value: "islamabad"},
												{key: "PES", value: "peshawar"},
											]}
											fieldClass="form-control"
											labelClass="float-end"
											errorClass="text-danger"
										/>
									</div>
									<div className="form-group form-control">
										<FormControls
											control="date"
											label="Date"
											name="date"
											placeholder="Select Date"
											tabIndex="5"
											fieldClass="form-control"
											labelClass="float-end"
											errorClass="text-danger"
										/>
									</div>
									<div className="form-group form-control">
										<FormControls
											control="radio"
											name="gender"
											label="Gender"
											tabIndex="6"
											options={[
												{key: "Male", value: "male"},
												{key: "Female", value: "female"},
											]}
											fieldClass="form-group form-control"
											labelClass="float-end"
											errorClass="text-danger"
										/>
									</div>
									<div className="form-group form-control">
										<FormControls
											control="textarea"
											name="description"
											label="Description"
											placeholder="Description"
											tabIndex="7"
											fieldClass="form-control"
											labelClass="float-end"
											errorClass="text-danger"
										/>
									</div>
									<div className="form-group form-control">
										<FormControls
											control="checkbox"
											name="checkbox"
											label="Checkbox"
											tabIndex="8"
											options={[
												{key: "HTML/CSS", value: "html"},
												{key: "Javascript", value: "javascript"},
												{key: "ReactJS", value: "react"},
											]}
											fieldClass="form-control"
											labelClass="float-end"
											errorClass="text-danger"
										/>
									</div>
									<button
										type="submit"
										className="btn btn-secondary btn-submit w-100 mt-3 mb-3"
										disabled={isSubmitting || !isValid}
									>
										Login
									</button>
								</Form>
							)}
						</Formik>
						<div>
							<ModalController modalConfig={modalConfigOne} />
							<ModalController modalConfig={modalConfigTwo} />
							<ModalController modalConfig={dirtyModalConfig} />
						</div> */}
					</div>
				</div>
			</main>
			<div>
				<DynamicTable />
			</div>
		</section>
	)
}
export default Index
