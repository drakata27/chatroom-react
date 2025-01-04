import { useState } from "react";
import "./App.css";
import { Client } from "@stomp/stompjs";
import Chat from "./components/Chat";
import Button from "./components/Button";
import Input from "./components/Input";

function App() {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [joined, setJoined] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const connect = () => {
    if (!username) {
      alert("Please enter a username before connecting.");
      return;
    }

    setJoined(true);

    const client = new Client({
      brokerURL: "ws://localhost:8080/ws",
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
    <div className="space-y-5 rounded-xl p-10 bg-[#242424] w-full sm:max-w-lg">
      <h2 className="text-4xl">
        {username ? <>Hi, {username} 👋</> : <>Please enter a username👇 </>}
      </h2>
      {joined === false ? (
        <>
          <div className="flex flex-col space-y-5">
            <Input
              onChange={handleInputChange}
              placeholder="Enter username..."
              onKeyDownAction={connect}
            />
            <Button onClick={connect} text="Join" />
          </div>
        </>
      ) : (
        <Chat username={username} />
      )}
    </div>
  );
}

export default App;
