import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Camera from "./pages/Camera";
import { Input } from "@material-tailwind/react";

function App() {
  return (
    <div className="pb-5">
      <div className="w-full py-3 px-5 bg-white flex justify-between">
        <img src="/logo.svg" alt="logo" className="h-10" />
        <div>
          <Input label="Search By Name" />
        </div>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/camera/:id" element={<Camera />} />
      </Routes>
    </div>
  );
}

export default App;
