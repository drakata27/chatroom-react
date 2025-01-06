import { useState } from "react";
import "./App.css";
import { Client } from "@stomp/stompjs";
import Chat from "./components/Chat";
import BASE_URL from "./utils/config";
import axios from "axios";
import BASE_HTTP_URL from "./utils/httpConfig";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import CreateRoomDialog from "./components/CreateRoomDialog";
import JoinRoomDialog from "./components/JoinRoomDialog";

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
      {joined === false ? (
        <Tabs defaultValue="create" className="w-[400px] dark">
          <TabsList>
            <TabsTrigger value="create">Create</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
          </TabsList>
          <TabsContent value="create">
            <CreateRoomDialog
              username={username}
              handleInputChange={handleInputChange}
              handleNewConnection={handleNewConnection}
            />
          </TabsContent>
          <TabsContent value="join">
            <JoinRoomDialog
              handleInputChange={handleInputChange}
              handleJoin={handleJoin}
              handleInputChangeRoomId={handleInputChangeRoomId}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <Chat username={username} roomId={roomId} />
      )}
    </div>
  );
}

export default App;
