import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdSave } from 'react-icons/md';
import api from '../../api/axios';

export default function JoueurForm() {
  const { id, equipeId } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fromEquipe = Boolean(equipeId);

  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    numero: '',
    poste: 'MILIEU',
    equipeId: equipeId || '',
  });

  const [equipes, setEquipes] = useState([]);
  const [equipe, setEquipe] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!fromEquipe) {
      api.get('/equipes')
        .then(res => setEquipes(res.data))
        .catch(err => console.error('Erreur chargement équipes', err));
    } else {
      api.get(`/equipes/${equipeId}`)
        .then(res => setEquipe(res.data))
        .catch(err => console.error('Erreur chargement équipe', err));
    }

    if (isEdit) {
      api.get(`/joueurs/${id}`)
        .then(res => setForm(prev => ({ ...prev, ...res.data })))
        .catch(err => console.error('Erreur chargement joueur', err));
    }
  }, [id, equipeId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        // ✅ CORRIGÉ : URL avec equipeId
        await api.put(`/equipes/${equipeId}/joueurs/${id}`, form);
      } else {
        await api.post(`/equipes/${form.equipeId}/joueurs`, form);
      }
      navigate(fromEquipe ? `/equipes/${equipeId}/joueurs` : '/joueurs');
    } catch (err) {
      // ✅ CORRIGÉ : extraire le message texte de l'objet erreur
      const msg = err.response?.data?.message || err.response?.data || 'Une erreur est survenue. Vérifiez les données.';
      setError(typeof msg === 'string' ? msg : JSON.stringify(msg));
      console.error(err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate(fromEquipe ? `/equipes/${equipeId}/joueurs` : '/joueurs')}
          className="text-gray-400 hover:text-cyan-400 transition"
        >
          <MdArrowBack className="text-2xl" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-cyan-400">
            {isEdit ? 'MODIFIER LE JOUEUR' : 'NOUVEAU JOUEUR'}
          </h1>
          <p className="text-gray-400 mt-1">
            {equipe ? `Équipe : ${equipe.nom}` : isEdit ? 'Modifiez les informations du joueur' : 'Ajoutez un nouveau joueur'}
          </p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8">
        {error && (
          <div className="mb-6 bg-red-400/10 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-semibold mb-2 block">NOM</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleChange}
                required
                className="w-full bg-[#111111] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition placeholder-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-semibold mb-2 block">
                PRÉNOM <span className="text-gray-600 font-normal text-xs">(optionnel)</span>
              </label>
              <input
                type="text"
                name="prenom"
                value={form.prenom}
                onChange={handleChange}
                className="w-full bg-[#111111] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition placeholder-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-semibold mb-2 block">NUMÉRO</label>
              <input
                type="number"
                name="numero"
                value={form.numero}
                onChange={handleChange}
                required
                min={1}
                max={99}
                className="w-full bg-[#111111] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition placeholder-gray-600"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-semibold mb-2 block">POSTE</label>
              <select
                name="poste"
                value={form.poste}
                onChange={handleChange}
                required
                className="w-full bg-[#111111] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="GARDIEN">GARDIEN</option>
                <option value="DEFENSEUR">DÉFENSEUR</option>
                <option value="MILIEU">MILIEU</option>
                <option value="ATTAQUANT">ATTAQUANT</option>
              </select>
            </div>
          </div>

          {!fromEquipe && (
            <div>
              <label className="text-gray-400 text-sm font-semibold mb-2 block">ÉQUIPE</label>
              <select
                name="equipeId"
                value={form.equipeId}
                onChange={handleChange}
                required
                className="w-full bg-[#111111] border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition"
              >
                <option value="">Sélectionnez une équipe</option>
                {equipes.map((equipe) => (
                  <option key={equipe.id} value={equipe.id}>
                    {equipe.nom}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate(fromEquipe ? `/equipes/${equipeId}/joueurs` : '/joueurs')}
              className="flex-1 border border-gray-700 text-gray-400 font-bold py-3 rounded-lg hover:border-gray-500 hover:text-white transition"
            >
              ANNULER
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 rounded-lg hover:bg-cyan-300 transition"
            >
              <MdSave className="text-xl" />
              {isEdit ? 'MODIFIER' : 'CRÉER'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}