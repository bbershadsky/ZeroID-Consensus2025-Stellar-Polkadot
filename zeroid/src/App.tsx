import { DevtoolsProvider, DevtoolsPanel } from "@refinedev/devtools";
import { Authenticated, Refine } from "@refinedev/core";
import { KBarProvider } from "@refinedev/kbar";
import { appwriteClient, resources } from "./utility";
import { Analytics } from "@vercel/analytics/react";
import {
  ErrorComponent,
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
import Dashboard from "@mui/icons-material/Dashboard";

import { DashboardPage } from "./pages/dashboard";
import { AuthPage } from "./pages/auth";
import {
  ProductList,
  ProductShow,
} from "./pages/candidates";
import { ColorModeContextProvider } from "./contexts";
import { Header, Title } from "./components";
import { BusinessList } from "./pages/employers/list";
import { BusinessShow } from "./pages/employers/show";
import { useTranslation } from "react-i18next";
import { accessControlProvider } from "./utils";
import { authProvider } from "./auth-provider";
import {
  Inventory,
} from "@mui/icons-material";

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
            <DevtoolsProvider>
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
                  breadcrumb: false,
                  useNewQueryKeys: true,
                  disableTelemetry: true,
                }}
                notificationProvider={useNotificationProvider}
                resources={[
                  {
                    name: resources.candidates,
                    list: "/",
                    meta: {
                      label: t("dashboard.title"),
                      icon: <Dashboard />,
                    },
                  },
                  {
                    name: resources.employers,
                    list: "/employers",
                    create: "/employers/new",
                    edit: "/employers/:id/edit",
                    show: "/employers/:id/show",
                    meta: {
                      label: t("employers.employers"),
                    },
                  },
                  {
                    name: resources.candidates,
                    list: "/candidates",
                    create: "/candidates/new",
                    edit: "/candidates/:id/edit",
                    show: "/candidates/:id/show",
                    meta: {
                      label: t("candidates.candidates"),
                      icon: <Inventory />,
                    },

                  },                 
                ]}
              >
                <>
                  <Routes>
                    {/* Themed but Unauthenticated Routes */}
                    <Route
                      element={
                        <ThemedLayoutV2
                          Header={Header}
                          // Title={Title}
                          Sider={() => (
                            <ThemedSiderV2
                              render={({ items, logout, collapsed }) => {
                                return (
                                  <>
                                    {items}
                                    {/* {authenticated && logout} */}
                                    {logout}
                                  </>
                                );
                              }}
                            />
                          )}
                        >
                          <Outlet />
                        </ThemedLayoutV2>
                      }
                    >
                      <Route index element={<DashboardPage />} />
                      <Route path="/employers">
                        <Route index element={<BusinessList />} />
                        <Route path=":id/show" element={<BusinessShow />} />
                      </Route>
                      <Route path="/candidates">
                        <Route index element={<ProductList />} />
                        <Route path=":id/show" element={<ProductShow />} />
                      </Route>
                    </Route>

                    {/* Authenticated Routes */}
                    <Route
                      element={
                        <Authenticated
                          key="authenticated-routes"
                          fallback={<CatchAllNavigate to="/login" />}
                        >
                          <ThemedLayoutV2
                            Header={Header}
                            Title={Title}
                            Sider={() => (
                              <ThemedSiderV2
                                render={({ items, logout, collapsed }) => {
                                  return (
                                    <>
                                      {items}
                                      {/* {authenticated && logout} */}
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
                     
                    </Route>

                    {/* Routes that don't use ThemedLayoutV2 */}
                    <Route
                      element={
                        <Authenticated
                          key="auth-pages"
                          fallback={<Outlet />}
                          // fallback={<NavigateToResource resource="dashboard" />}
                        />
                      }
                    >
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
              <DevtoolsPanel />
            </DevtoolsProvider>
          </RefineSnackbarProvider>
        </ColorModeContextProvider>
      </KBarProvider>
    </BrowserRouter>
  );
};

export default App;
