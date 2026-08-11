import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdSave } from 'react-icons/md';
import { IoTrophyOutline } from 'react-icons/io5';
import { TbTournament } from 'react-icons/tb';
import api from '../../api/axios';

// Utilitaire : dateDebut + 1 jour
const getMinDateFin = (dateDebut) => {
  if (!dateDebut) return '';
  const d = new Date(dateDebut);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

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
    type: 'COUPE',
    saison: '',
    typeMatch: 'ALLER_RETOUR',
  });

  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      api.get(`/tournois/${id}`)
        .then(res => setForm(prev => ({ ...prev, ...res.data })))
        .catch(err => console.error('Erreur chargement', err));
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Si dateDebut change et dateFin devient invalide, reset dateFin
    if (name === 'dateDebut' && form.dateFin && value >= form.dateFin) {
      setForm(prev => ({ ...prev, dateDebut: value, dateFin: '' }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTypeChange = (type) => {
    setForm(prev => ({
      ...prev,
      type,
      nbGroupes: '',
      saison: '',
      typeMatch: 'ALLER_RETOUR',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation dates
    if (form.dateFin <= form.dateDebut) {
      setError('La date de fin doit être strictement après la date de début.');
      return;
    }

    const debut = new Date(form.dateDebut);
    const fin = new Date(form.dateFin);
    const diffJours = (fin - debut) / (1000 * 60 * 60 * 24);

    // Validation durée selon type
    if (form.type === 'LIGUE') {
      const minJours = form.typeMatch === 'ALLER_RETOUR' ? 300 : 150;
      const minLabel = form.typeMatch === 'ALLER_RETOUR'
        ? '300 jours (≈ 10 mois), comme la Premier League'
        : '150 jours (≈ 5 mois)';

      if (diffJours < minJours) {
        setError(`Une ligue ${form.typeMatch === 'ALLER_RETOUR' ? 'aller-retour' : 'aller simple'} nécessite au minimum ${minLabel}.`);
        return;
      }
    }

    if (form.type === 'COUPE' && diffJours < 7) {
      setError('Une coupe nécessite au minimum 7 jours.');
      return;
    }

    try {
      const payload = { ...form };
      if (form.type === 'LIGUE') {
        delete payload.nbGroupes;
      } else {
        delete payload.saison;
        delete payload.typeMatch;
      }
      if (isEdit) {
        await api.put(`/tournois/${id}`, payload);
      } else {
        await api.post('/tournois', payload);
      }
      navigate('/tournois');
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

  const isCOUPE = form.type === 'COUPE';
  const isLIGUE = form.type === 'LIGUE';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/tournois')}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.1)'; e.currentTarget.style.color = '#00d4ff'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
        >
          <MdArrowBack className="text-xl" />
        </button>
        <div>
          <h1
            className="text-3xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}
          >
            {isEdit ? 'MODIFIER LE TOURNOI' : 'NOUVEAU TOURNOI'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isEdit ? 'Modifiez les informations du tournoi' : 'Créez un nouveau tournoi'}
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

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* ── Type : COUPE ou LIGUE ── */}
          {!isEdit && (
            <div>
              <label className="text-gray-400 text-xs font-bold tracking-widest mb-3 block">
                TYPE DE COMPÉTITION
              </label>
              <div className="grid grid-cols-2 gap-3">

                {/* COUPE */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('COUPE')}
                  className="flex flex-col items-center gap-2 py-5 rounded-xl transition"
                  style={{
                    backgroundColor: isCOUPE ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border: isCOUPE ? '2px solid #00d4ff' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <IoTrophyOutline size={28} style={{ color: isCOUPE ? '#00d4ff' : '#4b5563' }} />
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: isCOUPE ? '#00d4ff' : '#6b7280' }}>COUPE</p>
                    <p className="text-xs mt-0.5" style={{ color: isCOUPE ? '#6b7280' : '#374151' }}>Groupes + Phase finale</p>
                  </div>
                </button>

                {/* LIGUE */}
                <button
                  type="button"
                  onClick={() => handleTypeChange('LIGUE')}
                  className="flex flex-col items-center gap-2 py-5 rounded-xl transition"
                  style={{
                    backgroundColor: isLIGUE ? 'rgba(168,85,247,0.08)' : 'rgba(255,255,255,0.03)',
                    border: isLIGUE ? '2px solid #a855f7' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <TbTournament size={28} style={{ color: isLIGUE ? '#a855f7' : '#4b5563' }} />
                  <div className="text-center">
                    <p className="font-bold text-sm" style={{ color: isLIGUE ? '#a855f7' : '#6b7280' }}>LIGUE</p>
                    <p className="text-xs mt-0.5" style={{ color: isLIGUE ? '#6b7280' : '#374151' }}>Tous contre tous</p>
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* ── Nom ── */}
          <div>
            <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
              NOM {isCOUPE ? 'DU TOURNOI' : 'DE LA LIGUE'}
            </label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = `1px solid ${isCOUPE ? '#00d4ff' : '#a855f7'}`}
              onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
            />
          </div>

          {/* ── Description ── */}
          <div>
            <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
              DESCRIPTION
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              placeholder="Description..."
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition resize-none placeholder-gray-700"
              style={inputStyle}
              onFocus={e => e.currentTarget.style.border = `1px solid ${isCOUPE ? '#00d4ff' : '#a855f7'}`}
              onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
            />
          </div>

          {/* ── Dates ── */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
                DATE DE DÉBUT
              </label>
              <input
                type="date"
                name="dateDebut"
                value={form.dateDebut}
                onChange={handleChange}
                required
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = `1px solid ${isCOUPE ? '#00d4ff' : '#a855f7'}`}
                onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
              />
            </div>
            <div>
              <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
                DATE DE FIN
                {isLIGUE && form.typeMatch === 'ALLER_RETOUR' && (
                  <span className="ml-2 text-purple-400 normal-case font-normal tracking-normal">
                    (min ~10 mois)
                  </span>
                )}
                {isLIGUE && form.typeMatch === 'ALLER_SIMPLE' && (
                  <span className="ml-2 text-purple-400 normal-case font-normal tracking-normal">
                    (min ~5 mois)
                  </span>
                )}
                {isCOUPE && (
                  <span className="ml-2 text-cyan-400 normal-case font-normal tracking-normal">
                    (min 7 jours)
                  </span>
                )}
              </label>
              <input
                type="date"
                name="dateFin"
                value={form.dateFin}
                onChange={handleChange}
                required
                min={getMinDateFin(form.dateDebut)}
                className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                style={inputStyle}
                onFocus={e => e.currentTarget.style.border = `1px solid ${isCOUPE ? '#00d4ff' : '#a855f7'}`}
                onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
              />
            </div>
          </div>

          {/* ── Champs spécifiques COUPE ── */}
          {isCOUPE && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
                  NOMBRE DE GROUPES
                </label>
                <input
                  type="number"
                  name="nbGroupes"
                  value={form.nbGroupes}
                  onChange={handleChange}
                  required
                  min={1}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.border = '1px solid #00d4ff'}
                  onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
                  STATUT
                </label>
                <select
                  name="statut"
                  value={form.statut}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.border = '1px solid #00d4ff'}
                  onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
                >
                  <option value="EN_COURS">EN COURS</option>
                  <option value="TERMINE">TERMINÉ</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Champs spécifiques LIGUE ── */}
          {isLIGUE && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
                  SAISON
                </label>
                <input
                  type="text"
                  name="saison"
                  value={form.saison}
                  onChange={handleChange}
                  required
                  placeholder="Ex: 2025-2026"
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition placeholder-gray-700"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.border = '1px solid #a855f7'}
                  onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
                />
              </div>
              <div>
                <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
                  TYPE DE MATCH
                </label>
                <select
                  name="typeMatch"
                  value={form.typeMatch}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.border = '1px solid #a855f7'}
                  onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
                >
                  <option value="ALLER_SIMPLE">ALLER SIMPLE</option>
                  <option value="ALLER_RETOUR">ALLER-RETOUR</option>
                </select>
              </div>

              {/* Statut pour Ligue */}
              <div className="col-span-2">
                <label className="text-gray-400 text-xs font-bold tracking-widest mb-2 block">
                  STATUT
                </label>
                <select
                  name="statut"
                  value={form.statut}
                  onChange={handleChange}
                  className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition"
                  style={inputStyle}
                  onFocus={e => e.currentTarget.style.border = '1px solid #a855f7'}
                  onBlur={e => e.currentTarget.style.border = '1px solid #1e2130'}
                >
                  <option value="EN_COURS">EN COURS</option>
                  <option value="TERMINE">TERMINÉ</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Boutons ── */}
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => navigate('/tournois')}
              className="flex-1 font-bold py-3 rounded-xl transition text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            >
              ANNULER
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 font-bold py-3 rounded-xl transition text-sm"
              style={{ backgroundColor: isCOUPE ? '#00d4ff' : '#a855f7', color: isCOUPE ? '#000' : '#fff' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = isCOUPE ? '#00bfea' : '#9333ea'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = isCOUPE ? '#00d4ff' : '#a855f7'}
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