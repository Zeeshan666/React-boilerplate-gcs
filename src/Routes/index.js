import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense, useEffect, useState } from "react";
import App from "../App";
import RoutesConstant from "./Constant";
import Form from "../Pages/ExternalUserManagement/Form";
import bidShushi from "../Services/Api/Api";
import { useAuthContext } from "../hooks/useAuthContext";
import { USER_ROLE } from "../Context/Actions";
import { BID_MANAGER_ROLE } from "../Common";

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
const UserList = lazy(() => import("../Pages/UserList"));
const BidSetup = lazy(() => import("../Pages/BidSetup"));
const BidManagement = lazy(() => import("../Pages/BidManagement"));
const ExternalUserList = lazy(() => import("../Pages/ExternalUserList"));
const CalendarManagement = lazy(() => import("../Pages/CalendarManagement"));
const UserManagement = lazy(() => import("../Pages/UserManagement"));
const ExternalUserManagement = lazy(() =>
  import("../Pages/ExternalUserManagement")
);
const ExternalUserForm = lazy(() =>
  import("../Pages/ExternalUserManagement/Form")
);
const UserForm = lazy(() => import("../Pages/UserManagement/Form"));
const UserProfile = lazy(() => import("../Pages/UserManagement/Profile"));
const StageMasterList = lazy(() => import("../Pages/StageMasterList"));
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
        <Route element={<Aauth/>}>
          <Route path={RoutesConstant.main} element={<App role={role} />}>
            <Route index path="" element={<Dashboard role={role} />}></Route>
            <Route
              path={RoutesConstant.userList}
              element={(role === BID_MANAGER_ROLE  && user.isAdmin) ? <UserList /> : <NotAllow />}
            ></Route>
            <Route
              path={RoutesConstant.bidSetup}
              element={<BidSetup />}
            ></Route>
            <Route
              path={RoutesConstant.bidSetupEdit}
              element={<BidSetup />}
            ></Route>
            <Route
              path={RoutesConstant.bidManagement}
              element={<BidManagement />}
            ></Route>
            <Route
              path={RoutesConstant.externalUserList}
              element={
                role === BID_MANAGER_ROLE ? <ExternalUserList /> : <NotAllow />
              }
            ></Route>
            <Route
              path={RoutesConstant.calendarManagement}
              element={
                (role === BID_MANAGER_ROLE && user.isAdmin) ? (
                  <CalendarManagement />
                ) : (
                  <NotAllow />
                )
              }
            ></Route>
            <Route
              path={RoutesConstant.userProfile}
              element={<UserProfile />}
            ></Route>
            <Route
              path={RoutesConstant.userManagement}
              element={
                (role === BID_MANAGER_ROLE && user.isAdmin) ? <UserManagement /> : <NotAllow />
              }
            ></Route>
            <Route
              path={RoutesConstant.userForm}
              element={(role === BID_MANAGER_ROLE && user.isAdmin) ? <UserForm /> : <NotAllow />}
            ></Route>
            <Route
              path={RoutesConstant.userFormEdit}
              element={(role === BID_MANAGER_ROLE && user.isAdmin) ? <UserForm /> : <NotAllow />}
            ></Route>
            <Route
              path={RoutesConstant.externalUserForm}
              element={
                (role === BID_MANAGER_ROLE && user.isAdmin) ? <ExternalUserForm /> : <NotAllow />
              }
            ></Route>
            <Route
              path={RoutesConstant.externalUserFormEdit}
              element={
                (role === BID_MANAGER_ROLE && user.isAdmin) ? <ExternalUserForm /> : <NotAllow />
              }
            ></Route>
            <Route
              path={RoutesConstant.externalUserManagement}
              element={
                (role === BID_MANAGER_ROLE && user.isAdmin) ? (
                  <ExternalUserManagement></ExternalUserManagement>
                ) : (
                  <NotAllow />
                )
              }
            ></Route>
            <Route
              path={RoutesConstant.stageMasterList}
              element={
                (role === BID_MANAGER_ROLE && user.isAdmin) ? <StageMasterList /> : <NotAllow />
              }
            ></Route>
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
