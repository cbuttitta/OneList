import { Outlet, Link} from 'react-router-dom';

function Layout() {
  return (
    <>
      {/* Top Navigation */}
      <div className="subject-container">
        <header>
        <h2>OneList</h2>
        <ul className="breadcrumb">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/">Login</Link></li>
        </ul>
      </header>

      <Outlet/>
      </div>
      <footer>

      </footer>
    </>
  );
}

export default Layout;