import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import TournoiList from './pages/Tournoi/TournoiList';
import TournoiForm from './pages/Tournoi/TournoiForm';
import EquipeList from './pages/Equipe/EquipeList';
import EquipeForm from './pages/Equipe/EquipeForm';
import JoueurList from './pages/Joueur/JoueurList';
import JoueurForm from './pages/Joueur/JoueurForm';
import MatchList from './pages/Match/MatchList';
import MatchForm from './pages/Match/MatchForm';
import MatchScore from './pages/Match/MatchScore';
import Dashboard from './pages/Dashboard/Dashboard';
import ClassementPage from './pages/Classement/ClassementPage';
import StatistiquePage from './pages/Statistique/StatistiquePage';
import GroupeList from './pages/groupes/GroupeList';
import StatMatch from './pages/Statistique/StatMatch';
 
function SidebarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="6" y1="1.75" x2="6" y2="16.25" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}
 
function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
 
  return (
    <BrowserRouter>
      <div className="flex min-h-screen" style={{ backgroundColor: '#0a0a0f' }}>
        <Navbar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(false)} />
        <div
          className="flex-1 min-h-screen p-6"
          style={{ marginLeft: sidebarOpen ? '240px' : '0px', transition: 'margin-left 0.25s ease' }}
        >
          {!sidebarOpen && (
            <button
              onClick={() => setSidebarOpen(true)}
              title="Ouvrir la barre latérale"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px', borderRadius: '6px', marginBottom: '16px', display: 'flex' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#e5e7eb'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <SidebarIcon />
            </button>
          )}
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/tournois" element={<TournoiList />} />
            <Route path="/tournois/new" element={<TournoiForm />} />
            <Route path="/tournois/:id/edit" element={<TournoiForm />} />
            <Route path="/tournois/:tournoiId/groupes" element={<GroupeList />} />
            <Route path="/equipes" element={<EquipeList />} />
            <Route path="/equipes/new" element={<EquipeForm />} />
            <Route path="/equipes/:id/edit" element={<EquipeForm />} />
            {/* Routes joueurs depuis équipe */}
            <Route path="/equipes/:equipeId/joueurs" element={<JoueurList />} />
            <Route path="/statistiques/match/:id" element={<StatMatch />} />
            <Route path="/equipes/:equipeId/joueurs/new" element={<JoueurForm />} />
            <Route path="/equipes/:equipeId/joueurs/:id/edit" element={<JoueurForm />} />
            {/* Routes joueurs globales */}
            <Route path="/joueurs" element={<JoueurList />} />
            <Route path="/joueurs/new" element={<JoueurForm />} />
            <Route path="/joueurs/:id/edit" element={<JoueurForm />} />
            {/* Routes matchs */}
            <Route path="/matchs" element={<MatchList />} />
            <Route path="/matchs/new" element={<MatchForm />} />
            <Route path="/matchs/:id/edit" element={<MatchForm />} />
            <Route path="/matchs/:id/score" element={<MatchScore />} />
            <Route path="/classement" element={<ClassementPage />} />
            <Route path="/statistiques" element={<StatistiquePage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
 
export default App;
 