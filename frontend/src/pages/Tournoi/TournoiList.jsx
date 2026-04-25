import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdAdd, MdCalendarToday, MdGroup, MdEdit, MdDelete, MdFolder } from 'react-icons/md';
import api from '../../api/axios';

export default function TournoiList() {
  const [tournois, setTournois] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournois();
  }, []);

  const fetchTournois = async () => {
    try {
      const res = await api.get('/tournois');
      setTournois(res.data);
    } catch (err) {
      console.error('Erreur chargement tournois', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce tournoi ?')) return;
    try {
      await api.delete(`/tournois/${id}`);
      fetchTournois();
    } catch (err) {
      console.error('Erreur suppression', err);
    }
  };

  const getStatutStyle = (statut) => {
    switch (statut) {
      case 'EN_COURS': return { backgroundColor: '#00d4ff15', color: '#00d4ff' };
      case 'TERMINE':  return { backgroundColor: '#ffffff10', color: '#9ca3af' };
      default:         return { backgroundColor: '#ff6b0015', color: '#f59e0b' };
    }
  };

  const getStatutLabel = (statut) => {
    switch (statut) {
      case 'EN_COURS': return 'EN COURS';
      case 'TERMINE':  return 'TERMINÉ';
      default:         return 'À VENIR';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-cyan-400">TOURNOIS</h1>
          <p className="text-gray-400 mt-1">Gérez vos tournois sportifs</p>
        </div>
        <button
          onClick={() => navigate('/tournois/new')}
          className="flex items-center gap-2 font-bold px-5 py-3 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition"
        >
          <MdAdd className="text-xl" /> NOUVEAU TOURNOI
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournois.map((tournoi) => (
          <div
            key={tournoi.id}
            className="rounded-xl p-6 flex flex-col justify-between transition-all duration-200 border-t-2 border-gray-800 hover:border-cyan-400"
            style={{ backgroundColor: '#0f1117', border: '1px solid #1e2130', borderTop: '2px solid #00d4ff' }}
          >
            {/* Nom + Statut */}
            <div>
              <h2 className="text-white font-bold text-xl mb-3">{tournoi.nom}</h2>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={getStatutStyle(tournoi.statut)}>
                {getStatutLabel(tournoi.statut)}
              </span>

              {/* Infos */}
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MdCalendarToday style={{ color: '#00d4ff' }} /> {tournoi.dateDebut}
                </div>
                <div
                  className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer"
                  onClick={() => navigate(`/tournois/${tournoi.id}/groupes`)}
                >
                  <MdFolder style={{ color: '#00d4ff' }} />
                  {tournoi.nbGroupes} groupes
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-800">
              <button
                   onClick={() => navigate(`/tournois/${tournoi.id}/groupes`)}
                  className="text-gray-400 hover:text-cyan-400 text-sm font-semibold transition"
              >
             GROUPES
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(`/tournois/${tournoi.id}/edit`)}
                  className="text-gray-400 hover:text-cyan-400 transition"
                >
                  <MdEdit className="text-xl" />
                </button>
                <button
                  onClick={() => handleDelete(tournoi.id)}
                  className="text-gray-400 hover:text-red-500 transition"
                >
                  <MdDelete className="text-xl" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Aucun tournoi */}
        {tournois.length === 0 && (
          <div className="col-span-3 text-center text-gray-600 py-20">
            Aucun tournoi trouvé. Créez votre premier tournoi !
          </div>
        )}
      </div>
    </div>
  );
}