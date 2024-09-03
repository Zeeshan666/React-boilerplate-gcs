import { lazy } from "react";
export const components = {
  App: lazy(() => import("../App")),
  Login: lazy(() => import("../Pages/Login")),
  Update: lazy(() => import("../Pages/Update")),
  UpdateSuccess: lazy(() => import("../Pages/Update/Success")),
  Forgot: lazy(() => import("../Pages/Forgot")),
  ForgotSuccess: lazy(() => import("../Pages/Forgot/Success")),
  AccountActivation: lazy(() => import("../Pages/AccountActivation")),
  AccountActivationSuccess: lazy(() =>
    import("../Pages/AccountActivation/Success")
  ),
  Dashboard: lazy(() => import("../Pages/Dashbaord")),
  NotFound: lazy(() => import("../Components/NotFound/index")),
  NotAllow: lazy(() => import("../Components/NotAllow/index")),
  Logout: lazy(() => import("../Components/AppHeader/Logout")),
  Aauth: lazy(() => import("../Components/Aauth")),
  CrudTable: lazy(() => import("../Components/CrudTable/CrudTable")),
  UserList: lazy(() => import("../Pages/UserList")),
  BidSetup: lazy(() => import("../Pages/BidSetup")),
};
