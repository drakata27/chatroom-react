import { X } from "lucide-react";

interface ButtonProps {
  onClick: () => void;
  text: string;
  isDisconnect?: boolean;
}

const Button = ({ onClick, text, isDisconnect }: ButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={
        !isDisconnect
          ? "p-2 bg-blue-500 hover:bg-blue-700 text-white rounded-xl"
          : "p-2 bg-red-500 hover:bg-red-700 text-white rounded-xl w-[100%]"
      }
    >
      <span className="font-bold flex justify-center space-x-10">
        {text} {isDisconnect ? <X /> : <></>}
      </span>
    </button>
  );
};

export default Button;
