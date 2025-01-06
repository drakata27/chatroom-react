interface InputProps {
  onChange: (e: any) => void;
  onKeyDownAction: () => void;
  placeholder: string;
}

const Input = ({ onChange, onKeyDownAction, placeholder }: InputProps) => {
  return (
    <input
      placeholder={placeholder}
      className="p-3 rounded-xl text-white"
      onChange={onChange}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onKeyDownAction();
        }
      }}
    />
  );
};

export default Input;
