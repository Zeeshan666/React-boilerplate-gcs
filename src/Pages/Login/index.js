import React, { useState, useEffect } from "react";
import { notification } from "antd";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "hooks/useAuthContext";
import { LOGIN_ACTION, USER_ROLE } from "Context/Actions";
import { USER_EMAIL_REGEX } from "Common/index";
import RoutesConstant from "Routes/Constant.js";
import bidShushi from "Services/Api/Api";
import { LoginSvg } from "Common/Svg";

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
            <LoginSvg />
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
