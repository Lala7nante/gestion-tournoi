import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdGroup, MdLocationOn, MdPerson, MdClose } from 'react-icons/md';
import { TbTournament } from 'react-icons/tb';
import api from '../../api/axios';

export default function EquipeList() {
  const [equipes, setEquipes] = useState([]);
  const [tournois, setTournois] = useState([]);
  const [modalTournoi, setModalTournoi] = useState(false);
  const [selectedTournoi, setSelectedTournoi] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipes();
    fetchTournois();
  }, []);

  const fetchEquipes = async () => {
    try {
      const res = await api.get('/equipes');
      setEquipes(res.data);
    } catch (err) {
      console.error('Erreur chargement équipes', err);
    }
  };

  const fetchTournois = async () => {
    try {
      const res = await api.get('/tournois');
      setTournois(res.data);
    } catch (err) {
      console.error('Erreur chargement tournois', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette équipe ?')) return;
    try {
      await api.delete(`/equipes/${id}`);
      fetchEquipes();
    } catch (err) {
      console.error('Erreur suppression', err);
    }
  };

  const handleGoToGroupe = () => {
    if (!selectedTournoi) return;
    navigate(`/tournois/${selectedTournoi}/groupes`);
    setModalTournoi(false);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-4xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}
          >
            ÉQUIPES
          </h1>
          <p className="text-gray-400 mt-1">Gérez les équipes du tournoi</p>
        </div>

        {/* Bouton Ajouter équipe dans groupe */}
        <button
          onClick={() => { setModalTournoi(true); setSelectedTournoi(''); }}
          className="flex items-center gap-2 font-bold px-5 py-3 rounded-lg transition"
          style={{ backgroundColor: '#00d4ff', color: '#000' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00bfea'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00d4ff'}
        >
          <MdGroup className="text-xl" />
          AJOUTER DANS UN GROUPE
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipes.map((equipe) => (
          <div
            key={equipe.id}
            className="rounded-xl p-6 flex flex-col justify-between transition-all duration-200"
            style={{
              backgroundColor: '#0f1117',
              border: '1px solid #1e2130',
              borderTop: '2px solid #00d4ff',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#00d4ff55'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e2130'}
          >
            {/* Nom */}
            <div>
              <h2 className="text-white font-bold text-xl mb-4">{equipe.nom}</h2>
              <div className="flex flex-col gap-2">
                {equipe.ville && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdLocationOn style={{ color: '#00d4ff' }} />
                    {equipe.ville}
                  </div>
                )}
                {equipe.coach && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdPerson style={{ color: '#00d4ff' }} />
                    {equipe.coach}
                  </div>
                )}
                {equipe.groupeNom && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdGroup style={{ color: '#00d4ff' }} />
                    Groupe {equipe.groupeNom}
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
                AJOUTER JOUEURS
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/equipes/${equipe.id}/edit`)}
                  className="transition"
                  style={{ color: '#9ca3af' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
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

        {equipes.length === 0 && (
          <div className="col-span-3 text-center text-gray-600 py-20">
            Aucune équipe trouvée. Créez votre première équipe !
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
              border: '1px solid rgba(0,212,255,0.2)',
              boxShadow: '0 0 40px rgba(0,212,255,0.06)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <TbTournament size={18} style={{ color: '#00d4ff' }} />
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
              Sélectionnez le tournoi pour accéder à ses groupes.
            </p>

            {/* Select tournoi */}
            <select
              value={selectedTournoi}
              onChange={e => setSelectedTournoi(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none mb-5"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(0,212,255,0.2)',
                color: selectedTournoi ? '#fff' : '#6b7280',
              }}
            >
              <option value="">Sélectionner un tournoi</option>
              {tournois.map(t => (
                <option key={t.id} value={t.id}>{t.nom}</option>
              ))}
            </select>

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
                style={{ backgroundColor: '#00d4ff', color: '#000' }}
                onMouseEnter={e => { if (selectedTournoi) e.currentTarget.style.backgroundColor = '#00bfea'; }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00d4ff'}
              >
                ALLER AUX GROUPES
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}