import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdArrowBack, MdSave, MdClose } from 'react-icons/md';
import api from '../../api/axios';

export default function MatchForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState({
    domId: '',
    extId: '',
    dateMatch: '',
    lieu: '',
    phase: 'GROUPE',
    statut: 'PREVU',
  });

  const [allEquipes, setAllEquipes] = useState([]);
  const [searchDom, setSearchDom] = useState('');
  const [searchExt, setSearchExt] = useState('');
  const [showDomList, setShowDomList] = useState(false);
  const [showExtList, setShowExtList] = useState(false);
  const [selectedDom, setSelectedDom] = useState(null);
  const [selectedExt, setSelectedExt] = useState(null);
  const [error, setError] = useState('');

  const domRef = useRef(null);
  const extRef = useRef(null);

  useEffect(() => {
    api.get('/tournois')
      .then(tRes => {
        const tournoiId = tRes.data[0]?.id;
        if (!tournoiId) return Promise.reject('Aucun tournoi trouvé');
        return api.get(`/tournois/${tournoiId}/groupes`);
      })
      .then(gRes => {
        const groupes = gRes.data;
        const promises = groupes.map(g =>
          api.get(`/groupes/${g.id}/equipes`).then(eRes =>
            eRes.data.map(e => ({
              ...e,
              groupeNom: g.nom,
              groupeId: g.id,
            }))
          )
        );
        return Promise.all(promises);
      })
      .then(results => {
        setAllEquipes(results.flat());
      })
      .catch(err => console.error('Erreur chargement equipes', err));

    if (isEdit) {
      api.get(`/matchs/${id}`)
        .then(res => {
          const m = res.data;
          setForm({
            domId: m.equipeDomicile?.id || '',
            extId: m.equipeExterieur?.id || '',
            dateMatch: m.dateMatch || '',
            lieu: m.lieu || '',
            phase: m.phase || 'GROUPE',
            statut: m.statut || 'PREVU',
          });
          setSelectedDom(m.equipeDomicile || null);
          setSelectedExt(m.equipeExterieur || null);
          setSearchDom(m.equipeDomicile?.nom || '');
          setSearchExt(m.equipeExterieur?.nom || '');
        })
        .catch(err => console.error('Erreur chargement match', err));
    }
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (domRef.current && !domRef.current.contains(e.target)) setShowDomList(false);
      if (extRef.current && !extRef.current.contains(e.target)) setShowExtList(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDom = allEquipes.filter(e =>
    e.nom.toLowerCase().includes(searchDom.toLowerCase()) && e.id !== form.extId
  );

  const filteredExt = allEquipes.filter(e =>
    e.nom.toLowerCase().includes(searchExt.toLowerCase()) && e.id !== form.domId
  );

  const selectDom = (equipe) => {
    setSelectedDom(equipe);
    setForm(f => ({ ...f, domId: equipe.id }));
    setSearchDom(equipe.nom);
    setShowDomList(false);
  };

  const selectExt = (equipe) => {
    setSelectedExt(equipe);
    setForm(f => ({ ...f, extId: equipe.id }));
    setSearchExt(equipe.nom);
    setShowExtList(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.domId || !form.extId) {
      setError('Veuillez sélectionner les deux équipes.');
      return;
    }

    if (!form.dateMatch) {
      setError('Veuillez saisir la date du match.');
      return;
    }

    try {
      if (isEdit) {
        await api.put(`/matchs/${id}`, {
          dateMatch: form.dateMatch,
          lieu: form.lieu || null,
          phase: form.phase,
          statut: form.statut,
        });
      } else {
        await api.post('/matchs', {
          domId: form.domId,
          extId: form.extId,
          dateMatch: form.dateMatch,
          lieu: form.lieu || null,
          phase: form.phase,
          statut: form.statut,
        });
      }
      navigate('/matchs');
    } catch (err) {
      setError(err.response?.data || 'Une erreur est survenue. Vérifiez les données.');
    }
  };

  const inputClass =
    'w-full bg-transparent border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-400 transition';
  const labelClass = 'text-gray-400 text-sm font-semibold mb-2 block tracking-wider';

  const DropdownList = ({ items, onSelect }) => (
    <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-gray-700 rounded-lg max-h-48 overflow-y-auto shadow-lg">
      {items.map(e => (
        <div
          key={e.id}
          onMouseDown={() => onSelect(e)}
          className="px-4 py-2 cursor-pointer hover:bg-cyan-400/10 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-white group-hover:text-cyan-400 transition">
              {e.nom}
            </span>
            {e.ville && (
              <span className="text-gray-400 text-xs group-hover:text-cyan-300 transition">
                {e.ville}
              </span>
            )}
          </div>
          {e.groupeNom && (
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-400/10 text-cyan-400 shrink-0">
              Groupe {e.groupeNom}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  const EmptyList = () => (
    <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-gray-400 text-sm shadow-lg">
      Aucune équipe trouvée
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => navigate('/matchs')}
          className="text-gray-400 hover:text-cyan-400 transition p-1"
        >
          <MdArrowBack size={24} />
        </button>
        <div>
          <h1
            className="text-3xl font-bold"
            style={{
              background: 'linear-gradient(90deg, #22d3ee, #06b6d4, #0891b2)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isEdit ? 'MODIFIER LE MATCH' : 'NOUVEAU MATCH'}
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isEdit ? 'Modifiez les informations du match' : 'Créez un nouveau match'}
          </p>
        </div>
      </div>

      {/* Card */}
      <div className="bg-transparent border border-gray-800 rounded-xl p-8">

        {error && (
          <div className="mb-6 bg-red-400/10 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <MdClose size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* Equipes */}
          <div className="grid grid-cols-2 gap-4">

            {/* Domicile */}
            <div ref={domRef} className="relative">
              <label className={labelClass}>ÉQUIPE DOMICILE</label>
              <input
                type="text"
                value={searchDom}
                onChange={e => {
                  setSearchDom(e.target.value);
                  setShowDomList(true);
                  if (selectedDom) {
                    setSelectedDom(null);
                    setForm(f => ({ ...f, domId: '' }));
                  }
                }}
                onFocus={() => !isEdit && setShowDomList(true)}
                disabled={isEdit}
                className={inputClass}
              />
              {selectedDom && (
                <div className="mt-1 text-xs text-cyan-400 flex items-center gap-1">
                  <MdSave size={12} />
                  {selectedDom.nom}
                  {selectedDom.groupeNom && ` — Groupe ${selectedDom.groupeNom}`}
                  {selectedDom.ville && ` — ${selectedDom.ville}`}
                </div>
              )}
              {showDomList && !isEdit && filteredDom.length > 0 && (
                <DropdownList items={filteredDom} onSelect={selectDom} />
              )}
              {showDomList && !isEdit && filteredDom.length === 0 && searchDom && (
                <EmptyList />
              )}
            </div>

            {/* Extérieur */}
            <div ref={extRef} className="relative">
              <label className={labelClass}>ÉQUIPE EXTÉRIEUR</label>
              <input
                type="text"
                value={searchExt}
                onChange={e => {
                  setSearchExt(e.target.value);
                  setShowExtList(true);
                  if (selectedExt) {
                    setSelectedExt(null);
                    setForm(f => ({ ...f, extId: '' }));
                  }
                }}
                onFocus={() => !isEdit && setShowExtList(true)}
                disabled={isEdit}
                className={inputClass}
              />
              {selectedExt && (
                <div className="mt-1 text-xs text-cyan-400 flex items-center gap-1">
                  <MdSave size={12} />
                  {selectedExt.nom}
                  {selectedExt.groupeNom && ` — Groupe ${selectedExt.groupeNom}`}
                  {selectedExt.ville && ` — ${selectedExt.ville}`}
                </div>
              )}
              {showExtList && !isEdit && filteredExt.length > 0 && (
                <DropdownList items={filteredExt} onSelect={selectExt} />
              )}
              {showExtList && !isEdit && filteredExt.length === 0 && searchExt && (
                <EmptyList />
              )}
            </div>

          </div>

          {/* Date + Lieu */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>
                DATE DU MATCH <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                name="dateMatch"
                value={form.dateMatch}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>LIEU</label>
              <input
                type="text"
                name="lieu"
                value={form.lieu}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Phase + Statut */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>PHASE</label>
              <select name="phase" value={form.phase} onChange={handleChange} className={inputClass}>
                <option value="GROUPE">Phase de Groupes</option>
                <option value="ROUND_16">Huitièmes de Finale</option>
                <option value="QUART">Quarts de Finale</option>
                <option value="DEMI">Demi-Finale</option>
                <option value="TROISIEME">Match pour la 3ème Place</option>
                <option value="FINALE">Finale</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>STATUT</label>
              <select name="statut" value={form.statut} onChange={handleChange} className={inputClass}>
                <option value="PREVU">PRÉVU</option>
                <option value="TERMINE">TERMINÉ</option>
              </select>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              onClick={() => navigate('/matchs')}
              className="flex-1 flex items-center justify-center gap-2 border border-gray-700 text-gray-400 font-bold py-3 rounded-lg hover:border-gray-500 hover:text-white transition"
            >
              <MdClose size={18} />
              ANNULER
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 rounded-lg hover:bg-cyan-300 active:scale-95 transition"
            >
              <MdSave size={18} />
              {isEdit ? 'MODIFIER' : 'CRÉER'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}