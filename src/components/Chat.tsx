import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import Button from "./Button";
import { User } from "lucide-react";

interface ChatProps {
  username: string | undefined;
}

const Chat = ({ username }: ChatProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (!username) return;

    const newClient = new Client({
      brokerURL: "ws://localhost:8080/ws",
      onConnect: () => {
        console.log("Connected to WebSocket server");

        newClient.subscribe("/topic/userCount", (message) => {
          setUserCount(parseInt(message.body, 10));
        });

        // Subscribe to a topic
        newClient.subscribe("/topic/public", (message) => {
          const receivedMessage = message.body;
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });

        // Notify server of new user
        const joinMessage = JSON.stringify({
          sender: username,
          // content: `${username} has joined the chat!`,
          type: "JOIN",
        });
        newClient.publish({
          destination: "/app/chat.addUser",
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
  }, [username]);

  const sendMessage = () => {
    if (messageInput.trim() && client) {
      const chatMessage = JSON.stringify({
        sender: username,
        content: messageInput,
        type: "CHAT",
      });

      client.publish({
        destination: "/app/chat.sendMessage",
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
    if (client) {
      console.log("Disconnected from WebSocket server");
      window.location.reload();
      client.deactivate();
    }
  };

  return (
    <div className="space-y-5 p-5">
      <div className="overflow-y-auto border rounded-xl p-10 bg-[#141414] h-72">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            <span className="font-bold text-cyan-500">{parseSender(msg)}</span>{" "}
            {parseMessage(msg)}
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
          className="p-3 flex-grow rounded-xl border"
        />
        <Button onClick={sendMessage} text="Send" />
      </div>
      <Button onClick={disconnect} text="Disconnect" isDisconnect={true} />

      <div className="flex space-x-2">
        <User />
        <span>{userCount}</span>
      </div>
    </div>
  );
};

export default Chat;
