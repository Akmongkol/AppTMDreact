import React, { Suspense } from "react";
import { BrowserRouter, useRoutes } from "react-router-dom";
import routes from "./routes/routes";

function AppRoutes() {
  return useRoutes(routes);
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>&nbsp;</div>}>
        <AppRoutes />
      </Suspense>
    </BrowserRouter>
  );
}
