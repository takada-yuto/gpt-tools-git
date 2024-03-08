import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { Home } from './components/Home'
import { RecoilRoot } from 'recoil'


const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />,
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

