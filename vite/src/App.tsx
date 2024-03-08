import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Home } from './components/Home'
import { RecoilRoot } from 'recoil'
import { Template } from './components/Template'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '/template',
    element: <Template />,
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

