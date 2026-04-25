import { useEffect, useState } from 'react';
import { MdBarChart, MdRefresh, MdSportsSoccer, MdPerson, MdEmojiEvents } from 'react-icons/md';
import api from '../../api/axios';
 
export default function StatistiquePage() {
  const [topButeurs, setTopButeurs] = useState([]);
  const [topPasseurs, setTopPasseurs] = useState([]);
  const [meilleurClub, setMeilleurClub] = useState([]);
  const [loading, setLoading] = useState(true);
 
  const TOURNOI_ID = 2;
 
  useEffect(() => {
    fetchStats();
  }, []);
 
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/statistiques/tournoi/${TOURNOI_ID}`);
      const data = res.data;
      setTopButeurs(data.topButeurs || []);
      setTopPasseurs(data.topPasseurs || []);
      setMeilleurClub(data.meilleurClub || []);
    } catch (err) {
      console.error('Erreur chargement statistiques', err);
    } finally {
      setLoading(false);
    }
  };
 
  const getMedaille = (index) => {
    switch (index) {
      case 0: return { emoji: '🥇', style: 'text-yellow-400 text-xl' };
      case 1: return { emoji: '🥈', style: 'text-gray-300 text-xl' };
      case 2: return { emoji: '🥉', style: 'text-orange-400 text-xl' };
      default: return { emoji: `${index + 1}`, style: 'text-gray-600 text-sm' };
    }
  };
 
  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1
            className="text-4xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}
          >
            STATISTIQUES
          </h1>
          <p className="text-gray-400 mt-1">Performances des joueurs et clubs</p>
        </div>
        <button
          onClick={fetchStats}
          className="flex items-center gap-2 border border-gray-700 text-gray-400 font-bold px-5 py-3 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition"
        >
          <MdRefresh className="text-xl" />
          ACTUALISER
        </button>
      </div>
 
      {loading ? (
        <div className="text-center text-gray-600 py-20">
          Chargement des statistiques...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
 
          {/* Meilleurs Buteurs */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MdSportsSoccer className="text-cyan-400 text-2xl" />
              <h2 className="text-white font-bold text-xl">MEILLEURS BUTEURS</h2>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-800/40">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/40">
                    <th className="text-left text-gray-400 text-xs font-semibold px-4 py-4 w-8">#</th>
                    <th className="text-left text-gray-400 text-xs font-semibold px-4 py-4">JOUEUR</th>
                    <th className="text-center text-cyan-400 text-xs font-semibold px-4 py-4">BUTS</th>
                  </tr>
                </thead>
                <tbody>
                  {topButeurs.map((row, index) => {
                    const joueur = row[0];
                    const total = row[1];
                    const med = getMedaille(index);
                    return (
                      <tr key={index} className="border-b border-gray-800/30 hover:bg-white/5 transition">
                        <td className={`px-4 py-4 font-bold ${med.style}`}>{med.emoji}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-cyan-400/10 flex items-center justify-center">
                              <MdPerson className="text-cyan-400 text-sm" />
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">
                                {joueur.prenom} {joueur.nom}
                              </p>
                              <p className="text-gray-500 text-xs">{joueur.equipe?.nom}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-cyan-400 font-bold text-lg">{total}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {topButeurs.length === 0 && (
                <div className="text-center text-gray-600 py-10 text-sm">
                  Aucun buteur enregistré
                </div>
              )}
            </div>
          </div>
 
          {/* Meilleurs Passeurs */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MdBarChart className="text-purple-400 text-2xl" />
              <h2 className="text-white font-bold text-xl">MEILLEURS PASSEURS</h2>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-800/40">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/40">
                    <th className="text-left text-gray-400 text-xs font-semibold px-4 py-4 w-8">#</th>
                    <th className="text-left text-gray-400 text-xs font-semibold px-4 py-4">JOUEUR</th>
                    <th className="text-center text-purple-400 text-xs font-semibold px-4 py-4">PASSES</th>
                  </tr>
                </thead>
                <tbody>
                  {topPasseurs.map((row, index) => {
                    const joueur = row[0];
                    const total = row[1];
                    const med = getMedaille(index);
                    return (
                      <tr key={index} className="border-b border-gray-800/30 hover:bg-white/5 transition">
                        <td className={`px-4 py-4 font-bold ${med.style}`}>{med.emoji}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-purple-400/10 flex items-center justify-center">
                              <MdPerson className="text-purple-400 text-sm" />
                            </div>
                            <div>
                              <p className="text-white font-semibold text-sm">
                                {joueur.prenom} {joueur.nom}
                              </p>
                              <p className="text-gray-500 text-xs">{joueur.equipe?.nom}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-purple-400 font-bold text-lg">{total}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {topPasseurs.length === 0 && (
                <div className="text-center text-gray-600 py-10 text-sm">
                  Aucun passeur enregistré
                </div>
              )}
            </div>
          </div>
 
          {/* Meilleur Club */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <MdEmojiEvents className="text-yellow-400 text-2xl" />
              <h2 className="text-white font-bold text-xl">MEILLEUR CLUB</h2>
            </div>
            <div className="rounded-xl overflow-hidden border border-gray-800/40">
              {meilleurClub.length > 0 ? (
                <div className="p-4 space-y-3">
                  {meilleurClub.map((row, index) => {
                    const label = row[0];
                    const equipe = row[1];
                    const isChampion = label.includes('Champion');
                    const isFinaliste = label.includes('Finaliste');
                    return (
                      <div
                        key={index}
                        className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                          isChampion
                            ? 'border-yellow-500/40 bg-yellow-400/5'
                            : isFinaliste
                            ? 'border-gray-500/40 bg-gray-400/5'
                            : 'border-orange-500/40 bg-orange-400/5'
                        }`}
                      >
                        <span className={`text-sm font-semibold ${
                          isChampion ? 'text-yellow-400' : isFinaliste ? 'text-gray-300' : 'text-orange-400'
                        }`}>
                          {label}
                        </span>
                        <span className="text-white font-bold text-sm">{equipe}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-600 py-10 text-sm">
                  Tournoi non terminé
                </div>
              )}
            </div>
          </div>
 
        </div>
      )}
    </div>
  );
}