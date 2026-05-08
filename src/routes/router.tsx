import { Route, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Error from "../pages/Error";
import Portfolio from "../pages/Portfolio";
import Landing from "../pages/Landing";
import Blog from "../pages/Blog";
import BlogPost from "../pages/BlogPost";
import Fun from "../pages/Fun";
import FunGame from "../pages/FunGame";

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
          path="/:lang/portfolio"
          element={<Portfolio />}
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
        <Route
          path="/:lang/fun/:gameId"
          element={<FunGame />}
        />
      </Route>
    </Route>
  )
);

export default router;
