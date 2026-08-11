import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAdd, MdEdit, MdDelete,
  MdCalendarToday, MdLocationOn, MdSportsSoccer, MdSearch,
  MdShuffleOn, MdCheckCircle, MdTableChart
} from 'react-icons/md';
import { TbTournament } from 'react-icons/tb';
import api from '../../api/axios';

const PHASES_COUPE = [
  { value: '',          label: 'Tous' },
  { value: 'GROUPE',    label: 'Groupes' },
  { value: 'QUART',     label: 'Quarts' },
  { value: 'DEMI',      label: 'Demi-Finale' },
  { value: 'TROISIEME', label: '3ème Place' },
  { value: 'FINALE',    label: 'Finale' },
];

export default function MatchList() {
  const [activeMode, setActiveMode] = useState('COUPE'); // 'COUPE' | 'LIGUE'
  const [matchs, setMatchs] = useState([]);
  const [butsMap, setButsMap] = useState({});
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
  const [journeeFilter, setJourneeFilter] = useState('');
  const [tournois, setTournois] = useState([]);
  const [selectedLigue, setSelectedLigue] = useState('');
  const [classement, setClassement] = useState([]);
  const [showClassement, setShowClassement] = useState(false);

  // Coupe states
  const [tiragePret, setTiragePret] = useState(false);
  const [quartExiste, setQuartExiste] = useState(false);
  const [quartTermine, setQuartTermine] = useState(false);
  const [demiExiste, setDemiExiste] = useState(false);
  const [demiTermine, setDemiTermine] = useState(false);
  const [finaleExiste, setFinaleExiste] = useState(false);
  const [loadingTirage, setLoadingTirage] = useState(false);
  const [showTiragePreview, setShowTiragePreview] = useState(false);
  const [tirageData, setTirageData] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTournois();
  }, []);

  useEffect(() => {
    if (activeMode === 'COUPE') fetchMatchsCoupe();
  }, [activeMode]);

  useEffect(() => {
    if (activeMode === 'LIGUE' && selectedLigue) {
      fetchMatchsLigue(selectedLigue);
      fetchClassement(selectedLigue);
    }
  }, [activeMode, selectedLigue]);

  const fetchTournois = async () => {
    try {
      const res = await api.get('/tournois');
      const ligues = res.data.filter(t => t.type === 'LIGUE');
      setTournois(ligues);
      if (ligues.length > 0) setSelectedLigue(ligues[0].id);
    } catch (err) {
      console.error('Erreur chargement tournois', err);
    }
  };

  const fetchMatchsCoupe = async () => {
    try {
      const res = await api.get('/matchs');
      const liste = Array.isArray(res.data) ? res.data : res.data.content ?? [];
      setMatchs(liste);

      const groupeMatchs = liste.filter(m => m.phase === 'GROUPE');
      const quartMatchs  = liste.filter(m => m.phase === 'QUART');
      const demiMatchs   = liste.filter(m => m.phase === 'DEMI');

      setTiragePret(groupeMatchs.length > 0 && groupeMatchs.every(m => m.statut === 'TERMINE'));
      setQuartExiste(quartMatchs.length > 0);
      setQuartTermine(quartMatchs.length > 0 && quartMatchs.every(m => m.statut === 'TERMINE'));
      setDemiExiste(demiMatchs.length > 0);
      setDemiTermine(demiMatchs.length > 0 && demiMatchs.every(m => m.statut === 'TERMINE'));
      setFinaleExiste(liste.some(m => m.phase === 'FINALE'));

      await chargerButs(liste);
    } catch (err) {
      console.error('Erreur chargement matchs coupe', err);
    }
  };

  const fetchMatchsLigue = async (tournoiId) => {
    try {
      const res = await api.get(`/matchs/ligue/${tournoiId}`);
      setMatchs(Array.isArray(res.data) ? res.data : []);
      await chargerButs(res.data);
    } catch (err) {
      console.error('Erreur chargement matchs ligue', err);
    }
  };

  const fetchClassement = async (tournoiId) => {
    try {
      const res = await api.get(`/matchs/ligue/${tournoiId}/classement`);
      setClassement(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erreur classement', err);
    }
  };

  const chargerButs = async (liste) => {
    const termines = liste.filter(m => m.statut === 'TERMINE');
    const results = await Promise.all(
      termines.map(m =>
        api.get(`/matchs/${m.id}/buts`)
          .then(r => ({ id: m.id, buts: Array.isArray(r.data) ? r.data : [] }))
          .catch(() => ({ id: m.id, buts: [] }))
      )
    );
    const map = {};
    results.forEach(({ id, buts }) => { map[id] = buts; });
    setButsMap(map);
  };

  const genererJournees = async () => {
    if (!selectedLigue) return;
    try {
      await api.post(`/matchs/ligue/${selectedLigue}/generer`);
      fetchMatchsLigue(selectedLigue);
    } catch (err) {
      alert('Erreur génération journées: ' + (err.response?.data ?? err.message));
    }
  };

  // ── Coupe helpers (inchangés) ──────────────────────────────────────────────

  const calculerClassements = (liste) => {
    const groupes = { 'A': {}, 'B': {}, 'C': {}, 'D': {} };
    const initEq = (eq) => ({ equipe: eq, pts: 0, j: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, diff: 0 });
    liste.filter(m => m.phase === 'GROUPE' && m.statut === 'TERMINE').forEach(m => {
      const g = m.equipeDomicile?.groupe?.nom?.toString() ?? m.equipeExterieur?.groupe?.nom?.toString();
      if (!g || !groupes[g]) return;
      const idD = m.equipeDomicile?.id, idE = m.equipeExterieur?.id;
      if (!idD || !idE) return;
      if (!groupes[g][idD]) groupes[g][idD] = initEq(m.equipeDomicile);
      if (!groupes[g][idE]) groupes[g][idE] = initEq(m.equipeExterieur);
      const dom = groupes[g][idD], ext = groupes[g][idE];
      const sd = m.scoreDomicile ?? 0, se = m.scoreExterieur ?? 0;
      dom.j++; dom.bp += sd; dom.bc += se; dom.diff += (sd - se);
      ext.j++; ext.bp += se; ext.bc += sd; ext.diff += (se - sd);
      if (sd > se)      { dom.v++; dom.pts += 3; ext.d++; }
      else if (sd < se) { ext.v++; ext.pts += 3; dom.d++; }
      else              { dom.n++; dom.pts++;     ext.n++; ext.pts++; }
    });
    const classes = {};
    for (const g of Object.keys(groupes))
      classes[g] = Object.values(groupes[g]).sort((a, b) => b.pts - a.pts || b.diff - a.diff || b.bp - a.bp);
    return classes;
  };

  const preparerTirage = () => {
    const classes = calculerClassements(matchs);
    setTirageData([
      { label: 'Quart 1', descDom: '1er Groupe A', descExt: '2ème Groupe B', dom: classes['A']?.[0], ext: classes['B']?.[1] },
      { label: 'Quart 2', descDom: '1er Groupe C', descExt: '2ème Groupe D', dom: classes['C']?.[0], ext: classes['D']?.[1] },
      { label: 'Quart 3', descDom: '1er Groupe B', descExt: '2ème Groupe A', dom: classes['B']?.[0], ext: classes['A']?.[1] },
      { label: 'Quart 4', descDom: '1er Groupe D', descExt: '2ème Groupe C', dom: classes['D']?.[0], ext: classes['C']?.[1] },
    ]);
    setShowTiragePreview(true);
  };

  const confirmerTirage = async () => {
    setLoadingTirage(true);
    try {
      for (const t of tirageData) {
        if (!t.dom?.equipe?.id || !t.ext?.equipe?.id) continue;
        await api.post('/matchs', { domId: t.dom.equipe.id, extId: t.ext.equipe.id, phase: 'QUART', statut: 'PREVU' });
      }
      setShowTiragePreview(false);
      setPhaseFilter('QUART');
      fetchMatchsCoupe();
    } catch (err) {
      alert('Erreur création Quarts: ' + (err.response?.data?.message ?? err.message));
    } finally {
      setLoadingTirage(false);
    }
  };

  const genererDemi = async () => {
    try { await api.post('/matchs/phase-suivante', {}); fetchMatchsCoupe(); setPhaseFilter('DEMI'); }
    catch (err) { alert('Erreur: ' + (err.response?.data ?? err.message)); }
  };

  const genererFinale = async () => {
    try { await api.post('/matchs/phase-suivante', {}); fetchMatchsCoupe(); setPhaseFilter('FINALE'); }
    catch (err) { alert('Erreur: ' + (err.response?.data ?? err.message)); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce match ?')) return;
    try {
      await api.delete(`/matchs/${id}`);
      activeMode === 'LIGUE' ? fetchMatchsLigue(selectedLigue) : fetchMatchsCoupe();
    } catch (err) { console.error(err); }
  };

  const getStatutStyle = (s) =>
    s === 'TERMINE' ? 'bg-gray-400/10 text-gray-400' :
    s === 'PREVU'   ? 'bg-cyan-400/10 text-cyan-400' :
                      'bg-yellow-400/10 text-yellow-400';

  const getPhaseLabel = (p) => ({
    GROUPE: 'Phase de Groupes', QUART: 'Quarts de Finale',
    DEMI: 'Demi-Finale', TROISIEME: '3ème Place',
    FINALE: 'Finale', JOURNEE_LIGUE: 'Journée',
  }[p] ?? p);

  const getButeurs = (matchId, equipeId) =>
    (butsMap[matchId] ?? []).filter(b => b.buteur?.equipe?.id === equipeId);

  const getScoreFinal = (match) => {
    if (match.penalty) return { dom: match.scorePenDomicile, ext: match.scorePenExterieur, label: 'TAB', reglementaire: `${match.scoreDomicile}—${match.scoreExterieur} TR` };
    if (match.prolongation) return { dom: match.scoreProlDomicile, ext: match.scoreProlExterieur, label: 'AET', reglementaire: `${match.scoreDomicile}—${match.scoreExterieur} TR` };
    return { dom: match.scoreDomicile, ext: match.scoreExterieur, label: null, reglementaire: null };
  };

  // Journées distinctes pour filter ligue
  const journees = [...new Set(matchs.map(m => m.journee).filter(Boolean))].sort((a, b) => a - b);

  // 👈 Vérifie si TOUS les matchs d'une journée donnée sont TERMINE
  const isJourneeTerminee = (j) => {
    const matchsJournee = matchs.filter(m => m.journee === j);
    return matchsJournee.length > 0 && matchsJournee.every(m => m.statut === 'TERMINE');
  };

  const matchsFiltres = matchs.filter(m => {
    const q = search.toLowerCase();
    const nomDom = m.equipeDomicile?.nom?.toLowerCase() ?? '';
    const nomExt = m.equipeExterieur?.nom?.toLowerCase() ?? '';
    const matchSearch = !q || nomDom.includes(q) || nomExt.includes(q);
    const matchPhase = activeMode === 'COUPE' ? (!phaseFilter || m.phase === phaseFilter) : true;
    const matchJournee = activeMode === 'LIGUE' ? (!journeeFilter || String(m.journee) === String(journeeFilter)) : true;
    return matchSearch && matchPhase && matchJournee;
  });

  const tirageInvalide = tirageData.some(t => !t.dom?.equipe?.id || !t.ext?.equipe?.id);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}>
            MATCHS
          </h1>
          <p className="text-gray-400 mt-1">Gérez les matchs du tournoi</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Boutons Coupe */}
          {activeMode === 'COUPE' && (
            <>
              {tiragePret && !quartExiste && (
                <button onClick={preparerTirage}
                  className="flex items-center gap-2 bg-purple-600 text-white font-bold px-5 py-3 rounded-lg hover:bg-purple-500 transition animate-pulse">
                  <MdShuffleOn className="text-xl" /> TIRAGE QUARTS
                </button>
              )}
              {tiragePret && quartExiste && !quartTermine && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                  <MdCheckCircle className="text-xl" /> Quarts générés
                </div>
              )}
              {quartTermine && !demiExiste && (
                <button onClick={genererDemi}
                  className="flex items-center gap-2 bg-green-600 text-white font-bold px-5 py-3 rounded-lg hover:bg-green-500 transition animate-pulse">
                  <MdShuffleOn className="text-xl" /> GÉNÉRER DEMI
                </button>
              )}
              {demiExiste && !demiTermine && (
                <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                  <MdCheckCircle className="text-xl" /> Demis générées
                </div>
              )}
              {demiTermine && !finaleExiste && (
                <button onClick={genererFinale}
                  className="flex items-center gap-2 bg-yellow-500 text-black font-bold px-5 py-3 rounded-lg hover:bg-yellow-400 transition animate-pulse">
                  <MdShuffleOn className="text-xl" /> GÉNÉRER FINALE
                </button>
              )}
              {finaleExiste && (
                <div className="flex items-center gap-2 text-yellow-400 text-sm font-bold">
                  <MdCheckCircle className="text-xl" /> Finale générée
                </div>
              )}
            </>
          )}

          {/* Boutons Ligue */}
          {activeMode === 'LIGUE' && selectedLigue && (
            <>
              {matchs.length === 0 && (
                <button onClick={genererJournees}
                  className="flex items-center gap-2 font-bold px-5 py-3 rounded-lg transition animate-pulse"
                  style={{ backgroundColor: '#a855f7', color: '#fff' }}>
                  <MdShuffleOn className="text-xl" /> GÉNÉRER JOURNÉES
                </button>
              )}
              <button onClick={() => setShowClassement(true)}
                className="flex items-center gap-2 font-bold px-5 py-3 rounded-lg transition"
                style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
                <MdTableChart className="text-xl" /> CLASSEMENT
              </button>
            </>
          )}

          <button onClick={() => navigate('/matchs/new')}
            className="flex items-center gap-2 bg-cyan-400 text-black font-bold px-5 py-3 rounded-lg hover:bg-cyan-300 transition">
            <MdAdd className="text-xl" /> NOUVEAU MATCH
          </button>
        </div>
      </div>

      {/* Tabs COUPE / LIGUE */}
      <div className="flex gap-2 mb-6">
        {[
          { key: 'COUPE', label: 'COUPE', color: '#00d4ff' },
          { key: 'LIGUE', label: 'LIGUE', color: '#a855f7' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveMode(tab.key)}
            className="px-5 py-2 rounded-xl text-sm font-bold transition"
            style={{
              backgroundColor: activeMode === tab.key ? tab.color : 'rgba(255,255,255,0.05)',
              color: activeMode === tab.key ? (tab.key === 'COUPE' ? '#000' : '#fff') : '#6b7280',
              border: `1px solid ${activeMode === tab.key ? tab.color : 'rgba(255,255,255,0.06)'}`,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sélecteur de ligue */}
      {activeMode === 'LIGUE' && tournois.length > 1 && (
        <div className="flex gap-2 mb-4 flex-wrap">
          {tournois.map(t => (
            <button key={t.id}
              onClick={() => setSelectedLigue(t.id)}
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition"
              style={{
                backgroundColor: selectedLigue == t.id ? 'rgba(168,85,247,0.2)' : 'rgba(255,255,255,0.04)',
                color: selectedLigue == t.id ? '#a855f7' : '#6b7280',
                border: `1px solid ${selectedLigue == t.id ? 'rgba(168,85,247,0.4)' : 'rgba(255,255,255,0.06)'}`,
              }}>
              <TbTournament size={14} /> {t.nom}
            </button>
          ))}
        </div>
      )}

      {/* Recherche + Filtres */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Barre de recherche : largeur minimale garantie pour ne plus être écrasée */}
          <div className="relative flex-1 min-w-[220px]">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
            <input type="text" placeholder="Rechercher une équipe..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-700/50 text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400/50 transition bg-transparent" />
          </div>

          {/* Filtres Coupe : peu de boutons, restent sur la même ligne que la recherche */}
          {activeMode === 'COUPE' && (
            <div className="flex flex-wrap gap-2">
              {PHASES_COUPE.map(p => (
                <button key={p.value} onClick={() => setPhaseFilter(p.value)}
                  className={`text-xs font-bold px-3 py-2 rounded-lg border transition ${
                    phaseFilter === p.value
                      ? 'bg-cyan-400 text-black border-cyan-400'
                      : 'text-gray-400 border-gray-700/50 hover:border-cyan-400/40 hover:text-cyan-400'
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filtres Ligue — par journée : sur sa propre ligne (jusqu'à 30 boutons),
            pour ne plus écraser la barre de recherche.
            Vert = journée terminée (tous les matchs TERMINE), Violet = sélectionnée, Gris = à venir/en cours */}
        {activeMode === 'LIGUE' && journees.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setJourneeFilter('')}
              className={`text-xs font-bold px-3 py-2 rounded-lg border transition ${
                !journeeFilter
                  ? 'text-white border-purple-500' : 'text-gray-400 border-gray-700/50 hover:border-purple-500/40 hover:text-purple-400'
              }`}
              style={{ backgroundColor: !journeeFilter ? 'rgba(168,85,247,0.2)' : 'transparent' }}>
              Toutes
            </button>
            {journees.map(j => {
              const selected = String(journeeFilter) === String(j);
              const termine = isJourneeTerminee(j);
              return (
                <button key={j} onClick={() => setJourneeFilter(j)}
                  className={`text-xs font-bold px-3 py-2 rounded-lg border transition flex items-center gap-1 ${
                    selected
                      ? 'text-white border-purple-500'
                      : termine
                      ? 'text-green-400 border-green-500/40 hover:border-green-400'
                      : 'text-gray-400 border-gray-700/50 hover:border-purple-500/40 hover:text-purple-400'
                  }`}
                  style={{
                    backgroundColor: selected
                      ? 'rgba(168,85,247,0.2)'
                      : termine
                      ? 'rgba(34,197,94,0.08)'
                      : 'transparent',
                  }}>
                  {termine && !selected && <MdCheckCircle size={12} />}
                  J{j}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Tirage Quarts */}
      {showTiragePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowTiragePreview(false); }}>
          <div className="bg-[#0d1117] border border-purple-500/40 rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4">
            <h2 className="text-xl font-bold text-white mb-1">Tirage Quarts de Finale</h2>
            <p className="text-gray-400 text-sm mb-5">Top 2 de chaque groupe → 4 matchs</p>
            <div className="space-y-3 mb-5">
              {tirageData.map((t, i) => (
                <div key={i} className="bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3">
                  <div className="text-xs text-gray-500 mb-2 font-semibold tracking-wider">{t.label}</div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 text-right">
                      <p className={`font-bold text-sm ${t.dom?.equipe?.nom ? 'text-white' : 'text-red-400'}`}>{t.dom?.equipe?.nom ?? 'Introuvable'}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{t.descDom}</p>
                    </div>
                    <span className="bg-white/10 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0">VS</span>
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm ${t.ext?.equipe?.nom ? 'text-white' : 'text-red-400'}`}>{t.ext?.equipe?.nom ?? 'Introuvable'}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{t.descExt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {tirageInvalide && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">
                ⚠️ Certaines équipes sont introuvables.
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowTiragePreview(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 font-bold hover:text-white transition">
                Annuler
              </button>
              <button onClick={confirmerTirage} disabled={loadingTirage || tirageInvalide}
                className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition disabled:opacity-40 disabled:cursor-not-allowed">
                {loadingTirage ? 'Création...' : '✓ Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Classement Ligue */}
      {showClassement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowClassement(false); }}>
          <div className="bg-[#0d1117] border border-purple-500/30 rounded-2xl p-6 w-full max-w-xl shadow-2xl mx-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-bold text-lg">CLASSEMENT</h2>
              <button onClick={() => setShowClassement(false)}
                className="text-gray-500 hover:text-white transition text-xl">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs border-b border-gray-800">
                    <th className="text-left pb-2 w-6">#</th>
                    <th className="text-left pb-2">Équipe</th>
                    <th className="text-center pb-2">J</th>
                    <th className="text-center pb-2">V</th>
                    <th className="text-center pb-2">N</th>
                    <th className="text-center pb-2">D</th>
                    <th className="text-center pb-2">BP</th>
                    <th className="text-center pb-2">BC</th>
                    <th className="text-center pb-2">Diff</th>
                    <th className="text-center pb-2 font-bold text-purple-400">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {classement.map((row, i) => (
                    <tr key={row.equipeId}
                      className="border-b border-gray-800/50 hover:bg-white/5 transition"
                      style={{ color: i === 0 ? '#a855f7' : '#e5e7eb' }}>
                      <td className="py-2.5 text-gray-500 text-xs">{i + 1}</td>
                      <td className="py-2.5 font-bold">{row.equipeNom}</td>
                      <td className="py-2.5 text-center text-gray-400">{row.j}</td>
                      <td className="py-2.5 text-center text-green-400">{row.v}</td>
                      <td className="py-2.5 text-center text-gray-400">{row.n}</td>
                      <td className="py-2.5 text-center text-red-400">{row.d}</td>
                      <td className="py-2.5 text-center">{row.bp}</td>
                      <td className="py-2.5 text-center">{row.bc}</td>
                      <td className="py-2.5 text-center" style={{ color: row.diff > 0 ? '#4ade80' : row.diff < 0 ? '#f87171' : '#9ca3af' }}>
                        {row.diff > 0 ? '+' : ''}{row.diff}
                      </td>
                      <td className="py-2.5 text-center font-bold text-purple-400">{row.pts}</td>
                    </tr>
                  ))}
                  {classement.length === 0 && (
                    <tr><td colSpan={10} className="py-10 text-center text-gray-600">Aucun match terminé</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Grille matchs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matchsFiltres.map((match) => {
          const buteursDom = getButeurs(match.id, match.equipeDomicile?.id);
          const buteursExt = getButeurs(match.id, match.equipeExterieur?.id);
          const score = getScoreFinal(match);
          const isLigue = match.phase === 'JOURNEE_LIGUE';

          return (
            <div key={match.id}
              className="border rounded-xl p-5 transition"
              style={{
                borderColor: isLigue ? 'rgba(168,85,247,0.2)' : 'rgba(107,114,128,0.3)',
                borderTop: `2px solid ${isLigue ? '#a855f7' : '#00d4ff'}`,
                backgroundColor: '#0a0d14',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = isLigue ? 'rgba(168,85,247,0.5)' : 'rgba(0,212,255,0.3)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = isLigue ? 'rgba(168,85,247,0.2)' : 'rgba(107,114,128,0.3)'}>

              {/* Phase + Journée + Actions */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-semibold">
                    {isLigue ? `Journée ${match.journee}` : getPhaseLabel(match.phase)}
                  </span>
                  {isLigue && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: 'rgba(168,85,247,0.1)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.2)' }}>
                      LIGUE
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {match.statut === 'PREVU' && (
                    <button onClick={() => navigate(`/matchs/${match.id}/score`)}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)' }}>
                      <MdSportsSoccer className="text-sm" /> SCORE
                    </button>
                  )}
                  {match.statut === 'TERMINE' && (
                    <button onClick={() => navigate(`/statistiques/match/${match.id}`)}
                      className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg transition"
                      style={{ backgroundColor: 'rgba(156,163,175,0.1)', color: '#9ca3af', border: '1px solid rgba(156,163,175,0.3)' }}>
                      <MdSportsSoccer className="text-sm" /> STATS
                    </button>
                  )}
                  <button onClick={() => navigate(`/matchs/${match.id}/edit`)}
                    className="text-gray-400 hover:text-cyan-400 transition">
                    <MdEdit className="text-xl" />
                  </button>
                  <button onClick={() => handleDelete(match.id)}
                    className="text-gray-400 hover:text-red-400 transition">
                    <MdDelete className="text-xl" />
                  </button>
                </div>
              </div>

              {/* Statut */}
              <div className="flex justify-center mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatutStyle(match.statut)}`}>
                  {match.statut === 'TERMINE' ? 'TERMINÉ' : 'PRÉVU'}
                </span>
              </div>

              {/* Équipes + Score */}
              <div className="flex items-center justify-center gap-4 my-2">
                <p className="text-white font-bold text-base flex-1 text-right">{match.equipeDomicile?.nom}</p>
                <div className="flex flex-col items-center gap-1">
                  {match.statut === 'TERMINE' ? (
                    <>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-white">{score.dom}</span>
                        <span className="text-gray-600 text-xl">—</span>
                        <span className="text-2xl font-bold text-white">{score.ext}</span>
                      </div>
                      {score.label && (
                        <span className={`text-xs font-bold ${score.label === 'TAB' ? 'text-orange-400' : 'text-yellow-400'}`}>
                          {score.label}
                        </span>
                      )}
                      {score.reglementaire && (
                        <span className="text-xs text-gray-500">{score.reglementaire}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-gray-500 text-sm font-bold">VS</span>
                  )}
                </div>
                <p className="text-white font-bold text-base flex-1 text-left">{match.equipeExterieur?.nom}</p>
              </div>

              {/* Buteurs */}
              {match.statut === 'TERMINE' && (buteursDom.length > 0 || buteursExt.length > 0) && (
                <div className="flex justify-between items-start mt-2 px-1">
                  <div className="flex flex-col items-start gap-0.5 flex-1">
                    {buteursDom.map((b, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
                        <MdSportsSoccer className="text-cyan-400 text-sm shrink-0" />
                        <span>{b.buteur?.prenom} {b.buteur?.nom}</span>
                        <span className="text-gray-600">{b.minute}'</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-px bg-gray-700/50 mx-2 self-stretch" />
                  <div className="flex flex-col items-end gap-0.5 flex-1">
                    {buteursExt.map((b, i) => (
                      <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
                        <span className="text-gray-600">{b.minute}'</span>
                        <span>{b.buteur?.prenom} {b.buteur?.nom}</span>
                        <MdSportsSoccer className="text-purple-400 text-sm shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Date + Lieu */}
              <div className="flex items-center justify-center gap-4 mt-3 pt-3 border-t border-gray-700/30">
                <div className="flex items-center gap-1 text-gray-400 text-xs">
                  <MdCalendarToday style={{ color: isLigue ? '#a855f7' : '#00d4ff' }} />
                  {match.dateMatch ?? '—'}
                </div>
                {match.lieu && (
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <MdLocationOn style={{ color: isLigue ? '#a855f7' : '#00d4ff' }} />
                    {match.lieu}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {matchsFiltres.length === 0 && (
          <div className="col-span-2 text-center text-gray-600 py-20">
            {activeMode === 'LIGUE'
              ? matchs.length === 0 ? 'Aucun match ligue. Cliquez sur "GÉNÉRER JOURNÉES".' : 'Aucun match trouvé.'
              : matchs.length === 0 ? 'Aucun match trouvé. Créez votre premier match !' : 'Aucun match ne correspond.'}
          </div>
        )}
      </div>
    </div>
  );
}