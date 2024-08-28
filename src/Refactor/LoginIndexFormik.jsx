import { Formik, Field, ErrorMessage, Form } from "formik";
import { useEffect } from "react";
import { notification } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import { LOGIN_ACTION, USER_ROLE } from "../Context/Actions";
import { loginInitialValues, loginValidationSchema } from "../Formik/index";
import RoutesConstant from "../Routes/Constant";
import bidShushi from "../Services/Api/Api";
import { LoginSvg } from "../Common/Svg";

/*
	Formik sa direct state management and validation track hogi to:
		onchange handler manually nahi likhna
		validation manually nahi likhna to validateEmail and valldatePassword function nahi hounga
		useffect sa jo preloading thi wo direct fomrik ma call hojai gi
*/

const Index = () => {
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const message = searchParams.get("message");

	const { api, contextHolder } = notification.useNotification();

	const { user, dispatch } = useAuthContext();
	const navigate = useNavigate();

	//Notifications messages
	const ERROR_MESSAGES = {
		loginFailed: "Login Failed",
		tokenExpired: "Token Expired. This link has already been used or expired.",
	};

	//Notifications
	const handleTokenExpiredNotification = () => {
		if (message) {
			api.error({
				message: ERROR_MESSAGES.tokenExpired,
				description: "This link has already been used or expired.",
				placement: "topRight",
			});
		}
	};

	useEffect(() => {
		if (user) {
			//If user is already logged in navigate to main page
			navigate(RoutesConstant.main);
		}
		//If login session is expired show notification
		handleTokenExpiredNotification();
	}, [user, message]);

	// form submission handler
	const handleSubmit = (values, { setSubmitting }) => {
		const { email, password } = values;
		const userData = {
			email: email.trim().toLowerCase(),
			password: password.trim(),
		};

		bidShushi
			.login(userData)
			.then((res) => {
				if (values.rememberMe) {
					localStorage.setItem("email", email);
					localStorage.setItem("password", password);
				}
				localStorage.setItem("user", JSON.stringify(res.user));
				localStorage.setItem("bidshushi_tokens", JSON.stringify(res.tokens));
				dispatch({ type: LOGIN_ACTION, payload: res.user });
				dispatch({ type: USER_ROLE, payload: res.user.userRole.name });
				const locationParam = searchParams.get("location");
				navigate(locationParam ? `/${locationParam}` : RoutesConstant.main);
			})
			.catch((err) => {
				api.error({
					message: ERROR_MESSAGES.loginFailed,
					description: err?.message,
					placement: "topRight",
				});
				console.log(err);
			})
			.finally(() => setSubmitting(false));
	};

	return (
		<section className="account-wrapper">
			{contextHolder}
			<main className="main">
				<div className="login-container ">
					<div className="login-form-wrapper mt-3">
						<LoginSvg />
						<h1>Login to Your Account</h1>
						<Formik
							initialValues={loginInitialValues}
							validationSchema={loginValidationSchema}
							onSubmit={handleSubmit}
						>
							{({ isSubmitting, isValid }) => (
								<Form>
									<div className="form-group">
										<label>
											Username{" "}
											<i className="float-end">
												<img src="/images/user-icon.png" />{" "}
											</i>{" "}
										</label>
										<Field
											className="form-control"
											placeholder="Enter Your Username"
											type="text"
											id="user"
											name="email"
											tabIndex="1"
										/>
										<ErrorMessage
											name="email"
											component="span"
											className="text-danger"
										/>
									</div>
									<div className="form-group">
										<label>
											Password{" "}
											<i className="float-end">
												<img src="/images/key-icon.png" alt="Key Icon" />{" "}
											</i>
										</label>
										<Field
											className="form-control"
											placeholder="Enter Your Password"
											type="password"
											id="password"
											name="password"
											tabIndex="2"
										/>
										<ErrorMessage
											name="password"
											component="span"
											className="text-danger"
										/>
									</div>
									<div className="row mb-2 mt-4">
										<div className="col-md-6">
											<div className="form-group-check pt-0">
												<div className="form-check form-check-inline">
													<Field
														className="form-check-input"
														tabIndex="3"
														type="checkbox"
														id="rememberMe"
														name="rememberMe"
													/>
													<label
														className="form-check-label simple-label no-style"
														htmlFor="rememberMe"
													>
														{" "}
														Remember me
													</label>
												</div>
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
					</div>
				</div>
			</main>
		</section>
	);
};
export default Index;
