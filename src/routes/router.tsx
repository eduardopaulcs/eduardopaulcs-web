import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Error from "../pages/Error";
import Home from "../pages/Home";
import Tos from "../pages/Tos";

export default createBrowserRouter(
  createRoutesFromElements(
    <Route
      path="/"
      element={<Layout />}
      errorElement={<Error />}
    >
      <Route
        path="/:lang"
      >
        <Route
          path="/:lang/"
          element={<Home />}
        />
      </Route>
      <Route
        path="/tos"
        element={<Tos />}
      />
    </Route>
  )
);
