import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdPerson, MdArrowBack } from 'react-icons/md';
import api from '../../api/axios';

const POSTES = ['GARDIEN', 'DEFENSEUR', 'MILIEU', 'ATTAQUANT'];

const POSTE_CONFIG = {
  GARDIEN:   { label: 'Gardien',   active: 'bg-yellow-400 text-black', inactive: 'bg-yellow-400/10 text-yellow-400', badge: 'bg-yellow-400/10 text-yellow-400' },
  DEFENSEUR: { label: 'Défenseur', active: 'bg-blue-400 text-black',   inactive: 'bg-blue-400/10 text-blue-400',     badge: 'bg-blue-400/10 text-blue-400'   },
  MILIEU:    { label: 'Milieu',    active: 'bg-green-400 text-black',  inactive: 'bg-green-400/10 text-green-400',   badge: 'bg-green-400/10 text-green-400' },
  ATTAQUANT: { label: 'Attaquant', active: 'bg-red-400 text-black',    inactive: 'bg-red-400/10 text-red-400',       badge: 'bg-red-400/10 text-red-400'     },
};

function MaillotIcon({ numero, nom, poste }) {
  const colors = {
    GARDIEN:   { from: '#facc15', to: '#ca8a04' },
    DEFENSEUR: { from: '#60a5fa', to: '#2563eb' },
    MILIEU:    { from: '#4ade80', to: '#16a34a' },
    ATTAQUANT: { from: '#f87171', to: '#dc2626' },
  };
  const c = colors[poste] || { from: '#22d3ee', to: '#0284c7' };

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" width="220" height="220" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="maillotGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.from} />
            <stop offset="100%" stopColor={c.to} />
          </linearGradient>
        </defs>
        <path
          d="M60,20 L20,50 L35,65 L50,55 L50,180 L150,180 L150,55 L165,65 L180,50 L140,20 Q120,35 100,35 Q80,35 60,20 Z"
          fill="url(#maillotGrad)"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
        <text x="100" y="125" textAnchor="middle" fontSize="48" fontWeight="bold" fill="rgba(0,0,0,0.6)" fontFamily="Arial">
          {numero}
        </text>
        <text x="100" y="165" textAnchor="middle" fontSize="14" fontWeight="bold" fill="rgba(0,0,0,0.5)" fontFamily="Arial">
          {nom?.toUpperCase().slice(0, 10)}
        </text>
      </svg>
    </div>
  );
}

