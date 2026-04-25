import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdAdd, MdEdit, MdDelete,
  MdCalendarToday, MdLocationOn, MdSportsSoccer, MdSearch,
  MdShuffleOn, MdCheckCircle
} from 'react-icons/md';
import api from '../../api/axios';

const PHASES = [
  { value: '', label: 'Tous' },
  { value: 'GROUPE', label: 'Groupes' },
  { value: 'QUART', label: 'Quarts' },
  { value: 'DEMI', label: 'Demi-Finale' },
  { value: 'TROISIEME', label: '3ème Place' },
  { value: 'FINALE', label: 'Finale' },
];

export default function MatchList() {
  const [matchs, setMatchs] = useState([]);
  const [butsMap, setButsMap] = useState({});
  const [search, setSearch] = useState('');
  const [phaseFilter, setPhaseFilter] = useState('');
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
    fetchMatchs();
  }, []);

  const fetchMatchs = async () => {
    try {
      const res = await api.get('/matchs');
      const data = res.data;
      const liste = Array.isArray(data) ? data : data.content ?? data.matchs ?? [];
      setMatchs(liste);

      const groupeMatchs = liste.filter(m => m.phase === 'GROUPE');
      const tousTermines = groupeMatchs.length > 0 && groupeMatchs.every(m => m.statut === 'TERMINE');
      const quartDejaExiste = liste.some(m => m.phase === 'QUART');
      const quartMatchs = liste.filter(m => m.phase === 'QUART');
      const quartTousTermines = quartMatchs.length > 0 && quartMatchs.every(m => m.statut === 'TERMINE');
      const demiDejaExiste = liste.some(m => m.phase === 'DEMI');
      const demiMatchs = liste.filter(m => m.phase === 'DEMI');
      const demiTousTermines = demiMatchs.length > 0 && demiMatchs.every(m => m.statut === 'TERMINE');
      const finaleDejaExiste = liste.some(m => m.phase === 'FINALE');

      setTiragePret(tousTermines);
      setQuartExiste(quartDejaExiste);
      setQuartTermine(quartTousTermines);
      setDemiExiste(demiDejaExiste);
      setDemiTermine(demiTousTermines);
      setFinaleExiste(finaleDejaExiste);

      const termines = liste.filter(m => m.statut === 'TERMINE');
      const butsRequests = termines.map(m =>
        api.get(`/matchs/${m.id}/buts`)
          .then(r => ({ id: m.id, buts: Array.isArray(r.data) ? r.data : [] }))
          .catch(() => ({ id: m.id, buts: [] }))
      );
      const results = await Promise.all(butsRequests);
      const map = {};
      results.forEach(({ id, buts }) => { map[id] = buts; });
      setButsMap(map);
    } catch (err) {
      console.error('Erreur chargement matchs', err);
    }
  };

  const calculerClassements = (liste) => {
    const groupes = { 'A': {}, 'B': {}, 'C': {}, 'D': {} };

    const initEquipe = (equipe) => ({
      equipe,
      pts: 0, j: 0, v: 0, n: 0, d: 0, bp: 0, bc: 0, diff: 0
    });

    liste
      .filter(m => m.phase === 'GROUPE' && m.statut === 'TERMINE')
      .forEach(m => {
        const groupeDom = m.equipeDomicile?.groupe?.nom?.toString();
        const groupeExt = m.equipeExterieur?.groupe?.nom?.toString();
        const groupe = groupeDom ?? groupeExt;
        if (!groupe || !groupes[groupe]) return;

        const idDom = m.equipeDomicile?.id;
        const idExt = m.equipeExterieur?.id;
        if (!idDom || !idExt) return;

        if (!groupes[groupe][idDom]) groupes[groupe][idDom] = initEquipe(m.equipeDomicile);
        if (!groupes[groupe][idExt]) groupes[groupe][idExt] = initEquipe(m.equipeExterieur);

        const dom = groupes[groupe][idDom];
        const ext = groupes[groupe][idExt];
        const sd = m.scoreDomicile ?? 0;
        const se = m.scoreExterieur ?? 0;

        dom.j++; dom.bp += sd; dom.bc += se; dom.diff += (sd - se);
        ext.j++; ext.bp += se; ext.bc += sd; ext.diff += (se - sd);

        if (sd > se)      { dom.v++; dom.pts += 3; ext.d++; }
        else if (sd < se) { ext.v++; ext.pts += 3; dom.d++; }
        else              { dom.n++; dom.pts++;     ext.n++; ext.pts++; }
      });

    const classes = {};
    for (const g of Object.keys(groupes)) {
      classes[g] = Object.values(groupes[g])
        .sort((a, b) => b.pts - a.pts || b.diff - a.diff || b.bp - a.bp);
    }
    return classes;
  };

  const preparerTirage = () => {
    const classes = calculerClassements(matchs);
    const paires = [
      { label: 'Quart 1', descDom: '1er Groupe A', descExt: '2ème Groupe B', dom: classes['A']?.[0], ext: classes['B']?.[1] },
      { label: 'Quart 2', descDom: '1er Groupe C', descExt: '2ème Groupe D', dom: classes['C']?.[0], ext: classes['D']?.[1] },
      { label: 'Quart 3', descDom: '1er Groupe B', descExt: '2ème Groupe A', dom: classes['B']?.[0], ext: classes['A']?.[1] },
      { label: 'Quart 4', descDom: '1er Groupe D', descExt: '2ème Groupe C', dom: classes['D']?.[0], ext: classes['C']?.[1] },
    ];
    setTirageData(paires);
    setShowTiragePreview(true);
  };

  const confirmerTirage = async () => {
    setLoadingTirage(true);
    try {
      for (const t of tirageData) {
        const domId = t.dom?.equipe?.id;
        const extId = t.ext?.equipe?.id;
        if (!domId || !extId) continue;
        await api.post('/matchs', { domId, extId, phase: 'QUART', statut: 'PREVU' });
      }
      setShowTiragePreview(false);
      setPhaseFilter('QUART');
      fetchMatchs();
    } catch (err) {
      const apiMsg = err.response?.data?.message ?? err.response?.data?.error ?? err.message;
      alert(`Erreur création Quarts de Finale:\n${apiMsg}`);
    } finally {
      setLoadingTirage(false);
    }
  };

  const genererDemi = async () => {
    try {
      await api.post('/matchs/phase-suivante', {});
      fetchMatchs();
      setPhaseFilter('DEMI');
    } catch (err) {
      alert('Erreur génération Demi-finales: ' + (err.response?.data ?? err.message));
    }
  };

  const genererFinale = async () => {
    try {
      await api.post('/matchs/phase-suivante', {});
      fetchMatchs();
      setPhaseFilter('FINALE');
    } catch (err) {
      alert('Erreur génération Finale: ' + (err.response?.data ?? err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce match ?')) return;
    try {
      await api.delete(`/matchs/${id}`);
      fetchMatchs();
    } catch (err) {
      console.error('Erreur suppression', err);
    }
  };

  const getStatutStyle = (statut) => {
    switch (statut) {
      case 'TERMINE': return 'bg-gray-400/10 text-gray-400';
      case 'PREVU':   return 'bg-cyan-400/10 text-cyan-400';
      default:        return 'bg-yellow-400/10 text-yellow-400';
    }
  };

  const getPhaseLabel = (phase) => {
    switch (phase) {
      case 'GROUPE':    return 'Phase de Groupes';
      case 'QUART':     return 'Quarts de Finale';
      case 'DEMI':      return 'Demi-Finale';
      case 'TROISIEME': return 'Match pour la 3ème Place';
      case 'FINALE':    return 'Finale';
      default:          return phase;
    }
  };

  const getButeurs = (matchId, equipeId) => {
    const buts = butsMap[matchId] ?? [];
    return buts.filter(b => b.buteur?.equipe?.id === equipeId);
  };

  const getScoreFinal = (match) => {
    if (match.penalty) {
      return {
        dom: match.scorePenDomicile,
        ext: match.scorePenExterieur,
        label: 'TAB',
        reglementaire: `${match.scoreDomicile}—${match.scoreExterieur} TR`,
      };
    }
    if (match.prolongation) {
      return {
        dom: match.scoreProlDomicile,
        ext: match.scoreProlExterieur,
        label: 'AET',
        reglementaire: `${match.scoreDomicile}—${match.scoreExterieur} TR`,
      };
    }
    return { dom: match.scoreDomicile, ext: match.scoreExterieur, label: null, reglementaire: null };
  };

  const matchsFiltres = matchs.filter(m => {
    const q = search.toLowerCase();
    const nomDom = m.equipeDomicile?.nom?.toLowerCase() ?? '';
    const nomExt = m.equipeExterieur?.nom?.toLowerCase() ?? '';
    const matchSearch = !q || nomDom.includes(q) || nomExt.includes(q);
    const matchPhase = !phaseFilter || m.phase === phaseFilter;
    return matchSearch && matchPhase;
  });

  const tirageInvalide = tirageData.some(t => !t.dom?.equipe?.id || !t.ext?.equipe?.id);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-4xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}
          >
            MATCHS
          </h1>
          <p className="text-gray-400 mt-1">Gérez les matchs du tournoi</p>
        </div>

        <div className="flex items-center gap-3">
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
          <button onClick={() => navigate('/matchs/new')}
            className="flex items-center gap-2 bg-cyan-400 text-black font-bold px-5 py-3 rounded-lg hover:bg-cyan-300 transition">
            <MdAdd className="text-xl" /> NOUVEAU MATCH
          </button>
        </div>
      </div>

      {/* Modal Preview Tirage */}
      {showTiragePreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setShowTiragePreview(false); }}
        >
          <div className="bg-[#0d1117] border border-purple-500/40 rounded-2xl p-6 w-full max-w-lg shadow-2xl mx-4">
            <h2 className="text-xl font-bold text-white mb-1">Tirage Quarts de Finale</h2>
            <p className="text-gray-400 text-sm mb-5">Top 2 isaky ny groupe → 4 matchs Quart de Finale</p>
            <div className="space-y-3 mb-5">
              {tirageData.map((t, i) => (
                <div key={i} className="bg-white/5 border border-gray-700/50 rounded-xl px-4 py-3">
                  <div className="text-xs text-gray-500 mb-2 font-semibold tracking-wider">{t.label}</div>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 text-right">
                      <p className={`font-bold text-sm ${t.dom?.equipe?.nom ? 'text-white' : 'text-red-400'}`}>
                        {t.dom?.equipe?.nom ?? 'Tsy hita'}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{t.descDom}</p>
                    </div>
                    <span className="bg-white/10 text-gray-300 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0">VS</span>
                    <div className="flex-1 text-left">
                      <p className={`font-bold text-sm ${t.ext?.equipe?.nom ? 'text-white' : 'text-red-400'}`}>
                        {t.ext?.equipe?.nom ?? 'Tsy hita'}
                      </p>
                      <p className="text-gray-500 text-xs mt-0.5">{t.descExt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {tirageInvalide && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 mb-4 text-red-400 text-sm">
                ⚠️ Ekipa sasany tsy hita. Jereo raha vita ny changes ao amin'ny{' '}
                <code className="bg-red-500/20 px-1 rounded text-xs">Equipe.java</code>{' '}
                (esory ny @JsonIgnore amin'ny groupe).
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowTiragePreview(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-400 font-bold hover:border-gray-500 hover:text-white transition">
                Annuler
              </button>
              <button onClick={confirmerTirage} disabled={loadingTirage || tirageInvalide}
                className="flex-1 py-2.5 rounded-lg bg-purple-600 text-white font-bold hover:bg-purple-500 transition disabled:opacity-40 disabled:cursor-not-allowed">
                {loadingTirage ? 'Création en cours...' : '✓ Confirmer le Tirage'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barre de recherche + Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xl" />
          <input
            type="text"
            placeholder="Rechercher une équipe..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full border border-gray-700/50 text-white placeholder-gray-600 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-cyan-400/50 transition bg-transparent"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {PHASES.map(p => (
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
      </div>

      {/* Grille matchs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matchsFiltres.map((match) => {
          const buteursDom = getButeurs(match.id, match.equipeDomicile?.id);
          const buteursExt = getButeurs(match.id, match.equipeExterieur?.id);
          const score = getScoreFinal(match);

          return (
            <div key={match.id}
              className="border border-gray-700/50 rounded-xl p-5 hover:border-cyan-400/30 transition">

              {/* Phase + Actions */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-semibold">
                  {getPhaseLabel(match.phase)}
                </span>
                <div className="flex items-center gap-2">
                  {match.statut === 'PREVU' && (
                    <button onClick={() => navigate(`/matchs/${match.id}/score`)}
                      className="flex items-center gap-1 bg-cyan-400/10 text-cyan-400 border border-cyan-400/30 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-cyan-400/20 transition">
                      <MdSportsSoccer className="text-sm" /> SCORE
                    </button>
                  )}
                  {match.statut === 'TERMINE' && (
                    <button onClick={() => navigate(`/statistiques/match/${match.id}`)}
                      className="flex items-center gap-1 bg-gray-400/10 text-gray-400 border border-gray-400/30 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-gray-400/20 transition">
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
                <p className="text-white font-bold text-base flex-1 text-right">
                  {match.equipeDomicile?.nom}
                </p>
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
                <p className="text-white font-bold text-base flex-1 text-left">
                  {match.equipeExterieur?.nom}
                </p>
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
                  <MdCalendarToday className="text-cyan-400" />
                  {match.dateMatch ?? '—'}
                </div>
                {match.lieu && (
                  <div className="flex items-center gap-1 text-gray-400 text-xs">
                    <MdLocationOn className="text-cyan-400" />
                    {match.lieu}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {matchsFiltres.length === 0 && (
          <div className="col-span-2 text-center text-gray-600 py-20">
            {matchs.length === 0
              ? 'Aucun match trouvé. Créez votre premier match !'
              : 'Aucun match ne correspond à votre recherche.'}
          </div>
        )}
      </div>
    </div>
  );
}