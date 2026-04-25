import { useEffect, useState } from 'react';
import { MdEmojiEvents, MdRefresh } from 'react-icons/md';
import api from '../../api/axios';

export default function ClassementPage() {
  const [classement, setClassement] = useState({});
  const [groupes, setGroupes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupe, setSelectedGroupe] = useState('all');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resGroupes, resClassement] = await Promise.all([
        api.get('/groupes'),
        api.get('/classement'),
      ]);
      setGroupes(resGroupes.data);
      setClassement(resClassement.data);
    } catch (err) {
      console.error('Erreur chargement', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (groupeId) => {
    if (!confirm("Voulez-vous vraiment réinitialiser ce classement ?")) return;
    try {
      await api.put(`/groupes/${groupeId}/reset-classement`);
      alert("Classement réinitialisé");
      fetchAll();
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

  const groupesAffichés = selectedGroupe === 'all'
    ? classementParGroupe
    : classementParGroupe.filter(({ groupe }) => groupe.id === selectedGroupe);

  const getRangStyle = (index) => {
    switch (index) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-gray-300';
      case 2: return 'text-orange-400';
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
          <p className="text-gray-400 mt-1">Classement par groupe</p>
        </div>

        <button
          onClick={fetchAll}
          className="flex items-center gap-2 border border-gray-700 text-gray-400 font-bold px-5 py-3 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition"
        >
          <MdRefresh className="text-xl" />
          ACTUALISER
        </button>
      </div>

      {/* FILTRE GROUPES */}
      {!loading && groupes.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setSelectedGroupe('all')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${
              selectedGroupe === 'all'
                ? 'bg-cyan-400 text-black border-cyan-400'
                : 'border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
            }`}
          >
            Tous
          </button>

          {groupes.map(groupe => (
            <button
              key={groupe.id}
              onClick={() => setSelectedGroupe(groupe.id)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition border ${
                selectedGroupe === groupe.id
                  ? 'bg-cyan-400 text-black border-cyan-400'
                  : 'border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400'
              }`}
            >
              Groupe {groupe.nom}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center text-gray-600 py-20">
          Chargement du classement...
        </div>
      ) : (
        <div className="flex flex-col gap-8">

          {groupesAffichés.map(({ groupe, equipes }) => (
            <div key={groupe.id}>

              {/* HEADER GROUPE + RESET */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <MdEmojiEvents className="text-cyan-400 text-2xl" />
                  <h2 className="text-white font-bold text-xl">
                    GROUPE {groupe.nom}
                  </h2>
                </div>

                <button
                  onClick={() => handleReset(groupe.id)}
                  className="flex items-center gap-2 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500/10 transition text-sm"
                >
                  <MdRefresh />
                  Réinitialiser
                </button>
              </div>

              {/* TABLE — ✅ transparent, bordure subtile, texte lisible */}
              <div className="rounded-xl overflow-hidden border border-gray-700/50">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-700/50 bg-white/5">
                      <th className="text-left px-6 py-4 text-gray-300 text-xs font-bold">#</th>
                      <th className="text-left px-6 py-4 text-gray-300 text-xs font-bold">ÉQUIPE</th>
                      <th className="text-center px-4 py-4 text-gray-300 text-xs font-bold">J</th>
                      <th className="text-center px-4 py-4 text-gray-300 text-xs font-bold">V</th>
                      <th className="text-center px-4 py-4 text-gray-300 text-xs font-bold">N</th>
                      <th className="text-center px-4 py-4 text-gray-300 text-xs font-bold">D</th>
                      <th className="text-center px-4 py-4 text-gray-300 text-xs font-bold">BP</th>
                      <th className="text-center px-4 py-4 text-gray-300 text-xs font-bold">BC</th>
                      <th className="text-center px-4 py-4 text-gray-300 text-xs font-bold">DIFF</th>
                      <th className="text-center px-4 py-4 text-cyan-400 text-xs font-bold">PTS</th>
                    </tr>
                  </thead>

                  <tbody>
                    {equipes.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="text-center text-gray-500 py-10">
                          Aucune équipe
                        </td>
                      </tr>
                    ) : (
                      equipes.map((c, index) => (
                        <tr key={c.equipeId}
                          className="border-b border-gray-700/30 hover:bg-white/5 transition">

                          <td className={`px-6 py-4 font-bold text-lg ${getRangStyle(index)}`}>
                            {index + 1}
                          </td>

                          <td className="px-6 py-4 text-white font-semibold">
                            {c.equipeNom}
                          </td>

                          <td className="px-4 py-4 text-center text-gray-300 font-medium">
                            {c.victoires + c.nuls + c.defaites}
                          </td>

                          <td className="px-4 py-4 text-center text-green-400 font-semibold">
                            {c.victoires}
                          </td>

                          <td className="px-4 py-4 text-center text-gray-300 font-medium">
                            {c.nuls}
                          </td>

                          <td className="px-4 py-4 text-center text-red-400 font-semibold">
                            {c.defaites}
                          </td>

                          <td className="px-4 py-4 text-center text-gray-200 font-medium">
                            {c.butsMarques}
                          </td>

                          <td className="px-4 py-4 text-center text-gray-200 font-medium">
                            {c.butsEncaisses}
                          </td>

                          <td className={`px-4 py-4 text-center font-semibold ${
                            (c.butsMarques - c.butsEncaisses) > 0
                              ? 'text-green-400'
                              : (c.butsMarques - c.butsEncaisses) < 0
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}>
                            {c.butsMarques - c.butsEncaisses > 0 ? '+' : ''}
                            {c.butsMarques - c.butsEncaisses}
                          </td>

                          <td className="px-4 py-4 text-center text-cyan-400 font-bold text-lg">
                            {c.points}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <p className="text-gray-500 text-xs mt-2">
                🔵 Les 2 premiers se qualifient
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}