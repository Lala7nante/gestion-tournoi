import { useEffect, useState } from 'react';
import { MdBarChart, MdRefresh, MdSportsSoccer, MdPerson, MdEmojiEvents } from 'react-icons/md';
import { TbTournament } from 'react-icons/tb';
import api from '../../api/axios';

export default function StatistiquePage() {
  const [activeTab, setActiveTab] = useState('TOURNOI');

  // États TOURNOI
  const [topButeurs, setTopButeurs] = useState([]);
  const [topPasseurs, setTopPasseurs] = useState([]);
  const [meilleurClub, setMeilleurClub] = useState([]);

  // États LIGUE
  const [tournoisLigue, setTournoisLigue] = useState([]);
  const [selectedLigue, setSelectedLigue] = useState('');
  const [ligueButeurs, setLigueButeurs] = useState([]);
  const [liguePasseurs, setLiguePasseurs] = useState([]);
  const [ligueTopEquipes, setLigueTopEquipes] = useState([]);

  const [loading, setLoading] = useState(true);

  const TOURNOI_ID = 2;

  useEffect(() => {
    fetchStatsTournoi();
    fetchTournoisLigue();
  }, []);

  useEffect(() => {
    if (activeTab === 'LIGUE' && selectedLigue) {
      fetchStatsLigue(selectedLigue);
    }
  }, [activeTab, selectedLigue]);

  const fetchStatsTournoi = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/statistiques/tournoi/${TOURNOI_ID}`);
      const data = res.data;
      setTopButeurs(data.topButeurs || []);
      setTopPasseurs(data.topPasseurs || []);
      setMeilleurClub(data.meilleurClub || []);
    } catch (err) {
      console.error('Erreur chargement statistiques tournoi', err);
    } finally {
      setLoading(false);
    }
  };

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

const fetchStatsLigue = async (ligueId) => {
    setLoading(true);
    try {
      const [statsRes, classementRes] = await Promise.all([
        api.get(`/statistiques/ligue/${ligueId}`), 
        api.get(`/matchs/ligue/${ligueId}/classement`),
      ]);
      const data = statsRes.data;
      setLigueButeurs(data.topButeurs || []);
      setLiguePasseurs(data.topPasseurs || []);
      setLigueTopEquipes(
        Array.isArray(classementRes.data) ? classementRes.data.slice(0, 5) : []
      );
    } catch (err) {
      console.error('Erreur chargement statistiques ligue', err);
    } finally {
      setLoading(false);
    }
  };

  const handleActualiser = () => {
    if (activeTab === 'TOURNOI') fetchStatsTournoi();
    else if (selectedLigue) fetchStatsLigue(selectedLigue);
  };

  const getMedaille = (index) => {
    switch (index) {
      case 0: return { emoji: '🥇', style: 'text-yellow-400 text-xl' };
      case 1: return { emoji: '🥈', style: 'text-gray-300 text-xl' };
      case 2: return { emoji: '🥉', style: 'text-orange-400 text-xl' };
      default: return { emoji: `${index + 1}`, style: 'text-gray-600 text-sm' };
    }
  };

  const getRangStyle = (index) => {
    switch (index) {
      case 0: return 'text-yellow-400';
      case 1: return 'text-gray-300';
      case 2: return 'text-orange-400';
      default: return 'text-gray-500';
    }
  };

  const TableJoueurs = ({ data, label, couleur, icon: Icon }) => (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Icon style={{ color: couleur }} className="text-2xl" />
        <h2 className="text-white font-bold text-xl">{label}</h2>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-800/40">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800/40">
              <th className="text-left text-gray-400 text-xs font-semibold px-4 py-4 w-8">#</th>
              <th className="text-left text-gray-400 text-xs font-semibold px-4 py-4">JOUEUR</th>
              <th className="text-center text-xs font-semibold px-4 py-4" style={{ color: couleur }}>
                {label === 'MEILLEURS BUTEURS' ? 'BUTS' : 'PASSES'}
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => {
              const joueur = row[0];
              const total = row[1];
              const med = getMedaille(index);
              return (
                <tr key={index} className="border-b border-gray-800/30 hover:bg-white/5 transition">
                  <td className={`px-4 py-4 font-bold ${med.style}`}>{med.emoji}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: couleur + '1a' }}>
                        <MdPerson style={{ color: couleur }} className="text-sm" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">{joueur.prenom} {joueur.nom}</p>
                        <p className="text-gray-500 text-xs">{joueur.equipe?.nom}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span style={{ color: couleur }} className="font-bold text-lg">{total}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {data.length === 0 && (
          <div className="text-center text-gray-600 py-10 text-sm">Aucun enregistré</div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* En-tête */}
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
          onClick={handleActualiser}
          className="flex items-center gap-2 border border-gray-700 text-gray-400 font-bold px-5 py-3 rounded-lg hover:border-cyan-400 hover:text-cyan-400 transition"
        >
          <MdRefresh className="text-xl" />
          ACTUALISER
        </button>
      </div>

      {/* Tabs TOURNOI / LIGUE */}
      <div className="flex gap-2 mb-8">
        {[
          { key: 'TOURNOI', label: 'TOURNOI', color: '#00d4ff' },
          { key: 'LIGUE',   label: 'LIGUE',   color: '#a855f7' },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className="px-5 py-2 rounded-xl text-sm font-bold transition"
            style={{
              backgroundColor: activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.05)',
              color: activeTab === tab.key ? (tab.key === 'TOURNOI' ? '#000' : '#fff') : '#6b7280',
              border: `1px solid ${activeTab === tab.key ? tab.color : 'rgba(255,255,255,0.06)'}`,
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center text-gray-600 py-20">Chargement des statistiques...</div>
      ) : (
        <>
          {/* TAB TOURNOI */}
          {activeTab === 'TOURNOI' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <TableJoueurs
                data={topButeurs}
                label="MEILLEURS BUTEURS"
                couleur="#22d3ee"
                icon={MdSportsSoccer}
              />

              <TableJoueurs
                data={topPasseurs}
                label="MEILLEURS PASSEURS"
                couleur="#a855f7"
                icon={MdBarChart}
              />

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
                          <div key={index}
                            className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                              isChampion
                                ? 'border-yellow-500/40 bg-yellow-400/5'
                                : isFinaliste
                                ? 'border-gray-500/40 bg-gray-400/5'
                                : 'border-orange-500/40 bg-orange-400/5'
                            }`}>
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
                    <div className="text-center text-gray-600 py-10 text-sm">Tournoi non terminé</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB LIGUE */}
          {activeTab === 'LIGUE' && (
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
                <div className="text-center text-gray-600 py-20">Aucune ligue trouvée.</div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                  <TableJoueurs
                    data={ligueButeurs}
                    label="MEILLEURS BUTEURS"
                    couleur="#22d3ee"
                    icon={MdSportsSoccer}
                  />

                  <TableJoueurs
                    data={liguePasseurs}
                    label="MEILLEURS PASSEURS"
                    couleur="#a855f7"
                    icon={MdBarChart}
                  />

                  {/* Top 5 Équipes */}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <TbTournament className="text-purple-400 text-2xl" />
                      <h2 className="text-white font-bold text-xl">TOP 5 ÉQUIPES</h2>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-purple-500/20">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-purple-500/20 bg-white/5">
                            <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3 w-8">#</th>
                            <th className="text-left text-gray-400 text-xs font-semibold px-4 py-3">ÉQUIPE</th>
                            <th className="text-center text-gray-400 text-xs font-semibold px-4 py-3">J</th>
                            <th className="text-center text-gray-400 text-xs font-semibold px-4 py-3">DIFF</th>
                            <th className="text-center text-purple-400 text-xs font-semibold px-4 py-3">PTS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ligueTopEquipes.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="text-center text-gray-600 py-10 text-sm">
                                Aucun match terminé
                              </td>
                            </tr>
                          ) : (
                            ligueTopEquipes.map((row, index) => {
                              const diff = row.diff ?? 0;
                              return (
                                <tr key={row.equipeId}
                                  className="border-b border-gray-700/30 hover:bg-white/5 transition">
                                  <td className={`px-4 py-4 font-bold text-lg ${getRangStyle(index)}`}>
                                    {index + 1}
                                  </td>
                                  <td className="px-4 py-4 text-white font-semibold text-sm">{row.equipeNom}</td>
                                  <td className="px-4 py-4 text-center text-gray-300 text-sm">{row.j}</td>
                                  <td className={`px-4 py-4 text-center text-sm font-semibold ${
                                    diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'
                                  }`}>
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
                  </div>

                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}