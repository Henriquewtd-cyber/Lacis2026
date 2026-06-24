import { Routes, Route } from "react-router-dom";

import Home from "./pages/home";
import Estados from "./pages/dirigentes";
import Cidades from "./pages/cidades";
import Sobre from "./pages/sobre";
import DirigenteCulturaPage from "./pages/info";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dirigentes-de-cultura" element={<Estados />} />
      <Route path="/dirigentes-de-cultura/:uf" element={<Cidades />} />
      <Route path="/dirigentes-de-cultura/:uf/:cidade" element={<DirigenteCulturaPage />} />
      <Route path="/sobre" element={<Sobre />} />
    </Routes>
  );
}