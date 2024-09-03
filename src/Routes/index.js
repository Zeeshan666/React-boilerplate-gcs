import React, { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { useAuthContext } from "../hooks/useAuthContext";
import RoutesConstant from "./Constant";
import { BID_MANAGER_ROLE } from "../Common";
import { components as components } from "./lazyload";

function ProtectedRoute({ condition, fallback, children }) {
  return condition ? children : fallback;
}

function AppRoutes() {
  const { user, role } = useAuthContext();

  return (
    <Suspense
      fallback={
        <div className="lds-ripple loader">
          <div></div>
        </div>
      }
    >
      <Routes>
        <Route element={<components.Aauth />}>
          <Route
            path={RoutesConstant.main}
            element={<components.App role={role} />}
          >
            <Route index element={<components.Dashboard role={role} />} />

            <Route
              path={RoutesConstant.userList}
              element={
                <ProtectedRoute
                  condition={role === BID_MANAGER_ROLE && user.isAdmin}
                  fallback={<components.NotAllow />}
                >
                  <components.UserList />
                </ProtectedRoute>
              }
            />

            <Route
              path={RoutesConstant.bidSetup}
              element={<components.BidSetup />}
            />

            <Route path="*" element={<components.NotFound />} />
          </Route>
        </Route>

        <Route
          path={RoutesConstant.crudTable}
          element={<components.CrudTable />}
        />
        <Route path={RoutesConstant.login} element={<components.Login />} />
        <Route
          path={RoutesConstant.forgotPassword}
          element={<components.Forgot />}
        />
        <Route
          path={RoutesConstant.forgotPasswordSuccess}
          element={<components.ForgotSuccess />}
        />
        <Route
          path={RoutesConstant.updatePassword}
          element={<components.Update />}
        />
        <Route
          path={RoutesConstant.updatePasswordSuccess}
          element={<components.UpdateSuccess />}
        />
        <Route
          path={RoutesConstant.accountActivation}
          element={<components.AccountActivation />}
        />
        <Route
          path={RoutesConstant.accountActivationSuccess}
          element={<components.AccountActivationSuccess />}
        />
        <Route path="/logout" element={<components.Logout />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
