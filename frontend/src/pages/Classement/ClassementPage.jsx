import { useEffect, useState } from 'react';
import { MdEmojiEvents, MdRefresh } from 'react-icons/md';
import { TbTournament } from 'react-icons/tb';
import api from '../../api/axios';

export default function ClassementPage() {
  const [activeMode, setActiveMode] = useState('COUPE');

  // COUPE
  const [classement, setClassement] = useState({});
  const [groupes, setGroupes] = useState([]);
  const [selectedGroupe, setSelectedGroupe] = useState('all');

  // LIGUE
  const [tournoisLigue, setTournoisLigue] = useState([]);
  const [selectedLigue, setSelectedLigue] = useState('');
  const [classementLigue, setClassementLigue] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournoisLigue();
    fetchAllCoupe();
  }, []);

  useEffect(() => {
    if (activeMode === 'LIGUE' && selectedLigue) {
      fetchClassementLigue(selectedLigue);
    }
  }, [activeMode, selectedLigue]);

  // ── COUPE ──────────────────────────────────────────────────────────────────

  const fetchAllCoupe = async () => {
    setLoading(true);
    try {
      const [resGroupes, resClassement] = await Promise.all([
        api.get('/groupes'),
        api.get('/classement'),
      ]);
      setGroupes(resGroupes.data);
      setClassement(resClassement.data);
    } catch (err) {
      console.error('Erreur chargement coupe', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (groupeId) => {
    if (!confirm("Voulez-vous vraiment réinitialiser ce classement ?")) return;
    try {
      await api.put(`/groupes/${groupeId}/reset-classement`);
      alert("Classement réinitialisé");
      fetchAllCoupe();
    } catch (err) {
      console.error("Erreur reset classement", err);
    }
  };

  const classementParGroupe = groupes.map(groupe => ({
    groupe,
    equipes: (classement[groupe.id] || []).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const diffA = a.butsMarques - a.butsEncaisses;
      const diffB = b.butsMarques - b.butsEncaisses;
      if (diffB !== diffA) return diffB - diffA;
      return b.butsMarques - a.butsMarques;
    }),
  }));

  const groupesAffiches = selectedGroupe === 'all'
    ? classementParGroupe
    : classementParGroupe.filter(({ groupe }) => groupe.id === selectedGroupe);

  // ── LIGUE ──────────────────────────────────────────────────────────────────

  const fetchTournoisLigue = async () => {
    try {
      const res = await api.get('/tournois');
      const ligues = res.data.filter(t => t.type === 'LIGUE');
      setTournoisLigue(ligues);
      if (ligues.length > 0) setSelectedLigue(ligues[0].id);
    } catch (err) {
      console.error('Erreur chargement ligues', err);
    }
  };

  const fetchClassementLigue = async (tournoiId) => {
    setLoading(true);
    try {
      const res = await api.get(`/matchs/ligue/${tournoiId}/classement`);
      setClassementLigue(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Erreur classement ligue', err);
    } finally {
      setLoading(false);
    }
  };

  // ── Helpers ────────────────────────────────────────────────────────────────

  const getRangStyle = (index) => {
    switch (index) {
      case 0:  return 'text-yellow-400';
      case 1:  return 'text-gray-300';
      case 2:  return 'text-orange-400';
      default: return 'text-gray-500';
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}>
            CLASSEMENT
          </h1>
          <p className="text-gray-400 mt-1">
            {activeMode === 'COUPE' ? 'Classement par groupe' : 'Classement de la ligue'}
          </p>
        </div>

        <button
          onClick={() => activeMode === 'COUPE' ? fetchAllCoupe() : fetchClassementLigue(selectedLigue)}
          className="flex items-center gap-2 border border-gray-700 text-gray-400 font-bold px-5 py-3 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition"
        >
          <MdRefresh className="text-xl" /> ACTUALISER
        </button>
      </div>

      {/* TABS COUPE / LIGUE */}
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

      {/* ── COUPE ─────────────────────────────────────────────────────────── */}
      {activeMode === 'COUPE' && (
        <>
          {!loading && groupes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button onClick={() => setSelectedGroupe('all')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${
                  selectedGroupe === 'all'
                    ? 'bg-cyan-400 text-black border-cyan-400'
                    : 'border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
                }`}>
                Tous
              </button>
              {groupes.map(groupe => (
                <button key={groupe.id} onClick={() => setSelectedGroupe(groupe.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${
                    selectedGroupe === groupe.id
                      ? 'bg-cyan-400 text-black border-cyan-400'
                      : 'border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
                  }`}>
                  Groupe {groupe.nom}
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-600 py-20">Chargement...</div>
          ) : (
            <div className="flex flex-col gap-8">
              {groupesAffiches.map(({ groupe, equipes }) => (
                <div key={groupe.id}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <MdEmojiEvents className="text-cyan-400 text-2xl" />
                      <h2 className="text-white font-bold text-xl">GROUPE {groupe.nom}</h2>
                    </div>
                    <button onClick={() => handleReset(groupe.id)}
                      className="flex items-center gap-2 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500/10 transition text-sm">
                      <MdRefresh /> Réinitialiser
                    </button>
                  </div>

                  <div className="rounded-xl overflow-hidden border border-gray-700/50">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-700/50 bg-white/5">
                          {['#','ÉQUIPE','J','V','N','D','BP','BC','DIFF','PTS'].map((h, i) => (
                            <th key={i}
                              className={`py-4 text-xs font-bold ${i < 2 ? 'text-left px-6' : 'text-center px-4'} ${h === 'PTS' ? 'text-cyan-400' : 'text-gray-300'}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {equipes.length === 0 ? (
                          <tr><td colSpan={10} className="text-center text-gray-500 py-10">Aucune équipe</td></tr>
                        ) : (
                          equipes.map((c, index) => {
                            const diff = c.butsMarques - c.butsEncaisses;
                            return (
                              <tr key={c.equipeId} className="border-b border-gray-700/30 hover:bg-white/5 transition">
                                <td className={`px-6 py-4 font-bold text-lg ${getRangStyle(index)}`}>{index + 1}</td>
                                <td className="px-6 py-4 text-white font-semibold">{c.equipeNom}</td>
                                <td className="px-4 py-4 text-center text-gray-300">{c.victoires + c.nuls + c.defaites}</td>
                                <td className="px-4 py-4 text-center text-green-400 font-semibold">{c.victoires}</td>
                                <td className="px-4 py-4 text-center text-gray-300">{c.nuls}</td>
                                <td className="px-4 py-4 text-center text-red-400 font-semibold">{c.defaites}</td>
                                <td className="px-4 py-4 text-center text-gray-200">{c.butsMarques}</td>
                                <td className="px-4 py-4 text-center text-gray-200">{c.butsEncaisses}</td>
                                <td className={`px-4 py-4 text-center font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                                  {diff > 0 ? '+' : ''}{diff}
                                </td>
                                <td className="px-4 py-4 text-center text-cyan-400 font-bold text-lg">{c.points}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">🔵 Les 2 premiers se qualifient</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ── LIGUE ─────────────────────────────────────────────────────────── */}
      {activeMode === 'LIGUE' && (
        <>
          {/* Sélecteur ligue si plusieurs */}
          {tournoisLigue.length > 1 && (
            <div className="flex gap-2 mb-6 flex-wrap">
              {tournoisLigue.map(t => (
                <button key={t.id} onClick={() => setSelectedLigue(t.id)}
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

          {tournoisLigue.length === 0 ? (
            <div className="text-center text-gray-600 py-20">
              Aucune ligue trouvée. Créez d'abord un tournoi de type LIGUE.
            </div>
          ) : loading ? (
            <div className="text-center text-gray-600 py-20">Chargement...</div>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-4">
                <TbTournament className="text-purple-400 text-2xl" />
                <h2 className="text-white font-bold text-xl">
                  {tournoisLigue.find(t => t.id == selectedLigue)?.nom ?? 'Ligue'}
                </h2>
              </div>

              <div className="rounded-xl overflow-hidden border border-purple-500/20">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-purple-500/20 bg-white/5">
                      {['#','ÉQUIPE','J','V','N','D','BP','BC','DIFF','PTS'].map((h, i) => (
                        <th key={i}
                          className={`py-4 text-xs font-bold ${i < 2 ? 'text-left px-6' : 'text-center px-4'} ${h === 'PTS' ? 'text-purple-400' : 'text-gray-300'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {classementLigue.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-gray-500 py-10">
                          Aucun match terminé pour cette ligue.
                        </td>
                      </tr>
                    ) : (
                      classementLigue.map((row, index) => {
                        const diff = row.diff ?? 0;
                        return (
                          <tr key={row.equipeId}
                            className="border-b border-gray-700/30 hover:bg-white/5 transition"
                            style={{ borderLeft: index === 0 ? '2px solid #a855f7' : 'none' }}>
                            <td className={`px-6 py-4 font-bold text-lg ${getRangStyle(index)}`}>{index + 1}</td>
                            <td className="px-6 py-4 text-white font-semibold">{row.equipeNom}</td>
                            <td className="px-4 py-4 text-center text-gray-300">{row.j}</td>
                            <td className="px-4 py-4 text-center text-green-400 font-semibold">{row.v}</td>
                            <td className="px-4 py-4 text-center text-gray-300">{row.n}</td>
                            <td className="px-4 py-4 text-center text-red-400 font-semibold">{row.d}</td>
                            <td className="px-4 py-4 text-center text-gray-200">{row.bp}</td>
                            <td className="px-4 py-4 text-center text-gray-200">{row.bc}</td>
                            <td className={`px-4 py-4 text-center font-semibold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                              {diff > 0 ? '+' : ''}{diff}
                            </td>
                            <td className="px-4 py-4 text-center text-purple-400 font-bold text-lg">{row.pts}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <p className="text-gray-500 text-xs mt-2">🟣 Leader de la ligue</p>
            </>
          )}
        </>
      )}
    </div>
  );
}