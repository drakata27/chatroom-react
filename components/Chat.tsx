import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";

interface ChatProps {
  username: string | undefined;
}

const Chat = ({ username }: ChatProps) => {
  const [client, setClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");

  useEffect(() => {
    if (!username) return;

    const newClient = new Client({
      brokerURL: "ws://localhost:8080/ws", // Replace with your WebSocket endpoint
      onConnect: () => {
        console.log("Connected to WebSocket server");

        // Subscribe to a topic
        newClient.subscribe("/topic/public", (message) => {
          const receivedMessage = message.body;
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        });

        // Notify server of new user
        const joinMessage = JSON.stringify({
          sender: username,
          content: `${username} has joined the chat!`,
          type: "JOIN",
        });
        newClient.publish({
          destination: "/app/chat.addUser", // Replace with your server mapping
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
        destination: "/app/chat.sendMessage", // Replace with your server mapping
        body: chatMessage,
      });

      setMessageInput(""); // Clear input field
    }
  };

  const parseMessage = (msg: string): string => {
    try {
      const parsed = JSON.parse(msg);
      return parsed.content || "Invalid message content";
    } catch (error) {
      console.error("Failed to parse message:", error);
      return "Error parsing message";
    }
  };

  const parseSender = (msg: string) => {
    try {
      const parsed = JSON.parse(msg);
      return parsed.sender || "Invalid sender";
    } catch (error) {
      console.error("Failed to parse sender:", error);
      return "Error parsing sender";
    }
  };

  return (
    <div className="space-y-5">
      <div className="h-80 overflow-y-auto border rounded-xl p-5 bg-gray-100">
        {messages.map((msg, index) => (
          <div key={index} className="mb-2">
            {parseSender(msg)}: {parseMessage(msg)}
          </div>
        ))}
      </div>
      <div className="flex space-x-3">
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="p-3 flex-grow rounded-xl border"
        />
        <button
          onClick={sendMessage}
          className="p-3 bg-blue-500 text-white rounded-xl"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
