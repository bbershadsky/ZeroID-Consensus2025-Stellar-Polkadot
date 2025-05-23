import { Authenticated, Refine } from "@refinedev/core";
import { KBarProvider } from "@refinedev/kbar";
import { appwriteClient, resources } from "./utility";
import { Analytics } from "@vercel/analytics/react";
import {
  useNotificationProvider,
  ThemedLayoutV2,
  ThemedSiderV2,
  RefineSnackbarProvider,
} from "@refinedev/mui";
import GlobalStyles from "@mui/material/GlobalStyles";
import CssBaseline from "@mui/material/CssBaseline";
import { dataProvider as DP, liveProvider } from "@refinedev/appwrite";
import routerProvider, {
  CatchAllNavigate,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard"; // Renamed to avoid conflict
import PeopleIcon from "@mui/icons-material/People"; // Example icon for Employers
import AccountBoxIcon from "@mui/icons-material/AccountBox"; // Example icon for Candidates

import { DashboardPage } from "./pages/dashboard";
import { AuthPage } from "./pages/auth";
import {
  CandidatesCreate,
  CandidatesList,
  CandidateShow,
} from "./pages/candidates";
import { ColorModeContextProvider } from "./contexts";
import { Header, Title } from "./components";
import { EmployersList, EmployersCreate, BusinessShow as EmployerShow } from "./pages/employers"; // BusinessShow was already imported
import { useTranslation } from "react-i18next";
import { accessControlProvider } from "./utils"; // Assuming this exists and is correctly set up
import { authProvider } from "./auth-provider"; // Assuming this exists and is correctly set up
import { ProcessVerificationPage } from "./pages/ProcessVerificationPage";
import ApplicationRedirect from "./pages/ApplicationRedirect";

interface I18nProviderProps {
  translate: (key: string, params?: Record<string, any>) => string;
  changeLocale: (lang: string) => Promise<void>;
  getLocale: () => string;
}

const App: React.FC = () => {
  const { t, i18n } = useTranslation();
  const i18nProvider: I18nProviderProps = {
    translate: (key: string, params?: Record<string, any>) => t(key, params),
    changeLocale: async (lang: string): Promise<void> => {
      await i18n.changeLanguage(lang);
    },
    getLocale: () => i18n.language,
  };

  return (
    <BrowserRouter>
      <KBarProvider>
        <ColorModeContextProvider>
          <CssBaseline />
          <GlobalStyles styles={{ html: { WebkitFontSmoothing: "auto" } }} />
          <RefineSnackbarProvider>
            <Refine
              dataProvider={{
                default: DP(appwriteClient, {
                  databaseId: resources.databaseId,
                }),
              }}
              liveProvider={liveProvider(appwriteClient, {
                databaseId: resources.databaseId,
              })}
              accessControlProvider={accessControlProvider}
              authProvider={authProvider}
              routerProvider={routerProvider}
              i18nProvider={i18nProvider}
              options={{
                liveMode: "auto",
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                breadcrumb: false, // Set to true if you want breadcrumbs based on resources
                useNewQueryKeys: true,
                disableTelemetry: true,
              }}
              notificationProvider={useNotificationProvider}
              resources={[
                {
                  name: "dashboard", 
                  list: "/", 
                  meta: {
                    label: t("dashboard.title", "Dashboard"),
                    icon: <DashboardIcon />,
                  },
                },
                // {
                //   name: resources.employers, // e.g., "employers"
                //   list: "/employers",       // Component reference
                //   create: "/employers/create",  // Component reference
                //   show: EmployerShow,       // Component reference
                //   meta: {
                //     label: t("employers.employers", "Employers"),
                //     icon: <PeopleIcon />, // Example icon
                //   },
                // },
                {
                  name: resources.candidates, // e.g., "candidates"
                  list: "/candidates",        // Component reference (assuming ProductList is CandidatesList)
                  create: "/candidates/create",  // Component reference
                  // edit: CandidatesEdit,    // Add component reference if you have an edit page
                  show: CandidateShow,        // Component reference (assuming ProductShow is CandidatesShow)
                  meta: {
                    label: t("candidates.candidates", "Candidates"),
                    icon: <AccountBoxIcon />, // Example icon (Inventory can also be used)
                  },
                },
              ]}
            >
              <>
                <Routes>
                  {/* Protected Routes (Dashboard, Employers, Candidates) */}
                  <Route
                      path="/polkadot"
                      element={<ApplicationRedirect url="https://docs.google.com/document/d/18B-Q9szD-nLwfFH1BWQeqc6-RR-OsG4WNiIblXJE7vI/edit?usp=sharing"/>}
                  />
                  <Route
                      path="/stellar/docs"
                      element={<ApplicationRedirect url="https://whimsical.com/stellar-technical-documentation-9t7f8gdRDDASdwe6QAB2nE" />}
                  />
                  <Route
                      path="/stellar/why"
                      element={<ApplicationRedirect url="https://docs.google.com/document/d/1KeO1i8kVB-cE7L-3h2MlHyE9ueY-iDe2OcsCPnkubE8/edit?usp=sharing" />}
                  />
                  <Route
                      path="/repo"
                      element={<ApplicationRedirect url="https://github.com/bryangalindo/ZeroID-Consensus2025-Stellar-Polkadot" />}
                  />
                  <Route
                    element={
                      <Authenticated
                        key="protected-routes" // ADDED KEY HERE
                        fallback={<CatchAllNavigate to="/register" />}
                      >
                        <ThemedLayoutV2
                          Header={Header}
                          Sider={(props) => ( // Added props here for Title if needed, or remove if not used
                            <ThemedSiderV2
                              Title={Title} // Pass Title component to Sider
                              render={({ items, logout, collapsed }) => {
                                return (
                                  <>
                                    {items}
                                    {logout}
                                  </>
                                );
                              }}
                            />
                          )}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      </Authenticated>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="/employers">
                      <Route index element={<EmployersList />} />
                      <Route path="create" element={<EmployersCreate />} />
                      <Route path=":id/show" element={<EmployerShow />} />
                    </Route>
                    <Route path="/candidates">
                      <Route index element={<CandidatesList />} />
                      <Route path="create" element={<CandidatesCreate />} />
                      <Route path=":id/show" element={<CandidateShow />} />
                    </Route>
                    <Route path="/verify-employment/:jobHistoryId/:verificationAction" element={<ProcessVerificationPage />} />
                  </Route>

                  {/* Auth Pages (Unprotected) */}
                  <Route
                    element={
                      // This Authenticated block is for redirecting if already logged in
                      // or showing Outlet (login/register pages) if not.
                      <Authenticated
                        key="auth-pages"
                        fallback={<Outlet />} // If not authenticated, show AuthPage routes
                      // You might want to redirect if already authenticated:
                      // redirectOnAuthenticated="/" // Or your dashboard path
                      >
                        {/* If authenticated, you might want to redirect away from auth pages */}
                        {/* <NavigateToResource resource="dashboard" /> */}
                        {/* Or simply render null or a redirect component */}
                        <CatchAllNavigate to="/" /> {/* Example: redirect to dashboard if authenticated and tries to access auth pages */}
                      </Authenticated>
                    }
                  >
                    <Route
                        path="/polkadot"
                        element={<ApplicationRedirect url="https://docs.google.com/document/d/18B-Q9szD-nLwfFH1BWQeqc6-RR-OsG4WNiIblXJE7vI/edit?usp=sharing"/>}
                    />
                    <Route
                        path="/stellar/docs"
                        element={<ApplicationRedirect url="https://whimsical.com/stellar-technical-documentation-9t7f8gdRDDASdwe6QAB2nE" />}
                    />
                    <Route
                        path="/stellar/why"
                        element={<ApplicationRedirect url="https://docs.google.com/document/d/1KeO1i8kVB-cE7L-3h2MlHyE9ueY-iDe2OcsCPnkubE8/edit?usp=sharing" />}
                    />
                    <Route
                        path="/repo"
                        element={<ApplicationRedirect url="https://github.com/bryangalindo/ZeroID-Consensus2025-Stellar-Polkadot" />}
                    />
                    <Route
                      path="/login"
                      element={<AuthPage type="login" />}
                    />
                    <Route
                      path="/register"
                      element={<AuthPage type="register" />}
                    />
                    <Route
                      path="/forgot-password"
                      element={<AuthPage type="forgotPassword" />}
                    />
                    <Route
                      path="/update-password"
                      element={<AuthPage type="updatePassword" />}
                    />
                  </Route>
                </Routes>
                <Analytics />
              </>
              <UnsavedChangesNotifier />
              <DocumentTitleHandler />
            </Refine>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </KBarProvider>
    </BrowserRouter>
  );
};

export default App;