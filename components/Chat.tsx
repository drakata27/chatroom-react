interface ChatProps {
  username: string | undefined;
}

const Chat = ({ username }: ChatProps) => {
  console.log(username);

  return (
    <div>
      <h1>Hello {username}</h1>
    </div>
  );
};

export default Chat;
