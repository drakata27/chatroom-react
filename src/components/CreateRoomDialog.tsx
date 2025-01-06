import Button from "./Button";
import Input from "./Input";

interface CreateRoomDialogProps {
  username: string | undefined;
  handleInputChange: (e: any) => void;
  handleNewConnection: () => void;
}

const CreateRoomDialog = ({
  username,
  handleInputChange,
  handleNewConnection,
}: CreateRoomDialogProps) => {
  return (
    <div className="flex flex-col space-y-5">
      <h2 className="text-4xl text-gray-300">
        {username ? <>Hi, {username} 👋</> : <>Enter a username👇 </>}
      </h2>
      <Input
        onChange={handleInputChange}
        placeholder="Enter username..."
        onKeyDownAction={handleNewConnection}
      />
      <Button onClick={handleNewConnection} text="Create Room" />
    </div>
  );
};

export default CreateRoomDialog;
