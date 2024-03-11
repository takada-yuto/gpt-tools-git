import { createBrowserRouter, RouterProvider } from "react-router-dom"
import "./App.css"
import { Home } from "./components/Home"
import { RecoilRoot } from "recoil"
import { Template } from "./components/Template"
import { Test } from "./components/Test"
import { CreateFile } from "./components/CreateFile"
import { UpdateFile } from "./components/UpdateFile"
import { RevertCommit } from "./components/RevertCommit"
import { Index } from "./components/Index"

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
    path: "/createFile",
    element: <CreateFile />,
  },
  {
    path: "/updateFile",
    element: <UpdateFile />,
  },
  {
    path: "/revertCommit",
    element: <RevertCommit />,
  },
  {
    path: "/index",
    element: <Index />,
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
