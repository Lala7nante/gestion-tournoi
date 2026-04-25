import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdSave } from 'react-icons/md';
import api from '../../api/axios';

export default function TournoiForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    nom: '',
    description: '',
    dateDebut: '',
    dateFin: '',
    nbGroupes: '',
    statut: 'EN_COURS',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/tournois/${id}`)
        .then(res => setForm(res.data))
        .catch(err => console.error('Erreur chargement', err));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isEdit) {
        await api.put(`/tournois/${id}`, form);
      } else {
        await api.post('/tournois', form);
      }
      navigate('/');
    } catch (err) {
      setError('Une erreur est survenue. Vérifiez les données.');
      console.error(err);
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
          onClick={() => navigate('/tournois')}
          className="transition"
          style={{ color: '#9ca3af' }}
          onMouseEnter={e => e.currentTarget.style.color = '#00d4ff'}
          onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}
        >
          <MdArrowBack className="text-2xl" />
        </button>
        <div>
          <h1
            className="text-3xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}
          >
            {isEdit ? 'MODIFIER LE TOURNOI' : 'NOUVEAU TOURNOI'}
          </h1>
          <p className="text-gray-400 mt-1">
            {isEdit ? 'Modifiez les informations du tournoi' : 'Créez un nouveau tournoi'}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div className="rounded-xl p-8" style={{ backgroundColor: '#0f1117', border: '1px solid #1e2130' }}>
        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg text-sm"
            style={{ backgroundColor: '#ff000015', border: '1px solid #f8717150', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Nom */}
          <div>
            <label className="text-gray-400 text-sm font-semibold mb-2 block">
              NOM DU TOURNOI
            </label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              placeholder=""
              className="w-full rounded-lg px-4 py-3 focus:outline-none transition placeholder-gray-600"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = '1px solid #00d4ff'}
              onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-gray-400 text-sm font-semibold mb-2 block">
              DESCRIPTION
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description du tournoi..."
              className="w-full rounded-lg px-4 py-3 focus:outline-none transition placeholder-gray-600 resize-none"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = '1px solid #00d4ff'}
              onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-semibold mb-2 block">
                DATE DE DÉBUT
              </label>
              <input
                type="date"
                name="dateDebut"
                value={form.dateDebut}
                onChange={handleChange}
                required
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = '1px solid #00d4ff'}
                onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-semibold mb-2 block">
                DATE DE FIN
              </label>
              <input
                type="date"
                name="dateFin"
                value={form.dateFin}
                onChange={handleChange}
                required
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = '1px solid #00d4ff'}
                onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
              />
            </div>
          </div>

          {/* Nb Groupes + Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm font-semibold mb-2 block">
                NOMBRE DE GROUPES
              </label>
              <input
                type="number"
                name="nbGroupes"
                value={form.nbGroupes}
                onChange={handleChange}
                required
                min={1}
                placeholder=""
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition placeholder-gray-600"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = '1px solid #00d4ff'}
                onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm font-semibold mb-2 block">
                STATUT
              </label>
              <select
                name="statut"
                value={form.statut}
                onChange={handleChange}
                className="w-full rounded-lg px-4 py-3 focus:outline-none transition"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = '1px solid #00d4ff'}
                onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
              >
                <option value="EN_COURS">EN COURS</option>
                <option value="TERMINE">TERMINÉ</option>
              </select>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 mt-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex-1 font-bold py-3 rounded-lg transition"
              style={{ border: '1px solid #1e2130', color: '#9ca3af' }}
              onMouseEnter={e => {
                e.currentTarget.style.border = '1px solid #9ca3af';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.border = '1px solid #1e2130';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              ANNULER
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-lg transition"
              style={{ backgroundColor: '#00d4ff', color: '#000' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00bfea'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00d4ff'}
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