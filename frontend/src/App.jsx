import React from "react";
import {
  RouterProvider,
  createRouter,
  createRoute,
  createRootRoute,
} from "@tanstack/react-router";

import Layout from "./components/Layout";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import UrlForm from "./components/UrlForm";

// 1. Create a root route
const rootRoute = createRootRoute({
  component: Layout,
});

// 2. Create child routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: UrlForm,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginForm,
});

const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/register",
  component: RegisterForm,
});

// 3. Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, loginRoute, registerRoute]);

// 4. Create the router
const router = createRouter({ routeTree });

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;