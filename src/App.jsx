import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import MainMenu from './components/MainMenu'
import Home from './pages/Home'
import Tarefas from './pages/Tarefas'
import Equipa from './pages/Equipa'
import Sobre from './pages/Sobre'
import Entrar from './pages/Entrar'
import CriarConta from './pages/CriarConta'

function App() {
    const [dark, setDark] = useState(true)

    return (
        <div data-theme={dark ? 'dark' : 'light'} className="min-h-screen bg-gradient text-theme">
            <MainMenu
                brand="TROPA"
                brandAccent="DOS BOZOS"
                dark={dark}
                setDark={setDark}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tarefas" element={<Tarefas />} />
                <Route path="/equipa" element={<Equipa />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/entrar" element={<Entrar />} />
                <Route path="/criar-conta" element={<CriarConta />} />
            </Routes>
        </div>
    )
}

export default App