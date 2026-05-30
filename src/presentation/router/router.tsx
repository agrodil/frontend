import { createBrowserRouter } from "react-router-dom";

import { routes as privateRoutes } from "./private/routes.tsx";
import { routes as publicRoutes } from "./public/routes.tsx";

const routes = [...privateRoutes, ...publicRoutes];

export const router = createBrowserRouter(routes);
