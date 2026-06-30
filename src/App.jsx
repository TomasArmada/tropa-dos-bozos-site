import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from './supabaseClient'
import MainMenu from './components/MainMenu'
import Home from './pages/Home'
import Tarefas from './pages/Tarefas'
import Equipa from './pages/Equipa'
import Sobre from './pages/Sobre'
import Entrar from './pages/Entrar'
import CriarConta from './pages/CriarConta'
import Admin from './pages/Admin'

function App() {
    const [dark, setDark] = useState(true)
    const [session, setSession] = useState(null)
    const [username, setUsername] = useState('')
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    useEffect(() => {
        if (!session) {
            setUsername('')
            setIsAdmin(false)
            return
        }
        supabase
            .from('profiles')
            .select('username, is_admin')
            .eq('id', session.user.id)
            .single()
            .then(({ data }) => {
                setUsername(data?.username || '')
                setIsAdmin(data?.is_admin || false)
            })
    }, [session])

    async function handleLogout() {
        await supabase.auth.signOut()
    }

    return (
        <div data-theme={dark ? 'dark' : 'light'} className="min-h-screen bg-gradient text-theme">
            <MainMenu
                brand="TROPA"
                brandAccent="DOS BOZOS"
                dark={dark}
                setDark={setDark}
                isLoggedIn={!!session}
                userName={username}
                isAdmin={isAdmin}
                onLogout={handleLogout}
            />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/tarefas" element={<Tarefas />} />
                <Route path="/equipa" element={<Equipa />} />
                <Route path="/sobre" element={<Sobre />} />
                <Route path="/entrar" element={<Entrar />} />
                <Route path="/criar-conta" element={<CriarConta />} />
                <Route path="/admin" element={<Admin />} />
            </Routes>
        </div>
    )
}

export default App