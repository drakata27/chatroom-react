import { useState } from "react";
import "./App.css";
import { Client } from "@stomp/stompjs";
import Chat from "./components/Chat";
import Button from "./components/Button";
import Input from "./components/Input";
import BASE_URL from "./utils/config";
import { Divider } from "@mui/material";
import axios from "axios";
import BASE_HTTP_URL from "./utils/httpConfig";

function App() {
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [joined, setJoined] = useState(false);
  let client: Client;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };

  const handleInputChangeRoomId = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value);
  };

  const connect = () => {
    if (!username) {
      alert("Please enter a username before connecting.");
      return;
    }

    if (client) {
      client.deactivate(); // Deactivate the previous connection
    }

    setJoined(true);

    client = new Client({
      brokerURL: `${BASE_URL}/ws`,
      connectHeaders: {
        username: username,
      },
      debug: function (str) {
        console.log(str);
      },
      onConnect: () => {
        console.log("Connected to WebSocket server");

        // Subscribe to a topic
        client.subscribe(`/topic/${roomId}`, (message) => {
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

  const handleNewConnection = async () => {
    await axios
      .post(`${BASE_HTTP_URL}/api/rooms/create`)
      .then((res) => setRoomId(res.data))
      .catch((e) => alert(e));
    connect();
  };

  const handleJoin = () => {
    if (!roomId) {
      alert("Room ID cannot be empty.");
      return;
    }

    setRoomId((prevRoomId) => prevRoomId?.trim());
    connect();
  };

  return (
    <div className="space-y-5 rounded-xl p-10 bg-[#242424] w-full sm:max-w-lg">
      <h2 className="text-4xl">
        {username ? <>Hi, {username} 👋</> : <>Enter a username👇 </>}
      </h2>
      {joined === false ? (
        <>
          <div className="flex flex-col space-y-5">
            <Input
              onChange={handleInputChange}
              placeholder="Enter username..."
              onKeyDownAction={handleNewConnection}
            />
            <Button onClick={handleNewConnection} text="Create Room" />
          </div>

          <Divider sx={{ color: "lightgray" }}>Or</Divider>

          <h2 className="text-4xl">Join a Room ✅</h2>
          <div className="flex flex-col space-y-5">
            <h1 className="font-bold">{username}</h1>
            <Input
              onChange={handleInputChangeRoomId}
              placeholder="Enter room ID..."
              onKeyDownAction={handleJoin}
            />
            <Button onClick={handleJoin} text="Join" />
          </div>
        </>
      ) : (
        <Chat username={username} roomId={roomId} />
      )}
    </div>
  );
}

export default App;
