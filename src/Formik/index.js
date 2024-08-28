import { USER_EMAIL_REGEX, USER_PASSWORD_REGEX } from "../Common/index";
import * as Yup from "yup";

export const loginInitialValues = {
  email: localStorage.getItem("email") || "",
  password: localStorage.getItem("password") || "",
  rememberMe: !!localStorage.getItem("email"),
};

export const loginValidationSchema = Yup.object({
  email: Yup.string()
    .matches(USER_EMAIL_REGEX, "Email is not valid")
    .required("Email is required"),
  password: Yup.string()
    .matches(USER_PASSWORD_REGEX, "Password is not valid")
    .required("Password is required"),
  rememberMe: Yup.boolean(),
});