export default function JoueurList() {
  const [joueurs, setJoueurs] = useState([]);
  const [equipe, setEquipe] = useState(null);
  const [posteActif, setPosteActif] = useState('ALL');
  const [selectedJoueur, setSelectedJoueur] = useState(null);

  const { equipeId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchJoueurs();
    if (equipeId) fetchEquipe();
  }, [equipeId]);

  const fetchEquipe = async () => {
    try {
      const res = await api.get(`/equipes/${equipeId}`);
      setEquipe(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJoueurs = async () => {
    try {
      const url = equipeId ? `/equipes/${equipeId}/joueurs` : '/joueurs';
      const res = await api.get(url);
      setJoueurs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce joueur ?')) return;
    try {
      await api.delete(`/equipes/${equipeId}/joueurs/${id}`);
      fetchJoueurs();
    } catch (err) {
      console.error(err);
    }
  };

  const joueursFiltres =
    posteActif === 'ALL'
      ? joueurs
      : joueurs.filter(j => j.poste === posteActif);

  useEffect(() => {
    if (joueursFiltres.length > 0) {
      setSelectedJoueur(joueursFiltres[0]);
    } else {
      setSelectedJoueur(null);
    }
  }, [posteActif, joueurs]);

  const compterParPoste = (poste) =>
    joueurs.filter(j => j.poste === poste).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          {equipeId && (
            <button onClick={() => navigate('/equipes')} className="text-gray-400 hover:text-cyan-400">
              <MdArrowBack className="text-2xl" />
            </button>
          )}
          <div>
            <h1 className="text-4xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}>
              JOUEURS
            </h1>
            <p className="text-gray-400 mt-1">
              {equipe ? `Équipe : ${equipe.nom}` : 'Tous les joueurs'}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate(equipeId ? `/equipes/${equipeId}/joueurs/new` : '/joueurs/new')}
          className="flex items-center gap-2 bg-cyan-400 text-black font-bold px-5 py-3 rounded-lg hover:bg-cyan-300 transition"
        >
          <MdAdd />
          NOUVEAU JOUEUR
        </button>
      </div>

      {/* Filtres */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <button
          onClick={() => setPosteActif('ALL')}
          className={`px-4 py-2 rounded-lg font-bold text-sm border transition ${
            posteActif === 'ALL'
              ? 'bg-cyan-400 text-black border-cyan-400'
              : 'border-gray-700/50 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
          }`}
        >
          Tous ({joueurs.length})
        </button>
        {POSTES.map(poste => {
          const config = POSTE_CONFIG[poste];
          const count = compterParPoste(poste);
          const isActive = posteActif === poste;
          return (
            <button
              key={poste}
              onClick={() => setPosteActif(poste)}
              className={`px-4 py-2 rounded-lg font-bold text-sm transition ${isActive ? config.active : config.inactive}`}
            >
              {config.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Tableau + Card côte à côte */}
      <div className="flex gap-6 items-start">

        {/* ✅ Tableau — hauteur limitée avec scroll */}
        <div className="flex-1 border border-gray-700/50 rounded-xl overflow-hidden">
          <div className="overflow-y-auto" style={{ maxHeight: '420px' }}>
            <table className="w-full">
              <tbody>
                {joueursFiltres.map((joueur) => (
                  <tr
                    key={joueur.id}
                    onClick={() => setSelectedJoueur(joueur)}
                    className={`cursor-pointer border-b border-gray-700/30 transition hover:bg-white/5 ${
                      selectedJoueur?.id === joueur.id ? 'bg-cyan-400/10' : ''
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <MdPerson className="text-cyan-400 shrink-0" />
                        <span className="text-white font-semibold text-sm">
                          {joueur.prenom} {joueur.nom} #{joueur.numero}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${POSTE_CONFIG[joueur.poste]?.badge}`}>
                        {POSTE_CONFIG[joueur.poste]?.label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={(e) => { e.stopPropagation(); navigate(`/joueurs/${joueur.id}/edit`); }}
                        className="text-gray-400 hover:text-cyan-400 transition mr-3">
                        <MdEdit className="inline text-lg" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(joueur.id); }}
                        className="text-gray-400 hover:text-red-400 transition">
                        <MdDelete className="inline text-lg" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {joueursFiltres.length === 0 && (
              <div className="text-center text-gray-500 py-10 text-sm">Aucun joueur</div>
            )}
          </div>
        </div>

        {/* ✅ Card maillot — grand maillot centré */}
        <div className="w-[320px] shrink-0 border border-gray-700/50 rounded-xl p-6 flex flex-col items-center justify-center min-h-[420px]">
          {selectedJoueur ? (
            <>
              <MaillotIcon
                numero={selectedJoueur.numero}
                nom={selectedJoueur.nom}
                poste={selectedJoueur.poste}
              />
              <p className="text-white mt-2 text-xl font-bold text-center">
                {selectedJoueur.prenom} {selectedJoueur.nom}
              </p>
              <p className="text-gray-400 text-sm mt-1">#{selectedJoueur.numero}</p>
              <span className={`mt-3 text-xs px-4 py-1.5 rounded-full font-semibold ${POSTE_CONFIG[selectedJoueur.poste]?.badge}`}>
                {POSTE_CONFIG[selectedJoueur.poste]?.label}
              </span>
            </>
          ) : (
            <div className="text-gray-500 text-center text-sm">Sélectionnez un joueur</div>
          )}
        </div>

      </div>
    </div>
  );
}