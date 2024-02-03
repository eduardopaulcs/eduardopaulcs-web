import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Error from "../pages/Error";
import Home from "../pages/Home";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<Layout />}
      errorElement={<Error />}
    >
      {/* Routes with the "/:lang" prefix will be translated */}
      <Route
        path="/:lang"
      >
        <Route
          path="/:lang/"
          element={<Home />}
        />
      </Route>
    </Route>
  )
);

export default router;
