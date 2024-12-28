import "./App.css";

function App() {
  return (
    <div className="space-y-5 border rounded-xl p-10">
      <h1>Enter your name to join</h1>
      <div className="flex flex-col space-y-5">
        <input
          placeholder="Enter username..."
          className="p-3 rounded-xl"
          onChange={(e) => e.target.value}
        />
        <button>Join</button>
      </div>
    </div>
  );
}

export default App;
