import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./App.css"
import { Home } from "./components/Home"
import { RecoilRoot } from "recoil"
import { Template } from "./components/Template"
import { Test } from "./components/Test"
import { FileAction } from "./components/FileAction"
import { UpdateFileAction } from "./components/UpdateFileAction"

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/template",
    element: <Template />,
  },
  {
    path: "/test",
    element: <Test />,
  },
  {
    path: "/fileAction",
    element: <FileAction />,
  },
  {
    path: "/updateFileAction",
    element: <UpdateFileAction />,
  },
])

export const App = () => {
  return (
    <>
      <RecoilRoot>
        <RouterProvider router={router} />
      </RecoilRoot>
    </>
  )
}
