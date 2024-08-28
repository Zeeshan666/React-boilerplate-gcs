import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import App from "../App";
import RoutesConstant from "./Constant";
import { useAuthContext } from "../hooks/useAuthContext";

const Login = lazy(() => import("../Pages/Login"));
const Update = lazy(() => import("../Pages/Update"));
const UpdateSuccess = lazy(() => import("../Pages/Update/Success"));
const Forgot = lazy(() => import("../Pages/Forgot"));
const ForgotSuccess = lazy(() => import("../Pages/Forgot/Success"));
const AccountActivation = lazy(() => import("../Pages/AccountActivation"));
const AccountActivationSuccess = lazy(() =>
  import("../Pages/AccountActivation/Success")
);
const Dashboard = lazy(() => import("../Pages/Dashbaord"));
const NotFound = lazy(() => import("../Components/NotFound/index"));
const NotAllow = lazy(() => import("../Components/NotAllow/index"));
const Logout = lazy(() => import("../Components/AppHeader/Logout"));
const Aauth = lazy(() => import("../Components/Aauth"));

function AppRoutes() {
  const [loading, setLoading] = useState(false);
  const { user, role, dispatch } = useAuthContext();

  return (
    <Suspense
      fallback={
        <div className="lds-ripple loader">
          <div></div>
        </div>
      }
    >
      <Routes>
        <Route element={<Aauth />}>
          <Route path={RoutesConstant.main} element={<App role={role} />}>
            <Route index path="" element={<Dashboard role={role} />}></Route>

            <Route path="*" element={<NotFound />}></Route>
          </Route>
        </Route>

        <Route path={RoutesConstant.login} element={<Login />} />
        <Route path={RoutesConstant.forgotPassword} element={<Forgot />} />
        <Route
          path={RoutesConstant.forgotPasswordSuccess}
          element={<ForgotSuccess />}
        />
        <Route path={RoutesConstant.updatePassword} element={<Update />} />
        <Route
          path={RoutesConstant.updatePasswordSuccess}
          element={<UpdateSuccess />}
        />
        <Route
          path={RoutesConstant.accountActivation}
          element={<AccountActivation />}
        />
        <Route
          path={RoutesConstant.accountActivationSuccess}
          element={<AccountActivationSuccess />}
        />
        <Route path={"/logout"} element={<Logout />} />
      </Routes>
    </Suspense>
  );
}
export default AppRoutes;
