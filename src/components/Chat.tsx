import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import Button from "./Button";
import { User } from "lucide-react";
import BASE_URL from "../utils/config";
import Swal from "sweetalert2";

interface ChatProps {
  username: string | undefined;
  roomId: string | undefined;
}

const Chat = ({ username, roomId }: ChatProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (!username) return;

    const newClient = new Client({
      brokerURL: `${BASE_URL}/ws`,
      connectHeaders: {
        username: username,
        roomId: roomId!,
      },
      onConnect: () => {
        console.log("Connected to WebSocket server");

        newClient.subscribe(`/topic/${roomId}/userCount`, (message) => {
          console.log("Received user count update:", message.body);
          setUserCount(parseInt(message.body, 10));
        });

        // Subscribe to a topic
        newClient.subscribe(`/topic/${roomId}`, (message) => {
          const receivedMessage = message.body;
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });

        // Notify server of new user
        const joinMessage = JSON.stringify({
          sender: username,
          type: "JOIN",
        });
        newClient.publish({
          destination: `/app/chat.addUser/${roomId}`,
          body: joinMessage,
        });
      },
      onStompError: (error) => {
        console.error("STOMP error:", error);
      },
    });

    newClient.activate();
    setClient(newClient);

    // Cleanup WebSocket connection
    return () => {
      if (newClient) newClient.deactivate();
    };
  }, [username, roomId]);

  const sendMessage = () => {
    if (messageInput.trim() && client) {
      const chatMessage = JSON.stringify({
        sender: username,
        content: messageInput,
        type: "CHAT",
      });

      client.publish({
        destination: `/app/chat.sendMessage/${roomId}`,
        body: chatMessage,
      });

      setMessageInput("");
    }
  };

  const parseMessage = (msg: string) => {
    try {
      const parsed = JSON.parse(msg);
      if (parsed.type === "LEAVE") {
        return (
          <span className="text-red-500">{`${parsed.sender} has left the chat!😞`}</span>
        );
      }
      if (parsed.type === "JOIN") {
        return (
          <span className="text-green-500">{`${parsed.sender} has joined the chat!😀`}</span>
        );
      }
      return parsed.content;
    } catch (error) {
      console.error("Failed to parse message:", error);
      return "Error parsing message";
    }
  };

  const parseSender = (msg: string) => {
    try {
      const parsed = JSON.parse(msg);
      if (parsed.type === "JOIN" || parsed.type === "LEAVE") return;
      return parsed.sender + ":" || "Invalid sender";
    } catch (error) {
      console.error("Failed to parse sender:", error);
      return "Error parsing sender";
    }
  };

  const disconnect = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to disconnect from the chat?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, disconnect",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        if (client) {
          console.log("Disconnected from WebSocket server");
          window.location.reload();
          client.deactivate();
        }
      }
    });
  };

  const handleCopy = () => {
    navigator.clipboard
      .writeText(roomId!)
      .then(() => {
        Swal.fire({
          title: "Room ID copied to clipboard",
          icon: "success",
          toast: true,
          timer: 2000,
          position: "bottom-right",
          timerProgressBar: true,
          showConfirmButton: false,
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="space-y-5 p-5">
      <h2 className="text-3xl text-gray-300">Hi, {username} 👋</h2>
      <div className="overflow-y-auto border rounded-xl p-10 bg-[#141414] h-72">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold text-cyan-500">{parseSender(msg)}</span>{" "}
            <span className="text-white">{parseMessage(msg)}</span>
          </div>
        ))}
      </div>
      <div className="flex space-x-5">
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          className="p-3 flex-grow rounded-xl border text-white"
        />
        <Button onClick={sendMessage} text="Send" />
      </div>
      <Button onClick={disconnect} text="Disconnect" isDisconnect={true} />

      <div className="flex space-x-2">
        <User className="text-gray-400" />
        <span className="text-gray-400">{userCount}</span>
      </div>
      <h1 className="text-gray-400 cursor-pointer" onClick={handleCopy}>
        <span className="font-bold col-2">Room ID:</span> {roomId}
      </h1>
    </div>
  );
};

export default Chat;
