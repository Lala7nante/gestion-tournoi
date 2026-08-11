import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdSave } from 'react-icons/md';
import { TbTournament } from 'react-icons/tb';
import api from '../../api/axios';

export default function EquipeLigueForm() {
  const { tournoiId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nom: '', ville: '', coach: '' });
  const [tournoi, setTournoi] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get(`/tournois/${tournoiId}`)
      .then(res => setTournoi(res.data))
      .catch(err => console.error('Erreur fetch tournoi', err));
  }, [tournoiId]);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await api.post(`/tournois/${tournoiId}/equipes`, form);
      setSuccess('Équipe créée avec succès !');
      setTimeout(() => {
        navigate(`/tournois/${tournoiId}/equipes`);
      }, 1200);
    } catch (err) {
      console.error(err);
      setError(err.response?.data || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#080810',
    border: '1px solid #1e2130',
    color: '#fff',
  };

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(`/tournois/${tournoiId}/equipes`)}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(168,85,247,0.1)'; e.currentTarget.style.color = '#a855f7'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
        >
          <MdArrowBack className="text-xl" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TbTournament size={16} style={{ color: '#a855f7' }} />
            <span className="text-xs text-purple-400 font-bold tracking-widest">
              {tournoi?.nom || 'LIGUE'}
            </span>
          </div>
          <h1
            className="text-3xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #a855f7, #00d4ff)' }}
          >
            NOUVELLE ÉQUIPE
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Ajoutez une équipe dans la ligue
          </p>
        </div>
      </div>

      <div className="rounded-2xl p-8" style={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.07)' }}>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm"
            style={{ backgroundColor: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', color: '#4ade80' }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Nom */}
          <div>
            <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
              NOM DE L'ÉQUIPE
            </label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              placeholder="Ex: Manchester City"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition placeholder-gray-700"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = '1px solid #a855f7'}
              onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
            />
          </div>

          {/* Ville */}
          <div>
            <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
              VILLE
            </label>
            <input
              type="text"
              name="ville"
              value={form.ville}
              onChange={handleChange}
              placeholder="Ex: Manchester"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition placeholder-gray-700"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = '1px solid #a855f7'}
              onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
            />
          </div>

          {/* Coach */}
          <div>
            <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
              COACH
            </label>
            <input
              type="text"
              name="coach"
              value={form.coach}
              onChange={handleChange}
              placeholder="Ex: Pep Guardiola"
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition placeholder-gray-700"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = '1px solid #a855f7'}
              onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => navigate(`/tournois/${tournoiId}/equipes`)}
              className="flex-1 font-bold py-3 rounded-xl transition text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              ANNULER
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition text-sm disabled:opacity-50"
              style={{ backgroundColor: '#a855f7', color: '#fff' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#9333ea'; }}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#a855f7'}
            >
              <MdSave className="text-xl" />
              {loading ? 'ENREGISTREMENT...' : 'CRÉER'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}