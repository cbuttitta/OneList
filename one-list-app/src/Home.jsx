import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const handleSubmission = (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    const id = encodeURIComponent(query.trim());
    navigate(`/${id}`);
  }
    return (
        <>
        {/*Search Form */ }
        < form className = "search-form" onSubmit={handleSubmission} role = "search" >
        <label for="site-search" className="visually-hidden">Search the site:</label>
        <input type="search" onChange={e => setQuery(e.target.value)} placeholder="Search for list" className="search-input"/>
          <button type="submit" className="search-button">&rarr;</button>
      </form >
      </>
  );
}