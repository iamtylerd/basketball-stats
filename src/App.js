import React, { useState } from 'react';
import './App.scss';
import 'purecss/build/pure.css';

const App = () => {
  const [players, setPlayers] = useState([]);
  const [player, setPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState(null);
  const [searchString, setSearchString] = useState("");

  const playerSearch = async () => {
    const response = await fetch(`https://www.balldontlie.io/api/v1/players?search=${searchString}`);
    const players = await response.json();
    setPlayers(players.data);
  }

  const handleSearchString = (e) => {
    setSearchString(e.target.value)
  }

  const getChange = (o, n) => {
    if (n > o) {
      const increase = n - o;
      return `${parseFloat(increase / o * 100).toFixed(2)}%`;
    }
    const decrease  = o - n;
    return `-${parseFloat(decrease / o * 100).toFixed(2)}%`;
  }

  const getMinDiff = (o, n) => {
    // TODO get min diff
    return null;
  }

  const getPlayer = async (e) => {
    setSearchString("")
    setPlayers([])
    const response1 = await fetch(`https://www.balldontlie.io/api/v1/season_averages?season=2018&player_ids[]=${e}`);
    const player1 = await response1.json();
    const response2 = await fetch(`https://www.balldontlie.io/api/v1/season_averages?season=2019&player_ids[]=${e}`);
    const player2 = await response2.json();
    const response3 = await fetch(`https://www.balldontlie.io/api/v1/players/${e}`);
    const playerObj = await response3.json();
    const data18 = player1.data[0];
    const data19 = player2.data[0];
    const out = {};
    if (data18) {
      Object.keys(data18).forEach((d) => {
        out[d] = {
          18: data18[d],
          19: data19[d],
          change: d === 'min' ? getMinDiff(data18[d], data19[d]): getChange(data18[d], data19[d]),
        }
      })
    }
    setPlayer(playerObj);
    setPlayerStats(out);
  }

  return (
    <div className="App">
      <h1 className="App-header">
        Basketball Stats
      </h1>
      <div className="container">
        <div className="player-search">
          <h2>Player Search</h2>
          <input type="text" onKeyUp={playerSearch} onChange={handleSearchString} value={searchString} />
          {players.map((p) => {
            return (
              <div key={p.id} onClick={() => getPlayer(p.id)} className="player-search-holder">
                <span className="player-name">{p.first_name} {p.last_name}</span>
                <span className="player-team">{p.team.abbreviation}</span>
                <span className="player-position">{p.position}</span>
              </div>
            )
          })}
        {player && 
          <div>
            <h2>{player.first_name} {player.last_name}</h2>
            <h3>{player.team.full_name} | {player.position}</h3>
          </div>}
        </div>
        <div className="stats-container">
        {playerStats && <table className="pure-table">
          <thead>
            <tr>
              <th>Averages</th>
              <th>2018</th>
              <th>2019</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
              {Object.keys(playerStats).length ? Object.keys(playerStats).map((p, idx) => {
                const isNegative = idx%2 ? "pure-table-odd" : "";
                if (p === "player_id" || p === "season" ) { return null; }
                const color = playerStats[p].change && !playerStats[p].change.includes("-") ? "change-positive" : "change-negative";
                return (
                  <tr key={p} className={isNegative}>
                    <td>{p}</td>
                    <td>{playerStats[p][18]}</td>
                    <td>{playerStats[p][19]}</td>
                    <td className={color}>{playerStats[p].change}</td>
                  </tr>
                )
              })
              : <tr><td>No Data For 2018</td></tr>
            }
          </tbody>
          </table>}
        </div>
      </div>
    </div>
  );
}

export default App;
