import React, { useState, useEffect } from "react";
import { notification } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../../hooks/useAuthContext";
import { LOGIN_ACTION, USER_ROLE } from "../../Context/Actions";
import { USER_EMAIL_REGEX } from "../../Common/index";
import RoutesConstant from "../../Routes/Constant";
import bidShushi from "../../Services/Api/Api";

const Index = () => {
	//Notifications

	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);
	const message = searchParams.get("message");

	const [api, contextHolder] = notification.useNotification();

	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(false);

	useEffect(() => {
		if (user) {
			navigate(RoutesConstant.main);
		}
		if (message) {
			api.error({
				message: `Token Expired.`,
				description: "This link has already been used or expired.",
				placement: "topRight",
			});
		}
	}, []);

	const [error, setError] = useState({
		email: false,
		password: false,
	});

	const { dispatch, user } = useAuthContext();

	const onChangeHandler = (e) => {
		let name = e.target.name;
		let value = e.target.value.trim();
		if (name === "email") {
			value = value.toLowerCase();
			setEmail(value);
			let re = USER_EMAIL_REGEX;
			if (re.test(value)) {
				setError((preState) => {
					return {
						...preState,
						email: false,
					};
				});
			} else {
				setError((preState) => {
					return {
						...preState,
						email: true,
					};
				});
			}
		} else if (name == "password") {
			setPassword(value);
			if (value.length == 0) {
				setError((preState) => {
					return {
						...preState,
						password: true,
					};
				});
			} else {
				setError((preState) => {
					return {
						...preState,
						password: false,
					};
				});
			}
		} else if (name == "remember") {
			setRememberMe(e.target.checked);
		}
	};

	const checkForError = () => {
		let re = USER_EMAIL_REGEX;
		//  setEmail(email&&email.trim());
		if (!email || !re.test(email)) {
			setError((preState) => {
				return {
					...preState,
					email: true,
				};
			});
		}
		if (!password) {
			setError((preState) => {
				return {
					...preState,
					password: true,
				};
			});
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();
		// handle form submission here
	};

	useEffect(() => {
		// If "remember me" was checked and there is saved username and password in localStorage,
		// pre-populate the form fields with the saved data
		const storedEmail = localStorage.getItem("email");
		const storedPassword = localStorage.getItem("password");

		if (storedEmail) {
			setEmail(storedEmail);
			setRememberMe(true);
		}

		if (storedPassword) {
			setPassword(storedPassword);
		}
	}, []);

	const postData = () => {
		let re = USER_EMAIL_REGEX;
		console.log(email, password);
		if (
			email &&
			email.trim() &&
			password &&
			re.test(email) &&
			Object.values(error).every((value) => value === false)
		) {
			let finalEmail = email.trim().toLowerCase();
			let user = {
				email: finalEmail,
				password,
			};
			bidShushi
				.login(user)
				.then((res) => {
					// If "remember me" is checked, store the username and password in localStorage
					if (rememberMe) {
						localStorage.setItem("email", email);
						localStorage.setItem("password", password);
					}
					localStorage.setItem("user", JSON.stringify(res.user));
					localStorage.setItem("bidshushi_tokens", JSON.stringify(res.tokens));
					dispatch({ type: LOGIN_ACTION, payload: res.user });
					dispatch({ type: USER_ROLE, payload: res.user.userRole.name });
					const searchParams = new URLSearchParams(location.search);
					if (searchParams.get("location")) {
						navigate("/" + searchParams.get("location"));
					} else {
						navigate(RoutesConstant.main);
					}
					//navigate(RoutesConstant.main)
				})
				.catch((err) => {
					api.error({
						message: `Login Failed`,
						description: err?.message,
						placement: "topRight",
					});
					console.log(err);
				});
		} else {
			setEmail(email && email.trim());
			checkForError();
		}
	};

	return (
		<section className="account-wrapper">
			{contextHolder}
			<main className="main">
				<div className="login-container ">
					<div className="login-form-wrapper mt-3">
						{/* <img src="images/BidSushi-Logo.svg" alt="Logo" className="logo" /> */}
						<svg
							id="Layer_1"
							data-name="Layer 1"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 402.32164 89.51875"
						>
							<defs></defs>
							<path
								class="cls-1"
								d="M189.64669,120.39376q3.67089-.668,8.34375-1.12695,4.67137-.457,8.42773-.459a34.24487,34.24487,0,0,1,7.63379.793,16.01173,16.01173,0,0,1,5.9248,2.58692,11.98274,11.98274,0,0,1,3.8379,4.79785,17.55856,17.55856,0,0,1,1.37695,7.3418,16.79087,16.79087,0,0,1-1.79395,8.17773,11.33432,11.33432,0,0,1-5.63281,4.92285q5.00684,1.83544,6.96777,5.46485a17.92454,17.92454,0,0,1,1.96094,8.63574,18.32015,18.32015,0,0,1-1.37695,7.55176,11.9226,11.9226,0,0,1-3.83789,4.83886,15.48629,15.48629,0,0,1-5.79981,2.54492,33.03127,33.03127,0,0,1-7.25879.751H191.64864q-2.00244,0-2.00195-1.91894Zm8.51074,23.86328h9.26172a19.64182,19.64182,0,0,0,4.08789-.376,6.538,6.538,0,0,0,2.96289-1.418,6.17555,6.17555,0,0,0,1.79394-2.83692,15.31932,15.31932,0,0,0,.584-4.63086,14.327,14.327,0,0,0-.626-4.63085,6.15148,6.15148,0,0,0-1.91894-2.83692,7.654,7.654,0,0,0-3.2959-1.46,24.09664,24.09664,0,0,0-4.83985-.418q-2.08593,0-4.33886.167-2.25294.16847-3.6709.418Zm0,26.03223h9.5957a20.49034,20.49034,0,0,0,4.63086-.459,7.70056,7.70056,0,0,0,3.25391-1.543,6.40558,6.40558,0,0,0,1.91894-2.9209,14.70733,14.70733,0,0,0,.626-4.67188,13.54447,13.54447,0,0,0-.835-5.21484,6.08266,6.08266,0,0,0-2.54492-2.96289,10.76155,10.76155,0,0,0-4.21289-1.293,51.19167,51.19167,0,0,0-5.84082-.292h-6.5918Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-1"
								d="M240.62618,128.06954a6.0334,6.0334,0,0,1-3.96289-1.043,5.7407,5.7407,0,0,1,0-7.05078,7.71094,7.71094,0,0,1,7.88476,0,5.58942,5.58942,0,0,1,0,7.05078A6.05968,6.05968,0,0,1,240.62618,128.06954Zm4.17187,49.14551h-6.4248q-2.00244,0-2.002-1.91894V134.74532h6.4248q2.00244,0,2.00195,1.91895Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-1"
								d="M269.24532,177.966q-7.50879,0-10.88867-5.54883-3.37939-5.54736-3.37891-16.06152,0-12.01612,4.12988-17.23047,4.12939-5.21339,12.47364-5.21485a21.15843,21.15843,0,0,1,5.7998.668,16.71865,16.71865,0,0,1,3.46192,1.335V117.30587h6.4248a2.07319,2.07319,0,0,1,1.46094.501,1.8383,1.8383,0,0,1,.542,1.418v57.99023h-5.08984a2.722,2.722,0,0,1-1.544-.417,2.25865,2.25865,0,0,1-.792-1.66895l-.334-2.58691a19.70308,19.70308,0,0,1-4.88086,3.75488A14.88181,14.88181,0,0,1,269.24532,177.966ZM280.843,141.83712a21.072,21.072,0,0,0-3.37891-1.085,17.56629,17.56629,0,0,0-3.96289-.417,12.52739,12.52739,0,0,0-4.88184.834,6.502,6.502,0,0,0-3.08691,2.71192,13.36344,13.36344,0,0,0-1.585,4.83984,48.03306,48.03306,0,0,0-.459,7.21777q0,7.92774,1.752,11.51368,1.752,3.58886,6.50781,3.58789a10.84155,10.84155,0,0,0,5.54883-1.293,17.49361,17.49361,0,0,0,3.5459-2.62793Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-2"
								d="M314.96993,177.966a53.81172,53.81172,0,0,1-7.92676-.584,35.5311,35.5311,0,0,1-6.0918-1.335,1.6808,1.6808,0,0,1-1.168-1.75195v-2.41992q2.58545.41748,6.46679,1.043a52.768,52.768,0,0,0,8.38574.626,23.35,23.35,0,0,0,6.63282-.793,9.9254,9.9254,0,0,0,4.13086-2.25293,8.07954,8.07954,0,0,0,2.12695-3.58789,17.297,17.297,0,0,0,.626-4.88086,13.9504,13.9504,0,0,0-.667-4.63086,7.67684,7.67684,0,0,0-2.25293-3.2539,14.46491,14.46491,0,0,0-4.29687-2.41992q-2.71288-1.043-6.7168-2.29493-3.33837-1.00048-6.09179-2.12792a16.83361,16.83361,0,0,1-4.75586-2.87793,11.5929,11.5929,0,0,1-3.08692-4.38086,17.229,17.229,0,0,1-1.085-6.54981,18.0265,18.0265,0,0,1,.96-6.0498,11.33151,11.33151,0,0,1,3.04492-4.63086,14.49587,14.49587,0,0,1,5.46582-3.00293,26.81137,26.81137,0,0,1,8.13477-1.085q1.50293,0,3.33789.083,1.834.085,3.58789.292,1.752.20947,3.2959.501a25.12939,25.12939,0,0,1,2.62793.626,1.68261,1.68261,0,0,1,1.168,1.75195v2.41992q-2.58691-.41748-6.29883-.876a58.91789,58.91789,0,0,0-7.21777-.459q-7.51026,0-10.34668,2.62793-2.83741,2.62794-2.83692,7.71778a12.837,12.837,0,0,0,.709,4.58984,7.43783,7.43783,0,0,0,2.21191,3.08691,13.77946,13.77946,0,0,0,3.87988,2.16993q2.37744.91845,5.63184,1.91894a72.05609,72.05609,0,0,1,7.46777,2.54492,17.91026,17.91026,0,0,1,5.17285,3.12891,10.91443,10.91443,0,0,1,3.00391,4.50488,19.97675,19.97675,0,0,1,.96,6.67578q0,8.00977-4.33887,11.97364Q324.48019,177.967,314.96993,177.966Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-2"
								d="M371.03926,172.62618a23.51658,23.51658,0,0,1-2.21093,1.91895,16.70546,16.70546,0,0,1-3.0459,1.83594,19.07478,19.07478,0,0,1-3.92188,1.335,21.201,21.201,0,0,1-4.75586.5q-6.09081,0-9.67871-3.46289-3.58885-3.46-3.58789-11.13867V135.24532h3.4209a1.10633,1.10633,0,0,1,1.252,1.252v26.95019q0,5.7583,2.62793,8.21875a9.77892,9.77892,0,0,0,6.96778,2.46192,15.71735,15.71735,0,0,0,4.21289-.543,17.32765,17.32765,0,0,0,6.46679-3.33692,20.9185,20.9185,0,0,0,2.08594-1.96093v-33.042h3.4209a1.10633,1.10633,0,0,1,1.252,1.252v40.71777h-3.08789a1.106,1.106,0,0,1-1.251-1.25195Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-2"
								d="M387.3918,176.54708a1.5615,1.5615,0,0,1-1.085-1.585v-2.33594q2.16943.41748,5.34082.834a50.97465,50.97465,0,0,0,6.67481.417,26.73638,26.73638,0,0,0,5.71582-.5,8.52981,8.52981,0,0,0,3.46289-1.50195,5.05878,5.05878,0,0,0,1.71-2.41992,10.9103,10.9103,0,0,0,.459-3.3379,7.69873,7.69873,0,0,0-.709-3.58789,6.112,6.112,0,0,0-2.12793-2.25293,13.51913,13.51913,0,0,0-3.58789-1.543q-2.17091-.6255-5.08984-1.377-2.50342-.66649-4.75586-1.418a13.71729,13.71729,0,0,1-3.92188-2.00293,8.73079,8.73079,0,0,1-2.62793-3.21289,11.26078,11.26078,0,0,1-.96-4.96386,10.33718,10.33718,0,0,1,3.46289-8.30274q3.46143-2.96044,10.63867-2.96191.75,0,2.21094.042,1.459.04248,3.08691.209,1.62745.167,3.2129.417a16.70308,16.70308,0,0,1,2.58593.584,1.565,1.565,0,0,1,1.085,1.585v2.25293q-2.58691-.416-5.54882-.751a51.981,51.981,0,0,0-5.79883-.334,22.98122,22.98122,0,0,0-5.00586.459,8.81419,8.81419,0,0,0-3.21289,1.335,4.51127,4.51127,0,0,0-1.66895,2.16992,9.123,9.123,0,0,0-.458,3.04492,7.68731,7.68731,0,0,0,.542,3.12891,5.08477,5.08477,0,0,0,1.79394,2.08593,11.8783,11.8783,0,0,0,3.21192,1.502q1.96.627,4.79785,1.29394,2.83593.668,5.29883,1.46a15.91491,15.91491,0,0,1,4.29687,2.08594,8.90979,8.90979,0,0,1,2.87891,3.4209,12.44823,12.44823,0,0,1,1.043,5.46484q0,6.5083-3.96387,9.26172-3.96387,2.75391-11.05567,2.75391-1.00049,0-2.66992-.083-1.66992-.085-3.4209-.251-1.75194-.16845-3.3789-.417A8.65438,8.65438,0,0,1,387.3918,176.54708Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-2"
								d="M429.52852,139.75118a18.30818,18.30818,0,0,1,5.33985-3.79687,18.74346,18.74346,0,0,1,8.42675-1.71q6.09082,0,9.67969,3.46289,3.58594,3.46288,3.58789,11.13867v28.36914h-3.42187a1.106,1.106,0,0,1-1.251-1.25195V149.0129q0-5.75684-2.62891-8.21875a9.78663,9.78663,0,0,0-6.96679-2.46191,15.75849,15.75849,0,0,0-4.21387.543,17.31324,17.31324,0,0,0-6.46582,3.33691,20.93119,20.93119,0,0,0-2.08594,1.96094v33.042h-3.4209a1.10632,1.10632,0,0,1-1.252-1.25195V117.30587h3.4209a1.1071,1.1071,0,0,1,1.252,1.252Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-2"
								d="M470.99727,127.06857a3.7771,3.7771,0,0,1-2.58691-.751,4.69071,4.69071,0,0,1,0-5.33984,4.8294,4.8294,0,0,1,5.17285,0,4.68623,4.68623,0,0,1,0,5.33984A3.7777,3.7777,0,0,1,470.99727,127.06857Zm-2.41992,8.17675h3.4209a1.10671,1.10671,0,0,1,1.252,1.252v40.71777h-3.42187a1.106,1.106,0,0,1-1.251-1.25195Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-2"
								d="M169.10947,120.89388a40.14353,40.14353,0,0,0-10.74015-7.963,87.54511,87.54511,0,0,0-28.431-9.39769,53.49175,53.49175,0,0,0-20.37985,1.10967A82.96927,82.96927,0,0,0,83.6427,114.93194c-3.55745,2.23675-6.94727,4.74532-9.1925,8.38117a38.96894,38.96894,0,0,0-2.35367,5.45957v35.57917a52.33451,52.33451,0,0,0,2.31653,5.80927,24.91513,24.91513,0,0,0,7.119,7.71838c8.68621,6.6815,18.60145,10.67978,29.19051,13.1491a49.09613,49.09613,0,0,0,15.67676,1.32494,73.221,73.221,0,0,0,18.21228-4.22374,68.01923,68.01923,0,0,0,19.25522-10.25062c3.57687-2.81243,6.8156-5.97467,8.43306-10.35968a14.799,14.799,0,0,0,.95636-4.89247c.08456-10.37518-.035-20.75215.081-31.12679A14.84118,14.84118,0,0,0,169.10947,120.89388Zm-6.71693,15.24144a27.75805,27.75805,0,0,1-8.60843,8.3,65.39423,65.39423,0,0,1-25.52325,9.74506c-.8108.134-1.63147.22026-2.45086.28731-1.11551.09135-2.2342.14281-3.06431.19373a58.41371,58.41371,0,0,1-19.87514-4.19021,53.02359,53.02359,0,0,1-13.89114-7.59043,23.20356,23.20356,0,0,1-6.47216-7.22981,9.79544,9.79544,0,0,1,.94554-11.35806,29.59439,29.59439,0,0,1,9.53933-7.69875,72.30133,72.30133,0,0,1,23.80023-8.04442,44.10775,44.10775,0,0,1,16.85285.84283,67.15469,67.15469,0,0,1,21.52327,8.55189,25.73835,25.73835,0,0,1,6.54049,5.664Q166.47347,129.63774,162.39254,136.13532Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-1"
								d="M151.78673,121.8848a39.52483,39.52483,0,0,0-7.63788.64837c-4.95129.90383-26.1905,1.40839-31.04022,1.74148a128.03194,128.03194,0,0,1-16.74179.43672c-2.99479-.19394-5.69249,1.13159-6.03817,3.159a9.05477,9.05477,0,0,0,.39952,2.94409l.32581-.07074a13.77662,13.77662,0,0,0,6.22057,3.672c5.20014,1.71585,27.64817,2.31063,34.03613,2.3727a75.43651,75.43651,0,0,0,16.45046-1.48239c4.93393-1.03765,8.16245-3.13169,10.02763-6.21631C160.29523,124.94436,157.99593,121.99506,151.78673,121.8848Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-1"
								d="M100.41227,137.5535c-3.76672-.69021-7.369-1.58033-11.14162-2.40112a18.54743,18.54743,0,0,0,5.175,6.2946c4.59024,3.52526,27.32,4.8658,35.95316,3.12675a64.44232,64.44232,0,0,0,16.18386-5.89236c.951-.47633,1.85644-.9973,2.59976-1.39879-3.30985.50606-6.71915,1.18416-10.05324,1.50587C131.061,139.56693,107.35792,138.82638,100.41227,137.5535Z"
								transform="translate(-72.09653 -103.00158)"
							/>
							<path
								class="cls-1"
								d="M100.36705,121.96533a16.94316,16.94316,0,0,0,3.80694.40559c2.99016-.07614,6.01906-.21454,9.06956-.49842,5.17166-.48117,26.73669-.9438,31.97607-2.21687a26.99013,26.99013,0,0,0,3.76821-1.20149c1.38084-.56282,1.60746-1.26925.65063-1.78015a8.529,8.529,0,0,0-2.04233-.74306,44.299,44.299,0,0,0-10.77121-.92143c-5.93.10475-28.08267,1.55992-34.09248,3.83439-.69023.39627-1.68816.88593-2.51806,1.46645C99.13975,121.06206,99.1781,121.72385,100.36705,121.96533Z"
								transform="translate(-72.09653 -103.00158)"
							/>
						</svg>
						<h1>Login to Your Account</h1>
						<form onSubmit={handleSubmit}>
							<div className="form-group">
								<label>
									Username{" "}
									<i className="float-end">
										<img src="/images/user-icon.png" />{" "}
									</i>{" "}
								</label>
								<input
									className="form-control"
									placeholder="Enter Your Username"
									type="text"
									id="user"
									name="email"
									value={email}
									tabIndex="1"
									onChange={(e) => {
										setEmail(e.target.value);
										setError((preState) => {
											return {
												...preState,
												email: false,
											};
										});
										// setEmail(email&&email.trim());
									}}
									onBlur={(e) => onChangeHandler(e)}
								/>
								{!email && error.email ? (
									<span className="text-danger">Username is required.</span>
								) : null}
								{email && error.email ? (
									<span className="text-danger">Invalid Username.</span>
								) : null}
							</div>
							<div className="form-group">
								<label>
									Password{" "}
									<i className="float-end">
										<img src="/images/key-icon.png" />{" "}
									</i>
								</label>
								<input
									className="form-control"
									placeholder="Enter Your Password"
									id="password"
									type="password"
									name="password"
									value={password}
									tabIndex="2"
									onChange={(e) => {
										setPassword(e.target.value);
										setError((preState) => {
											return {
												...preState,
												password: false,
											};
										});
									}}
									onBlur={(e) => onChangeHandler(e)}
								/>
								{!password && error.password ? (
									<span className="text-danger">Password is required.</span>
								) : null}
							</div>
							<div className="row mb-2 mt-4">
								<div className="col-md-6">
									<div className="form-group-check pt-0">
										<div className="form-check form-check-inline">
											<input
												className="form-check-input"
												tabIndex="3"
												type="checkbox"
												id="remember"
												name="remember"
												value="remember"
												checked={rememberMe}
												onChange={(e) => onChangeHandler(e)}
											/>
											<label
												className="form-check-label simple-label no-style"
												htmlFor="remember"
											>
												{" "}
												Remember me
											</label>
										</div>
									</div>
								</div>
								<div className="col-md-6 text-end">
									<Link to={RoutesConstant.forgotPassword} className="small">
										Forgot Password?
									</Link>
								</div>
							</div>
							<button
								onClick={postData}
								className="btn btn-secondary btn-submit w-100 mt-3 mb-3"
							>
								Login
							</button>
						</form>
					</div>
				</div>
			</main>
		</section>
	);
};

export default Index;
