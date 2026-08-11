import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdEdit, MdDelete, MdLocationOn, MdPerson, MdArrowBack } from 'react-icons/md';
import { TbTournament } from 'react-icons/tb';
import api from '../../api/axios';

export default function EquipeLigueList() {
  const { tournoiId } = useParams();
  const navigate = useNavigate();

  const [equipes, setEquipes] = useState([]);
  const [tournoi, setTournoi] = useState(null);

  useEffect(() => {
    fetchData();
  }, [tournoiId]);

  const fetchData = async () => {
    try {
      const [eqRes, tRes] = await Promise.all([
        api.get(`/tournois/${tournoiId}/equipes`),
        api.get(`/tournois/${tournoiId}`),
      ]);
      setEquipes(eqRes.data);
      setTournoi(tRes.data);
    } catch (err) {
      console.error('Erreur chargement', err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette équipe ?')) return;
    try {
      await api.delete(`/equipes/${id}`);
      fetchData();
    } catch (err) {
      console.error('Erreur suppression', err);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tournois')}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.1)'; e.currentTarget.style.color = '#a855f7'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <MdArrowBack className="text-xl" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <TbTournament size={14} style={{ color: '#a855f7' }} />
              <span className="text-xs text-purple-400 font-bold tracking-widest">
                {tournoi?.saison || ''}
              </span>
            </div>
            <h1
              className="text-4xl font-bold bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(to right, #a855f7, #00d4ff)' }}
            >
              {tournoi?.nom || 'LIGUE'}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {equipes.length} équipe{equipes.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/tournois/${tournoiId}/equipes/new`)}
          className="flex items-center gap-2 font-bold px-5 py-3 rounded-xl transition text-sm"
          style={{ backgroundColor: '#a855f7', color: '#fff' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#9333ea'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#a855f7'}
        >
          <MdAdd className="text-xl" />
          AJOUTER ÉQUIPE
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
              borderTop: '2px solid #a855f7',
            }}
          >
            <div>
              <h2 className="text-white font-bold text-xl mb-4">{equipe.nom}</h2>
              <div className="flex flex-col gap-2">
                {equipe.ville && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdLocationOn style={{ color: '#a855f7' }} />
                    {equipe.ville}
                  </div>
                )}
                {equipe.coach && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MdPerson style={{ color: '#a855f7' }} />
                    {equipe.coach}
                  </div>
                )}
              </div>
            </div>

            <div
              className="flex items-center justify-end gap-3 mt-6 pt-4"
              style={{ borderTop: '1px solid #1e2130' }}
            >
              <button
                onClick={() => navigate(`/equipes/${equipe.id}/edit`)}
                className="transition"
                style={{ color: '#9ca3af' }}
                onMouseEnter={e => e.currentTarget.style.color = '#a855f7'}
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
        ))}

        {equipes.length === 0 && (
          <div className="col-span-3 text-center text-gray-600 py-20">
            Aucune équipe dans cette ligue. Ajoutez votre première équipe !
          </div>
        )}
      </div>
    </div>
  );
}