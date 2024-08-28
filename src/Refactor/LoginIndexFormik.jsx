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
import { FormControls } from "../Components/InputFields/FormControls";

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
									<FormControls
										control="input"
										type="text"
										name="email"
										imgsrc="/images/user-icon.png"
										placeholder="Enter Your Email"
										tabIndex="1"
										label="Username"
									/>
									<FormControls
										control="input"
										type="password"
										name="password"
										imgsrc="/images/key-icon.png"
										placeholder="Enter Your Password"
										tabIndex="2"
										label="Password"
									/>
									<div className="row mb-2 mt-4">
										<FormControls
											control="checkbox"
											name="rememberMe"
											label="Remember Me"
											tabIndex="3"
											className="col-md-6"
											options={[{ value: "rememberMe", key: "Remember Me" }]}
										/>
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
