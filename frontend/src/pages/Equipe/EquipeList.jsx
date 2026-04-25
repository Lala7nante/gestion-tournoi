import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdGroup, MdLocationOn, MdPerson } from 'react-icons/md';
import api from '../../api/axios';

export default function EquipeList() {
  const [equipes, setEquipes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipes();
  }, []);

  const fetchEquipes = async () => {
    try {
      const res = await api.get('/equipes');
      setEquipes(res.data);
    } catch (err) {
      console.error('Erreur chargement équipes', err);
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
                {/* Ville */}
                {equipe.ville && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdLocationOn style={{ color: '#00d4ff' }} />
                    {equipe.ville}
                  </div>
                )}
                {/* Coach */}
                {equipe.coach && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdPerson style={{ color: '#00d4ff' }} />
                    {equipe.coach}
                  </div>
                )}
                {/* Groupe */}
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
                JOUEURS
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

        {/* Aucune équipe */}
        {equipes.length === 0 && (
          <div className="col-span-3 text-center text-gray-600 py-20">
            Aucune équipe trouvée. Créez votre première équipe !
          </div>
        )}
      </div>
    </div>
  );
}