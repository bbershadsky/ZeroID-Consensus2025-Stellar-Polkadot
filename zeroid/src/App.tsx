import { Authenticated, Refine } from "@refinedev/core";
import { KBarProvider } from "@refinedev/kbar";
import { appwriteClient, resources } from "./utility"; // Ensure resources.candidates, resources.employers are unique strings
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
  CandidatesList, // Assuming this is CandidatesList
  ProductShow,  // Assuming this is CandidatesShow
} from "./pages/candidates";
import { ColorModeContextProvider } from "./contexts";
import { Header, Title } from "./components";
import { EmployersList, EmployersCreate, BusinessShow } from "./pages/employers"; // BusinessShow was already imported
import { useTranslation } from "react-i18next";
import { accessControlProvider } from "./utils";
import { authProvider } from "./auth-provider";
import {
  Inventory, // This was used for candidates, can be kept or changed
} from "@mui/icons-material";
// import { EmployersCreate } from "./pages/employers"; // Already imported via named import

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
                  name: "dashboard", // Unique name for the dashboard
                  list: "/", // Component reference
                  meta: {
                    label: t("dashboard.title", "Dashboard"),
                    icon: <DashboardIcon />,
                    // path: "/" // Optional: if you want to explicitly define the path for menu links
                  },
                },
                {
                  name: resources.employers, // e.g., "employers"
                  list: "/employers",       // Component reference
                  create: "/employers/create",  // Component reference
                  // edit: EmployersEdit,   // Add component reference if you have an edit page
                  show: BusinessShow,       // Component reference
                  meta: {
                    label: t("employers.employers", "Employers"),
                    icon: <PeopleIcon />, // Example icon
                    // path: "/employers" // Optional
                  },
                },
                {
                  name: resources.candidates, // e.g., "candidates"
                  list: "/candidates",        // Component reference (assuming ProductList is CandidatesList)
                  create: "/candidates/create",  // Component reference
                  // edit: CandidatesEdit,    // Add component reference if you have an edit page
                  show: ProductShow,        // Component reference (assuming ProductShow is CandidatesShow)
                  meta: {
                    label: t("candidates.candidates", "Candidates"),
                    icon: <AccountBoxIcon />, // Example icon (Inventory can also be used)
                    // path: "/candidates" // Optional
                  },
                },
              ]}
            >
              <>
                <Routes>
                  {/* Routes using ThemedLayoutV2 */}
                  <Route
                    element={
                      <ThemedLayoutV2
                        Header={Header}
                        Sider={() => (
                          <ThemedSiderV2
                            Title={Title} // You can also pass Title to ThemedSiderV2
                            render={({ items, logout, collapsed }) => (
                              <>
                                {items}
                                {logout}
                              </>
                            )}
                          />
                        )}
                      >
                        <Outlet />
                      </ThemedLayoutV2>
                    }
                  >
                    {/* Unauthenticated accessible or common routes */}
                    <Route index element={<DashboardPage />} />

                    <Route path="/employers">
                      <Route index element={<EmployersList />} />
                      <Route path="create" element={<EmployersCreate />} />
                      {/* <Route path=":id/edit" element={<EmployersEdit />} /> */}
                      <Route path=":id/show" element={<BusinessShow />} />
                    </Route>

                    <Route path="/candidates">
                      <Route index element={<CandidatesList />} />
                      <Route path="create" element={<CandidatesCreate />} />
                      {/* <Route path=":id/edit" element={<CandidatesEdit />} /> */}
                      <Route path=":id/show" element={<ProductShow />} />
                    </Route>

                    {/* Add other routes that should use ThemedLayoutV2 here */}
                    {/* If some routes need authentication, they can be nested under an <Authenticated> wrapper */}
                    {/* Example for authenticated routes within ThemedLayoutV2:
                    <Route
                      element={
                        <Authenticated key="authenticated-main-routes" fallback={<CatchAllNavigate to="/login" />}>
                          <Outlet />
                        </Authenticated>
                      }
                    >
                       Place authenticated routes like /profile, /settings here if they use ThemedLayoutV2
                    </Route>
                    */}
                  </Route>

                  {/* Routes that don't use ThemedLayoutV2 (e.g., auth pages) */}
                  <Route
                    element={
                      <Authenticated
                        key="auth-pages"
                        fallback={<Outlet />} // Allows access to login/register if not authenticated
                      >
                        {/* If authenticated, and tries to go to /login, redirect to dashboard */}
                        <CatchAllNavigate to="/" />
                      </Authenticated>
                    }
                  >
                    <Route path="/login" element={<AuthPage type="login" />} />
                    <Route path="/register" element={<AuthPage type="register" />} />
                    <Route path="/forgot-password" element={<AuthPage type="forgotPassword" />} />
                    <Route path="/update-password" element={<AuthPage type="updatePassword" />} />
                  </Route>

                  {/* Catch-all for any other unmatched routes (optional) */}
                  {/* <Route path="*" element={<ErrorComponent />} /> */}
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
