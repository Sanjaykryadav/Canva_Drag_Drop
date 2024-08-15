import Canvas from "./Canvas";
import { Toaster } from "react-hot-toast";
function App() {
  return (
    <>
      <Toaster />
      <div class="area">
        <ul class="circles">
          <li className="font-semibold text-white">Click On Buttons To Get Started</li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li className="font-semibold text-white">Create - Save - Delete</li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li className="font-semibold text-white">Click On Buttons To Get Started</li>
        </ul>
      </div>
      <Canvas />
    </>
  );
}

export default App;
