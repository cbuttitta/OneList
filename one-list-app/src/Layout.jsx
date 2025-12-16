import { Outlet, Link} from 'react-router-dom';

function Layout() {
  return (
    <>
      {/* Top Navigation */}
        <header>
        <h2 className="logo">OneList</h2>
        <ul className="breadcrumb">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/">Login</Link></li>
        </ul>
      </header>

      <Outlet/>
      <footer>

      </footer>
    </>
  );
}

export default Layout;