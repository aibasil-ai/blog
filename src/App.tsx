import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Post from './pages/Post'
import Posts from './pages/Posts'
import NotFound from './pages/NotFound'
import ScrollToTop from './components/ScrollToTop'
import About from './pages/About'
import Subscribe from './pages/Subscribe'

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/posts/:slug" element={<Post />} />
        <Route path="/about" element={<About />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
