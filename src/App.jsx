import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import VideoCall from './componants/video'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <VideoCall/>
    </>
  )
}

export default App
