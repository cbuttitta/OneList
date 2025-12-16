import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './Layout';
import Home from './Home';
import List from './List';
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}> {/* Parent route provides the layout */}
          <Route index element={<Home />} />
          <Route path="/:list_id" element={<List />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

