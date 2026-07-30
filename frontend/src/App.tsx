import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Home from "./pages/home";
import Estados from "./pages/info";
import Cidades from "./pages/cidades";
import DirigenteCulturaPage from "./pages/dirigentes";
import Sobre from "./pages/sobre";
import AdminHome from "./pages/admin/adminHome";
import CidadeForm from "./pages/admin/cidadesForm";
import ImportarCidades from "./pages/admin/importarForm";
import Login from "./pages/admin/login";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/dirigentes-de-cultura" element={<Estados />} />
      <Route path="/dirigentes-de-cultura/:uf" element={<Cidades />} />
      <Route
        path="/dirigentes-de-cultura/:uf/:cidade"
        element={<DirigenteCulturaPage />}
      />
      <Route path="/sobre" element={<Sobre />} />

      <Route path="/admin/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminHome />} />
        <Route
          path="/admin/adicionar-manualmente"
          element={<CidadeForm />}
        />
        <Route
          path="/admin/importar-arquivo"
          element={<ImportarCidades />}
        />
      </Route>
    </Routes>
  );
}