import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdSave } from 'react-icons/md';
import api from '../../api/axios';

export default function EquipeForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nom: '', ville: '', coach: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/equipes/${id}`)
      .then(res => setForm({ nom: res.data.nom, ville: res.data.ville || '', coach: res.data.coach || '' }))
      .catch(err => console.error('Erreur fetch équipe', err));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/equipes/${id}`, form);
      navigate('/equipes');
    } catch (err) {
      console.error(err);
      setError(err.response?.data || "Une erreur est survenue.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-[#1a1a1a] rounded-xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/equipes')} className="text-gray-400 hover:text-cyan-400">
          <MdArrowBack className="text-2xl" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">MODIFIER L'ÉQUIPE</h1>
          <p className="text-gray-400 mt-1">Modifiez les informations de l'équipe</p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="flex flex-col gap-4">
        {error && <div className="p-3 bg-red-500/10 text-red-400 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nom */}
          <div>
            <label className="text-gray-400 text-sm font-semibold mb-2 block">NOM</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              placeholder="Nom de l'équipe"
              required
              className="w-full px-4 py-3 rounded-lg bg-[#111] border border-gray-700 text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Ville */}
          <div>
            <label className="text-gray-400 text-sm font-semibold mb-2 block">VILLE</label>
            <input
              type="text"
              name="ville"
              value={form.ville}
              onChange={handleChange}
              placeholder="Ville"
              className="w-full px-4 py-3 rounded-lg bg-[#111] border border-gray-700 text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Coach */}
          <div>
            <label className="text-gray-400 text-sm font-semibold mb-2 block">COACH</label>
            <input
              type="text"
              name="coach"
              value={form.coach}
              onChange={handleChange}
              placeholder="Coach"
              className="w-full px-4 py-3 rounded-lg bg-[#111] border border-gray-700 text-white focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate('/equipes')}
              className="flex-1 border border-gray-700 text-gray-400 py-2 rounded-lg hover:text-white hover:border-gray-500 transition"
            >
              ANNULER
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-400 text-black py-2 rounded-lg font-bold hover:bg-cyan-300 transition"
            >
              <MdSave className="text-xl" />
              MODIFIER
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}