import { useState } from "react";
import "./App.css";
import { Client } from "@stomp/stompjs";
import Chat from "../components/Chat";

function App() {
  const [username, setUsername] = useState();
  const [joined, setJoined] = useState(false);

  const handleInputChange = (e) => {
    setUsername(e.target.value);
  };

  const connect = () => {
    if (!username) {
      alert("Please enter a username before connecting.");
      return;
    }

    setJoined(true);

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws", // Your WebSocket endpoint
      connectHeaders: {
        // Optional headers if your server requires authentication
        username: username,
      },
      debug: function (str) {
        console.log(str);
      },
      onConnect: () => {
        console.log("Connected to WebSocket server");

        // Subscribe to a topic
        client.subscribe("/topic/public", (message) => {
          console.log("Message received:", message.body);
        });
      },
      onStompError: (error) => {
        console.error("STOMP error:", error);
      },
    });

    // Activate the client
    client.activate();
    // Cleanup on component unmount
    return () => {
      client.deactivate();
    };
  };

  return (
    <div className="space-y-5 border rounded-xl p-10">
      <h2 className="text-4xl">
        {username ? <>Hi, {username} 👋</> : <>Please enter a username👇 </>}
      </h2>
      {joined === false ? (
        <>
          <div className="flex flex-col space-y-5">
            <input
              placeholder="Enter username..."
              className="p-3 rounded-xl"
              onChange={handleInputChange}
            />
            <button onClick={connect}>Join</button>
          </div>
        </>
      ) : (
        <Chat username={username} />
      )}
    </div>
  );
}

export default App;
