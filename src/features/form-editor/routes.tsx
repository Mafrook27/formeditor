import type { RouteObject } from "react-router-dom";
import { FormEditorPage } from "./pages";

export const formEditorRoutes: RouteObject = {
  path: "form-editor",
  element: <FormEditorPage />,
};
