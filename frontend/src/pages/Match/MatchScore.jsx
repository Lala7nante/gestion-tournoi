import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  MdArrowBack, MdSave, MdSportsSoccer, MdDelete, MdAdd
} from 'react-icons/md';
import { GiSoccerBall, GiSoccerKick } from 'react-icons/gi';
import api from '../../api/axios';

const StatRow = ({ label, nameDom, nameExt, valueDom, valueExt, onChange }) => (
  <div className="grid grid-cols-[1fr_180px_1fr] gap-3 items-center">
    <input
      type="number" name={nameDom} min="0" value={valueDom} onChange={onChange}
      className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-3 py-2 text-center focus:outline-none focus:border-cyan-400 transition"
    />
    <div className="text-center text-cyan-400 text-xs font-semibold tracking-widest">{label}</div>
    <input
      type="number" name={nameExt} min="0" value={valueExt} onChange={onChange}
      className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-3 py-2 text-center focus:outline-none focus:border-cyan-400 transition"
    />
  </div>
);

export default function MatchScore() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [match, setMatch] = useState(null);
  const [error, setError] = useState('');
  const [prolongation, setProlongation] = useState(false);
  const [penalty, setPenalty] = useState(false);

  const [buts, setButs] = useState([]);
  const [joueursDom, setJoueursDom] = useState([]);
  const [joueursExt, setJoueursExt] = useState([]);
  const [newBut, setNewBut] = useState({
    buteurId: '',
    passeurId: '',
    minute: '',
    type: 'NORMAL',
    equipe: 'dom',
  });

  const [form, setForm] = useState({
    scoreDom: 0, scoreExt: 0,
    tirsDomicile: 0, tirsExterieur: 0,
    tirsCadresDomicile: 0, tirsCadresExterieur: 0,
    possessionDomicile: 50, possessionExterieur: 50,
    fautesDomicile: 0, fautesExterieur: 0,
    cartonsJaunesDomicile: 0, cartonsJaunesExterieur: 0,
    cartonsRougesDomicile: 0, cartonsRougesExterieur: 0,
    cornersDomicile: 0, cornersExterieur: 0,
    horsJeuDomicile: 0, horsJeuExterieur: 0,
    scoreProlDom: 0, scoreProlExt: 0,
    scorePenDom: 0, scorePenExt: 0,
  });

  useEffect(() => {
    api.get(`/matchs/${id}`)
      .then(res => setMatch(res.data))
      .catch(() => setError('Impossible de charger le match.'));
  }, [id]);

  useEffect(() => {
    if (!match) return;
    const domId = match.equipeDomicile?.id;
    const extId = match.equipeExterieur?.id;
    if (domId) api.get(`/equipes/${domId}/joueurs`).then(r => setJoueursDom(r.data));
    if (extId) api.get(`/equipes/${extId}/joueurs`).then(r => setJoueursExt(r.data));
    api.get(`/matchs/${id}/buts`).then(r => setButs(Array.isArray(r.data) ? r.data : []));
  }, [match]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const val = Number(value);
    if (name === 'possessionDomicile') {
      const clamped = Math.min(100, Math.max(0, val));
      setForm(f => ({ ...f, possessionDomicile: clamped, possessionExterieur: 100 - clamped }));
      return;
    }
    if (name === 'possessionExterieur') {
      const clamped = Math.min(100, Math.max(0, val));
      setForm(f => ({ ...f, possessionExterieur: clamped, possessionDomicile: 100 - clamped }));
      return;
    }
    setForm(f => ({ ...f, [name]: val }));
  };

  const handleAddBut = async () => {
    if (!newBut.buteurId || !newBut.minute) return;
    try {
      const res = await api.post(`/matchs/${id}/buts`, {
        buteurId: newBut.buteurId,
        passeurId: newBut.passeurId || null,
        minute: newBut.minute,
        type: newBut.type,
      });
      setButs(prev => [...prev, res.data]);
      setNewBut({ buteurId: '', passeurId: '', minute: '', type: 'NORMAL', equipe: newBut.equipe });
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Erreur lors de l\'ajout du but.');
    }
  };

  const handleDeleteBut = async (butId) => {
    await api.delete(`/buts/${butId}`);
    setButs(prev => prev.filter(b => b.id !== butId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.put(`/matchs/${id}/score`, {
        ...form,
        prolongation,
        penalty: prolongation ? penalty : false,
      });
      navigate('/matchs');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Une erreur est survenue.');
    }
  };

  if (!match) {
    return <div className="flex items-center justify-center py-20 text-gray-500">Chargement...</div>;
  }

  const isKnockout = match.phase !== 'GROUPE';
  const domNom = match.equipeDomicile?.nom || '?';
  const extNom = match.equipeExterieur?.nom || '?';
  const joueursCourants = newBut.equipe === 'dom' ? joueursDom : joueursExt;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate('/matchs')} className="text-gray-400 hover:text-cyan-400 transition">
          <MdArrowBack className="text-2xl" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-cyan-400 flex items-center gap-2">
            <MdSportsSoccer className="text-2xl" />
            ENREGISTRER SCORE
          </h1>
          <p className="text-gray-400 mt-1">Saisissez le résultat du match</p>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-8">

        <h2 className="text-center text-xl font-bold mb-6">
          <span className="text-white">{domNom}</span>
          <span className="text-gray-600 mx-4">vs</span>
          <span className="text-white">{extNom}</span>
        </h2>

        {error && (
          <div className="mb-6 bg-red-400/10 border border-red-400/30 text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

          {/* SCORE 90 MIN */}
          <section>
            <h3 className="text-gray-500 text-xs font-semibold tracking-widest mb-3">SCORE 90 MIN</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm mb-1 block">{domNom}</label>
                <input
                  type="number" name="scoreDom" min="0" value={form.scoreDom} onChange={handleChange}
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
              <div>
                <label className="text-gray-400 text-sm mb-1 block">{extNom}</label>
                <input
                  type="number" name="scoreExt" min="0" value={form.scoreExt} onChange={handleChange}
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-lg px-4 py-3 text-center text-2xl font-bold focus:outline-none focus:border-cyan-400 transition"
                />
              </div>
            </div>
          </section>

          {/* BUTS */}
          <section className="border border-gray-800 rounded-xl p-5">
            <h3 className="text-cyan-400 text-xs font-semibold tracking-widest mb-4 flex items-center gap-2">
              <GiSoccerBall className="text-base" />
              BUTS
            </h3>

            {buts.length > 0 && (
              <div className="flex flex-col gap-2 mb-4">
                {buts.map(b => (
                  <div key={b.id}
                    className="flex items-center gap-3 bg-[#111] border border-gray-800 rounded-lg px-4 py-2 text-sm">
                    <span className="text-gray-500 w-8 text-center font-mono">{b.minute}'</span>
                    <GiSoccerBall className="text-cyan-400 text-base shrink-0" />
                    <span className="text-white font-semibold flex-1">
                      {b.buteur?.prenom} {b.buteur?.nom}
                    </span>
                    {b.passeur && (
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        <GiSoccerKick className="text-purple-400 text-base" />
                        {b.passeur?.prenom} {b.passeur?.nom}
                      </span>
                    )}
                    <span className={`text-xs font-bold px-2 py-1 rounded shrink-0 ${
                      b.type === 'CSC' ? 'text-red-400 bg-red-400/10' :
                      b.type === 'PENALTY' ? 'text-yellow-400 bg-yellow-400/10' :
                      'text-cyan-400 bg-cyan-400/10'
                    }`}>
                      {b.type}
                    </span>
                    <button type="button" onClick={() => handleDeleteBut(b.id)}
                      className="text-red-400 hover:text-red-300 transition shrink-0">
                      <MdDelete className="text-base" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-3">

              {/* Équipe selector */}
              <div className="grid grid-cols-2 gap-2">
                <button type="button"
                  onClick={() => setNewBut(f => ({ ...f, equipe: 'dom', buteurId: '', passeurId: '' }))}
                  className={`py-2 rounded-lg text-sm font-bold border transition ${
                    newBut.equipe === 'dom'
                      ? 'bg-cyan-400 text-black border-cyan-400'
                      : 'border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
                  }`}>
                  {domNom}
                </button>
                <button type="button"
                  onClick={() => setNewBut(f => ({ ...f, equipe: 'ext', buteurId: '', passeurId: '' }))}
                  className={`py-2 rounded-lg text-sm font-bold border transition ${
                    newBut.equipe === 'ext'
                      ? 'bg-purple-400 text-black border-purple-400'
                      : 'border-gray-700 text-gray-400 hover:border-purple-400 hover:text-purple-400'
                  }`}>
                  {extNom}
                </button>
              </div>

              {/* Minute + Type */}
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number" placeholder="Minute" min="1" max="120"
                  value={newBut.minute}
                  onChange={e => setNewBut(f => ({ ...f, minute: e.target.value }))}
                  className="bg-[#111] border border-gray-700 text-white rounded-lg px-3 py-2 text-center focus:outline-none focus:border-cyan-400 transition"
                />
                <select value={newBut.type}
                  onChange={e => setNewBut(f => ({ ...f, type: e.target.value }))}
                  className="bg-[#111] border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400 transition">
                  <option value="NORMAL">Normal</option>
                  <option value="PENALTY">Penalty</option>
                  <option value="CSC">CSC</option>
                </select>
              </div>

              {/* Buteur */}
              <div className="relative">
                <GiSoccerBall className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-base pointer-events-none" />
                <select value={newBut.buteurId}
                  onChange={e => setNewBut(f => ({ ...f, buteurId: e.target.value }))}
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-cyan-400 transition">
                  <option value="">Choisir buteur...</option>
                  {joueursCourants.map(j => (
                    <option key={`buteur-${j.id}`} value={j.id}>
                      #{j.numero} {j.prenom} {j.nom} — {j.poste}
                    </option>
                  ))}
                </select>
              </div>

              {/* Passeur */}
              <div className="relative">
                <GiSoccerKick className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 text-base pointer-events-none" />
                <select value={newBut.passeurId}
                  onChange={e => setNewBut(f => ({ ...f, passeurId: e.target.value }))}
                  className="w-full bg-[#111] border border-gray-700 text-white rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-purple-400 transition">
                  <option value="">Choisir passeur (optionnel)...</option>
                  {joueursCourants.map(j => (
                    <option key={`passeur-${j.id}`} value={j.id}>
                      #{j.numero} {j.prenom} {j.nom}
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" onClick={handleAddBut}
                disabled={!newBut.buteurId || !newBut.minute}
                className="w-full flex items-center justify-center gap-2 bg-cyan-400/10 border border-cyan-400/30 text-cyan-400 font-bold py-2 rounded-lg hover:bg-cyan-400/20 transition disabled:opacity-30 disabled:cursor-not-allowed">
                <MdAdd className="text-lg" />
                AJOUTER BUT
              </button>
            </div>
          </section>

          {/* STATISTIQUES */}
          <section>
            <h3 className="text-cyan-400 text-xs font-semibold tracking-widest mb-4">STATISTIQUES DU MATCH</h3>
            <div className="grid grid-cols-[1fr_180px_1fr] gap-3 mb-2 text-center text-xs text-gray-500 font-semibold">
              <div>{domNom}</div>
              <div></div>
              <div>{extNom}</div>
            </div>
            <div className="flex flex-col gap-3">
              <StatRow label="Tirs" nameDom="tirsDomicile" nameExt="tirsExterieur"
                valueDom={form.tirsDomicile} valueExt={form.tirsExterieur} onChange={handleChange} />
              <StatRow label="Tirs Cadrés" nameDom="tirsCadresDomicile" nameExt="tirsCadresExterieur"
                valueDom={form.tirsCadresDomicile} valueExt={form.tirsCadresExterieur} onChange={handleChange} />

              <div className="grid grid-cols-[1fr_180px_1fr] gap-3 items-center">
                <div className="relative">
                  <input type="number" name="possessionDomicile" min="0" max="100"
                    value={form.possessionDomicile} onChange={handleChange}
                    className="w-full bg-[#111] border border-cyan-400/40 text-white rounded-lg px-3 py-2 text-center focus:outline-none focus:border-cyan-400 transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-400 text-xs font-bold">%</span>
                </div>
                <div className="text-center">
                  <div className="text-cyan-400 text-xs font-semibold tracking-widest mb-2">Possession</div>
                  <div className="h-2 rounded-full overflow-hidden bg-gray-800 flex">
                    <div className="bg-cyan-400 transition-all duration-300" style={{ width: `${form.possessionDomicile}%` }} />
                    <div className="bg-purple-400 transition-all duration-300" style={{ width: `${form.possessionExterieur}%` }} />
                  </div>
                </div>
                <div className="relative">
                  <input type="number" name="possessionExterieur" min="0" max="100"
                    value={form.possessionExterieur} onChange={handleChange}
                    className="w-full bg-[#111] border border-purple-400/40 text-white rounded-lg px-3 py-2 text-center focus:outline-none focus:border-purple-400 transition"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 text-xs font-bold">%</span>
                </div>
              </div>

              <StatRow label="Fautes" nameDom="fautesDomicile" nameExt="fautesExterieur"
                valueDom={form.fautesDomicile} valueExt={form.fautesExterieur} onChange={handleChange} />
              <StatRow label="Cartons Jaunes" nameDom="cartonsJaunesDomicile" nameExt="cartonsJaunesExterieur"
                valueDom={form.cartonsJaunesDomicile} valueExt={form.cartonsJaunesExterieur} onChange={handleChange} />
              <StatRow label="Cartons Rouges" nameDom="cartonsRougesDomicile" nameExt="cartonsRougesExterieur"
                valueDom={form.cartonsRougesDomicile} valueExt={form.cartonsRougesExterieur} onChange={handleChange} />
              <StatRow label="Corners" nameDom="cornersDomicile" nameExt="cornersExterieur"
                valueDom={form.cornersDomicile} valueExt={form.cornersExterieur} onChange={handleChange} />
              <StatRow label="Hors-Jeu" nameDom="horsJeuDomicile" nameExt="horsJeuExterieur"
                valueDom={form.horsJeuDomicile} valueExt={form.horsJeuExterieur} onChange={handleChange} />
            </div>
          </section>

          {/* PROLONGATION */}
          {isKnockout && (
            <section className="border border-yellow-400/20 rounded-xl p-5">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input type="checkbox" checked={prolongation}
                  onChange={e => { setProlongation(e.target.checked); if (!e.target.checked) setPenalty(false); }}
                  className="w-4 h-4 accent-yellow-400"
                />
                <span className="text-yellow-400 font-semibold text-sm tracking-widest">PROLONGATION ?</span>
              </label>

              {prolongation && (
                <div className="flex flex-col gap-4">
                  <h4 className="text-yellow-400 text-xs tracking-widest font-semibold">SCORE PROLONGATION</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">{domNom}</label>
                      <input type="number" name="scoreProlDom" min="0" value={form.scoreProlDom} onChange={handleChange}
                        className="w-full bg-[#111] border border-yellow-400/30 text-white rounded-lg px-4 py-3 text-center text-xl font-bold focus:outline-none focus:border-yellow-400 transition"
                      />
                    </div>
                    <div>
                      <label className="text-gray-400 text-sm mb-1 block">{extNom}</label>
                      <input type="number" name="scoreProlExt" min="0" value={form.scoreProlExt} onChange={handleChange}
                        className="w-full bg-[#111] border border-yellow-400/30 text-white rounded-lg px-4 py-3 text-center text-xl font-bold focus:outline-none focus:border-yellow-400 transition"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer mt-2">
                    <input type="checkbox" checked={penalty}
                      onChange={e => setPenalty(e.target.checked)}
                      className="w-4 h-4 accent-red-400"
                    />
                    <span className="text-red-400 font-semibold text-sm tracking-widest">PENALTY ?</span>
                  </label>

                  {penalty && (
                    <div className="flex flex-col gap-3">
                      <h4 className="text-red-400 text-xs tracking-widest font-semibold">SCORE PENALTY</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-gray-400 text-sm mb-1 block">{domNom}</label>
                          <input type="number" name="scorePenDom" min="0" value={form.scorePenDom} onChange={handleChange}
                            className="w-full bg-[#111] border border-red-400/30 text-white rounded-lg px-4 py-3 text-center text-xl font-bold focus:outline-none focus:border-red-400 transition"
                          />
                        </div>
                        <div>
                          <label className="text-gray-400 text-sm mb-1 block">{extNom}</label>
                          <input type="number" name="scorePenExt" min="0" value={form.scorePenExt} onChange={handleChange}
                            className="w-full bg-[#111] border border-red-400/30 text-white rounded-lg px-4 py-3 text-center text-xl font-bold focus:outline-none focus:border-red-400 transition"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          )}

          {/* Boutons */}
          <div className="flex gap-4 mt-2">
            <button type="button" onClick={() => navigate('/matchs')}
              className="flex-1 border border-gray-700 text-gray-400 font-bold py-3 rounded-lg hover:border-gray-500 hover:text-white transition">
              ANNULER
            </button>
            <button type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-cyan-400 text-black font-bold py-3 rounded-lg hover:bg-cyan-300 transition">
              <MdSave className="text-xl" />
              CONFIRMER
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}