import Button from "./Button";
import Input from "./Input";

interface JoinRoomDialogProps {
  handleInputChange: (e: any) => void;
  handleJoin: () => void;
  handleInputChangeRoomId: (e: any) => void;
}

const JoinRoomDialog = ({
  handleInputChange,
  handleJoin,
  handleInputChangeRoomId,
}: JoinRoomDialogProps) => {
  return (
    <>
      <h2 className="text-4xl text-gray-300 mb-5">Join a Room ✅</h2>
      <div className="flex flex-col space-y-5">
        <Input
          onChange={handleInputChange}
          placeholder="Enter username..."
          onKeyDownAction={handleJoin}
        />
        <Input
          onChange={handleInputChangeRoomId}
          placeholder="Enter Room ID..."
          onKeyDownAction={handleJoin}
        />
        <Button onClick={handleJoin} text="Join" />
      </div>
    </>
  );
};

export default JoinRoomDialog;
