import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [ notifications, setNotifications ] = useState([]);
  const [ listening, setListening ] = useState(false);

  const [room, setRoom] = useState('');
  const [user, setUser] = useState('');

  useEffect( () => {
    if (listening) {
      const events = new EventSource(`http://localhost:3000/notifications/${room}/${user}`);

      events.onmessage = (event) => {
        const parsedData = JSON.parse(event.data);

        setNotifications((notifications) => notifications.concat(parsedData));
      };

      setListening(false);
    }
    //eslint-disable-next-line
  }, [listening, notifications]);

  return (
    <div>
    <div>Room: <input placeholder="room" onChange={(e) => setRoom(e.target.value)} /></div><br/>
    <div>User: <input placeholder="user" onChange={(e) => setUser(e.target.value)} /></div><br/>
    <button onClick={() => setListening(true)}>Start</button>
    <hr/>
    <table className="stats-table">
      <thead>
        <tr>
          <th>Notifications</th>
        </tr>
      </thead>
      <tbody>
        {
          notifications.map((item, i) =>
          <tr key={i}>
              <td>{item.text}</td>
            </tr>
          )
        }
      </tbody>
    </table>
        </div>
  );
}

export default App;