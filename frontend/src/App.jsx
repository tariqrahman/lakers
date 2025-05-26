import { useState, useEffect } from 'react'
import { getAllDraftPicks } from './services/api'
import './App.css'

function App() {
  const [draftPicks, setDraftPicks] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDraftPicks = async () => {
      try {
        const data = await getAllDraftPicks();
        setDraftPicks(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDraftPicks();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container">
      <h1>NBA Draft Picks</h1>
      <div className="draft-picks">
        {draftPicks.map((pick, index) => (
          <div key={index} className="draft-pick">
            <h3>{pick.team_name}</h3>
            <p>Season: {pick.season}</p>
            <p>First Round: {pick.first_rd}</p>
            <p>Second Round: {pick.second_rd}</p>
            <p>Last Updated: {new Date(pick.last_updated).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
