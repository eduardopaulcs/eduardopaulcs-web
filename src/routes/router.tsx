import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Error from "../pages/Error";
import Home from "../pages/Home";
import Landing from "../pages/Landing";
import Blog from "../pages/Blog";
import BlogPost from "../pages/BlogPost";
import Fun from "../pages/Fun";

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
          element={<Landing />}
        />
        <Route
          path="/:lang/me"
          element={<Home />}
        />
        <Route
          path="/:lang/blog"
          element={<Blog />}
        />
        <Route
          path="/:lang/blog/:postId"
          element={<BlogPost />}
        />
        <Route
          path="/:lang/fun"
          element={<Fun />}
        />
      </Route>
    </Route>
  )
);

export default router;
