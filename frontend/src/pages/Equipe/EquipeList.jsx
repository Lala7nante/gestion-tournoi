import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdGroup, MdLocationOn, MdPerson, MdClose, MdCheckCircle, MdError } from 'react-icons/md';
import { IoTrophyOutline } from 'react-icons/io5';
import { TbTournament } from 'react-icons/tb';
import api from '../../api/axios';

export default function EquipeList() {
  const [equipes, setEquipes] = useState([]);
  const [tournois, setTournois] = useState([]);
  const [modalTournoi, setModalTournoi] = useState(false);
  const [selectedTournoi, setSelectedTournoi] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); 
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipes();
    fetchTournois();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const fetchEquipes = async () => {
    try {
      const res = await api.get('/equipes');
      setEquipes(res.data);
    } catch (err) {
      console.error('Erreur chargement équipes', err);
      setNotification({ type: 'error', message: 'Erreur lors du chargement des équipes.' });
    }
  };

  const fetchTournois = async () => {
    try {
      const res = await api.get('/tournois');
      setTournois(res.data);
    } catch (err) {
      console.error('Erreur chargement tournois', err);
      setNotification({ type: 'error', message: 'Erreur lors du chargement des tournois.' });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette équipe ?')) return;
    try {
      await api.delete(`/equipes/${id}`);
      setNotification({ type: 'success', message: 'Équipe supprimée avec succès !' });
      fetchEquipes();
    } catch (err) {
      console.error('Erreur suppression', err);
      setNotification({ type: 'error', message: 'Erreur lors de la suppression de l\'équipe.' });
    }
  };

  const handleGoToGroupe = () => {
    if (!selectedTournoi) return;
    const tournoi = tournois.find(t => t.id == selectedTournoi);
    if (tournoi?.type === 'LIGUE') {
      navigate(`/tournois/${selectedTournoi}/equipes`);
    } else {
      navigate(`/tournois/${selectedTournoi}/groupes`);
    }
    setModalTournoi(false);
  };

  // 👈 Filtrage arakaraky ny tab
  const equipesFiltrees = equipes.filter(e => {
    if (activeTab === 'LIGUE') return e.tournoi !== null && e.tournoi !== undefined;
    if (activeTab === 'COUPE') return e.groupe !== null && e.groupe !== undefined;
    return true;
  });

  const tournoiSelectionne = tournois.find(t => t.id == selectedTournoi);
  const isLigue = tournoiSelectionne?.type === 'LIGUE';

  const nbCoupe = equipes.filter(e => e.groupe).length;
  const nbLigue = equipes.filter(e => e.tournoi).length;

  return (
    <div>
      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed top-6 right-6 z-[60] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
          style={{
            backgroundColor: notification.type === 'success' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
            border: `1px solid ${notification.type === 'success' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
            color: notification.type === 'success' ? '#4ade80' : '#f87171',
            backdropFilter: 'blur(6px)',
          }}
        >
          {notification.type === 'success' ? <MdCheckCircle className="text-xl" /> : <MdError className="text-xl" />}
          <span className="text-sm font-semibold">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-2 opacity-70 hover:opacity-100 transition"
          >
            <MdClose size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-4xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}
          >
            ÉQUIPES
          </h1>
          <p className="text-gray-400 mt-1">Gérez les équipes du tournoi</p>
        </div>

        <button
          onClick={() => { setModalTournoi(true); setSelectedTournoi(''); }}
          className="flex items-center gap-2 font-bold px-5 py-3 rounded-xl transition"
          style={{ backgroundColor: '#00d4ff', color: '#000' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00bfea'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00d4ff'}
        >
          <MdGroup className="text-xl" />
          AJOUTER UNE ÉQUIPE
        </button>
      </div>

      {/* 👈 Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'ALL', label: `TOUS (${equipes.length})`, color: null },
          { key: 'COUPE', label: `COUPE (${nbCoupe})`, color: '#00d4ff' },
          { key: 'LIGUE', label: `LIGUE (${nbLigue})`, color: '#a855f7' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-4 py-2 rounded-xl text-sm font-bold transition"
            style={{
              backgroundColor: activeTab === tab.key
                ? tab.color ?? 'rgba(255,255,255,0.15)'
                : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.key
                ? tab.key === 'COUPE' ? '#000' : '#fff'
                : '#6b7280',
              border: activeTab === tab.key
                ? `1px solid ${tab.color ?? 'rgba(255,255,255,0.2)'}`
                : '1px solid rgba(255,255,255,0.06)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipesFiltrees.map((equipe) => (
          <div
            key={equipe.id}
            className="rounded-xl p-6 flex flex-col justify-between transition-all duration-200"
            style={{
              backgroundColor: '#0f1117',
              border: '1px solid #1e2130',
              borderTop: equipe.tournoi ? '2px solid #a855f7' : '2px solid #00d4ff',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = equipe.tournoi ? '#a855f755' : '#00d4ff55'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2130'}
          >
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between mb-3">
                {equipe.tournoi ? (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}
                  >
                    LIGUE
                  </span>
                ) : (
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.2)' }}
                  >
                    COUPE
                  </span>
                )}

                {/* Bouton + ÉQUIPE si LIGUE */}
                {equipe.tournoi && (
                  <button
                    onClick={() => navigate(`/tournois/${equipe.tournoi.id}/equipes/new`)}
                    className="text-xs font-bold px-2 py-1 rounded-lg transition flex items-center gap-1"
                    style={{
                      backgroundColor: 'rgba(168,85,247,0.08)',
                      color: '#a855f7',
                      border: '1px solid rgba(168,85,247,0.2)',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.08)'}
                  >
                    <MdAdd size={14} />
                    ÉQUIPE
                  </button>
                )}
              </div>

              <h2 className="text-white font-bold text-xl mb-4">{equipe.nom}</h2>
              <div className="flex flex-col gap-2">
                {equipe.ville && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdLocationOn style={{ color: equipe.tournoi ? '#a855f7' : '#00d4ff' }} />
                    {equipe.ville}
                  </div>
                )}
                {equipe.coach && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdPerson style={{ color: equipe.tournoi ? '#a855f7' : '#00d4ff' }} />
                    {equipe.coach}
                  </div>
                )}
                {equipe.groupe && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdGroup style={{ color: '#00d4ff' }} />
                    Groupe {equipe.groupe.nom}
                  </div>
                )}
                {equipe.tournoi && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <TbTournament style={{ color: '#a855f7' }} />
                    {equipe.tournoi.nom}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center justify-between mt-6 pt-4"
              style={{ borderTop: '1px solid #1e2130' }}
            >
              <button
                onClick={() => navigate(`/equipes/${equipe.id}/joueurs`)}
                className="text-gray-400 hover:text-white text-sm font-semibold transition"
              >
                JOUEURS
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/equipes/${equipe.id}/edit`)}
                  className="transition"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={e => e.currentTarget.style.color = equipe.tournoi ? '#a855f7' : '#00d4ff'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  <MdEdit className="text-xl" />
                </button>
                <button
                  onClick={() => handleDelete(equipe.id)}
                  className="transition"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
                >
                  <MdDelete className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {equipesFiltrees.length === 0 && (
          <div className="col-span-3 text-center text-gray-600 py-20">
            {activeTab === 'LIGUE'
              ? 'Aucune équipe dans une ligue.'
              : activeTab === 'COUPE'
              ? 'Aucune équipe dans une coupe.'
              : 'Aucune équipe trouvée.'}
          </div>
        )}
      </div>

      {/* Modal choix tournoi */}
      {modalTournoi && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => setModalTournoi(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6"
            style={{
              backgroundColor: '#0d1117',
              border: `1px solid ${isLigue ? 'rgba(168,85,247,0.2)' : 'rgba(0,212,255,0.2)'}`,
              boxShadow: `0 0 40px ${isLigue ? 'rgba(168,85,247,0.06)' : 'rgba(0,212,255,0.06)'}`,
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                {isLigue
                  ? <TbTournament size={18} style={{ color: '#a855f7' }} />
                  : <IoTrophyOutline size={18} style={{ color: '#00d4ff' }} />
                }
                <h2 className="text-white font-bold text-base tracking-wide">
                  CHOISIR UN TOURNOI
                </h2>
              </div>
              <button
                onClick={() => setModalTournoi(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#6b7280' }}
              >
                <MdClose size={16} />
              </button>
            </div>

            <p className="text-gray-500 text-xs mb-4">
              Sélectionnez le tournoi pour ajouter une équipe.
            </p>

            {/* Select tournoi */}
            <select
              value={selectedTournoi}
              onChange={e => setSelectedTournoi(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none mb-3"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: `1px solid ${isLigue ? 'rgba(168,85,247,0.3)' : 'rgba(0,212,255,0.2)'}`,
                color: selectedTournoi ? '#fff' : '#6b7280',
              }}
            >
              <option value="">Sélectionner un tournoi</option>
              {tournois.map(t => (
                <option key={t.id} value={t.id}>
                  {t.nom} — {t.type}
                </option>
              ))}
            </select>

            {/* Badge type tournoi selectionné */}
            {tournoiSelectionne && (
              <div
                className="mb-4 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                style={{
                  backgroundColor: isLigue ? 'rgba(168,85,247,0.08)' : 'rgba(0,212,255,0.08)',
                  color: isLigue ? '#a855f7' : '#00d4ff',
                  border: `1px solid ${isLigue ? 'rgba(168,85,247,0.2)' : 'rgba(0,212,255,0.2)'}`,
                }}
              >
                {isLigue
                  ? <><TbTournament size={14} /> LIGUE — accès direct aux équipes</>
                  : <><IoTrophyOutline size={14} /> COUPE — accès aux groupes</>
                }
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3">
              <button
                onClick={() => setModalTournoi(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition"
                style={{ border: '1px solid #374151', color: '#9ca3af' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
              >
                ANNULER
              </button>
              <button
                onClick={handleGoToGroupe}
                disabled={!selectedTournoi}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isLigue ? '#a855f7' : '#00d4ff',
                  color: isLigue ? '#fff' : '#000',
                }}
                onMouseEnter={e => { if (selectedTournoi) e.currentTarget.style.backgroundColor = isLigue ? '#9333ea' : '#00bfea'; }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = isLigue ? '#a855f7' : '#00d4ff'}
              >
                {isLigue ? 'ALLER À LA LIGUE' : 'ALLER AUX GROUPES'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}