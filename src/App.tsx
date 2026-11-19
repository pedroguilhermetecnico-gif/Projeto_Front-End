import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ClienteEditar from './pages/ClienteEditar';
import ClienteNovo from './pages/ClienteNovo';
import ClientesList from './pages/ClientesList';
import Login from './pages/Login';
import OrcamentoNovo from './pages/OrcamentoNovo';
import OrcamentosList from './pages/OrcamentosList';
import ProdutoEditar from './pages/ProdutoEditar';
import ProdutoNovo from './pages/ProdutoNovo';
import ProdutosList from './pages/ProdutosList';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/produtos" replace />} />

          {/* Modulo A: Produtos */}
          <Route path="/produtos" element={<ProdutosList />} />
          <Route path="/produtos/novo" element={<ProdutoNovo />} />
          <Route path="/produtos/:id" element={<ProdutoEditar />} />

          {/* Modulo B: Clientes */}
          <Route path="/clientes" element={<ClientesList />} />
          <Route path="/clientes/novo" element={<ClienteNovo />} />
          <Route path="/clientes/:id" element={<ClienteEditar />} />

          {/* Modulo C: Orcamentos & PDV */}
          <Route path="/orcamentos" element={<OrcamentoNovo />} />
          <Route path="/orcamentos/consultar" element={<OrcamentosList />} />
        </Route>

        <Route path="*" element={<Navigate to="/produtos" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
