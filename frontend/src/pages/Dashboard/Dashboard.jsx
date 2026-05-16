import { useEffect, useState } from 'react';
import {
  MdEmojiEvents, MdGroup, MdSportsSoccer,
  MdLeaderboard, MdStar, MdPerson, MdCalendarToday,
  MdTrendingUp, MdChevronRight, MdClose, MdAccessTime,
  MdStadium, MdOutlineEmojiEvents
} from 'react-icons/md';
import { IoTrophyOutline, IoFootballOutline, IoPeopleOutline } from 'react-icons/io5';
import { TbBallFootball, TbBallFootballOff, TbTournament } from 'react-icons/tb';
import { HiOutlineUsers, HiOutlineCalendar, HiOutlineStar } from 'react-icons/hi2';
import { RiGroupLine, RiMedalLine, RiBarChartLine } from 'react-icons/ri';
import api from '../../api/axios';

// ─── Modal Détail Match ──────────────────────────────────────────────────────
function MatchDetailModal({ match, onClose }) {
  if (!match) return null;

  const buteursDOM = match.buteurs?.filter(b =>
    b.equipeId === match.equipeDomicile?.id || b.equipe === 'domicile'
  ) || [];
  const buteursEXT = match.buteurs?.filter(b =>
    b.equipeId === match.equipeExterieur?.id || b.equipe === 'exterieur'
  ) || [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          backgroundColor: '#0d1117',
          border: '1px solid rgba(0,212,255,0.18)',
          boxShadow: '0 0 60px rgba(0,212,255,0.06)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-lg flex items-center justify-center transition"
          style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#6b7280' }}
        >
          <MdClose size={16} />
        </button>

        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="text-white font-black text-lg text-center leading-tight">
                {match.equipeDomicile?.nom}
              </p>
              {match.statut === 'termine' && buteursDOM.length > 0 && (
                <div className="flex flex-col items-center gap-1 mt-1">
                  {buteursDOM.map((b, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <IoFootballOutline size={11} style={{ color: '#10b981' }} />
                      <span className="text-gray-400 text-xs">{b.joueur?.nom || b.nom}</span>
                      {b.minute && <span className="text-gray-600 text-xs">{b.minute}'</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center shrink-0 px-2 gap-2">
              {match.statut === 'termine' ? (
                <>
                  <div className="text-5xl font-black tabular-nums tracking-tight" style={{ color: '#ffffff' }}>
                    {match.butsDomicile ?? match.scoreDomicile}
                    <span style={{ color: '#374151', margin: '0 8px' }}>—</span>
                    {match.butsExterieur ?? match.scoreExterieur}
                  </div>
                  <p className="text-gray-500 text-xs">Score final</p>
                  <div
                    className="px-3 py-0.5 rounded-full text-xs font-black tracking-widest"
                    style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}
                  >
                    TERMINÉ
                  </div>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-gray-600">VS</span>
                  <div
                    className="px-3 py-0.5 rounded-full text-xs font-black tracking-widest"
                    style={{ backgroundColor: 'rgba(0,212,255,0.12)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.25)' }}
                  >
                    À VENIR
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="text-white font-black text-lg text-center leading-tight">
                {match.equipeExterieur?.nom}
              </p>
              {match.statut === 'termine' && buteursEXT.length > 0 && (
                <div className="flex flex-col items-center gap-1 mt-1">
                  {buteursEXT.map((b, i) => (
                    <div key={i} className="flex items-center gap-1">
                      {b.minute && <span className="text-gray-600 text-xs">{b.minute}'</span>}
                      <span className="text-gray-400 text-xs">{b.joueur?.nom || b.nom}</span>
                      <IoFootballOutline size={11} style={{ color: '#10b981' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {(match.dateMatch || match.terrain) && (
          <div
            className="flex items-center justify-center gap-4 px-5 py-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}
          >
            {match.dateMatch && (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <HiOutlineCalendar size={13} style={{ color: '#4b5563' }} />
                {match.dateMatch}
              </div>
            )}
            {match.terrain && (
              <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <MdStadium size={13} style={{ color: '#4b5563' }} />
                {match.terrain}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Mini Top 5 Widget ───────────────────────────────────────────────────────
function MiniTopList({ title, icon, items, accentColor, accentBg, statLabel }) {
  const medals = ['🥇', '🥈', '🥉'];
  return (
    <div
      className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ backgroundColor: '#0d1117', border: `1px solid ${accentBg}` }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: accentBg }}>
          {icon}
        </div>
        <span className="text-gray-400 font-bold text-xs tracking-widest">{title}</span>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-1">
          {items.slice(0, 5).map((row, index) => {
            const joueur = row[0];
            const total = row[1];
            return (
              <div
                key={index}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition"
                style={{ backgroundColor: index === 0 ? accentBg : 'transparent' }}
              >
                <span className="text-sm w-5 text-center shrink-0">
                  {index < 3
                    ? medals[index]
                    : <span className="text-gray-600 text-xs font-bold">{index + 1}</span>
                  }
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold truncate">
                    {joueur.prenom} {joueur.nom}
                  </p>
                  <p className="text-gray-600 text-xs truncate">{joueur.equipe?.nom}</p>
                </div>
                <span className="font-black text-sm shrink-0" style={{ color: accentColor }}>
                  {total}
                  <span className="text-gray-600 text-xs font-normal ml-1">{statLabel}</span>
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-6 gap-2">
          <MdPerson size={24} style={{ color: '#374151' }} />
          <p className="text-gray-600 text-xs">Aucune donnée</p>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard ───────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTournoi, setSelectedTournoi] = useState(null);
  const [tournois, setTournois] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [stats, setStats] = useState({ topButeurs: [], topPasseurs: [] });
  const [meilleurButeur, setMeilleurButeur] = useState(null);
  const [hommeTournoi, setHommeTournoi] = useState(null);

  useEffect(() => {
    api.get('/tournois')
      .then(res => {
        setTournois(res.data);
        if (res.data.length > 0) setSelectedTournoi(res.data[0].id);
      })
      .catch(err => console.error('Erreur chargement tournois', err));
  }, []);

  useEffect(() => {
    if (!selectedTournoi) return;
    setLoading(true);
    setMeilleurButeur(null);
    setHommeTournoi(null);

    Promise.all([
      api.get(`/dashboard?tournoi=${selectedTournoi}`),
      api.get(`/statistiques/tournoi/${selectedTournoi}`),
    ])
      .then(([dashRes, statsRes]) => {
        setData(dashRes.data);
        const buteurs = statsRes.data.topButeurs || [];
        const passeurs = statsRes.data.topPasseurs || [];
        setStats({ topButeurs: buteurs, topPasseurs: passeurs });

        // ✅ Meilleur Buteur = 1er du topButeurs
        if (buteurs.length > 0) {
          const joueur = buteurs[0][0];
          const total = buteurs[0][1];
          setMeilleurButeur({
            nom: `${joueur.prenom} ${joueur.nom}`,
            buts: total,
            equipe: joueur.equipe?.nom,
          });
        }

        // ✅ Homme du Tournoi = 1er du topPasseurs
        if (passeurs.length > 0) {
          const joueur = passeurs[0][0];
          const total = passeurs[0][1];
          setHommeTournoi({
            nom: `${joueur.prenom} ${joueur.nom}`,
            score: total,
            equipe: joueur.equipe?.nom,
          });
        }
      })
      .catch(err => console.error('Erreur dashboard', err))
      .finally(() => setLoading(false));
  }, [selectedTournoi]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <IoFootballOutline className="text-5xl text-cyan-400 animate-spin" />
        <p className="text-gray-500 text-xs tracking-widest font-semibold">CHARGEMENT</p>
      </div>
    </div>
  );

  const statCards = [
    {
      label: 'TOURNOIS', value: data?.nbTournois,
      icon: <TbTournament size={22} />,
      color: '#00d4ff', bg: 'rgba(0,212,255,0.08)', border: 'rgba(0,212,255,0.15)',
    },
    {
      label: 'GROUPES', value: data?.nbGroupes,
      icon: <RiGroupLine size={22} />,
      color: '#a855f7', bg: 'rgba(168,85,247,0.08)', border: 'rgba(168,85,247,0.15)',
    },
    {
      label: 'EQUIPES', value: data?.nbEquipes,
      icon: <HiOutlineUsers size={22} />,
      color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.15)',
    },
    {
      label: 'MATCHS', value: data?.nbMatchs,
      icon: <IoFootballOutline size={22} />,
      color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.15)',
    },
  ];

  return (
    <>
      {selectedMatch && (
        <MatchDetailModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}

      <div className="space-y-5">

        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-gray-600 text-xs font-semibold tracking-widest mb-1">VUE D'ENSEMBLE</p>
            <h1
              className="text-4xl font-black tracking-tight bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(135deg, #00d4ff 0%, #a855f7 100%)' }}
            >
              DASHBOARD
            </h1>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <TbTournament size={14} style={{ color: '#00d4ff' }} />
              <select
                value={selectedTournoi || ''}
                onChange={(e) => setSelectedTournoi(e.target.value)}
                className="text-sm font-semibold text-white rounded-xl px-4 py-2 outline-none cursor-pointer transition"
                style={{ backgroundColor: '#0d1117', border: '1px solid rgba(0,212,255,0.2)', color: '#fff' }}
              >
                <option value="">Sélectionner</option>
                {tournois.map((t) => (
                  <option key={t.id} value={t.id}>{t.nom}</option>
                ))}
              </select>
            </div>
            <div
              className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl"
              style={{ backgroundColor: '#0d1117', border: '1px solid rgba(255,255,255,0.06)', color: '#4b5563' }}
            >
              <HiOutlineCalendar size={13} style={{ color: '#6b7280' }} />
              {new Date().toLocaleDateString('fr-FR', {
                weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Section 1 : Highlights */}
        <div>
          <p className="text-gray-600 text-xs font-bold tracking-widest mb-3 flex items-center gap-2">
            <RiMedalLine size={13} />
            MEILLEUR BUTEUR / HOMME DU TOURNOI / CHAMPIONS
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">

            {/* Meilleur Buteur */}
            <div
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{ backgroundColor: '#0d1117', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-15 blur-2xl" style={{ backgroundColor: '#f59e0b' }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}>
                  <HiOutlineStar size={14} style={{ color: '#f59e0b' }} />
                </div>
                <h3 className="text-gray-500 font-bold text-xs tracking-widest">MEILLEUR BUTEUR</h3>
              </div>
              {meilleurButeur ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                    <MdPerson size={22} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{meilleurButeur.nom}</p>
                    <p className="text-gray-500 text-xs mb-0.5">{meilleurButeur.equipe}</p>
                    <p className="text-yellow-400 text-xs font-semibold flex items-center gap-1">
                      <IoFootballOutline size={12} /> {meilleurButeur.buts} buts
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-700 text-xs">
                  <MdPerson size={16} /> Aucune donnée
                </div>
              )}
            </div>

            {/* Homme du Tournoi */}
            <div
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{ backgroundColor: '#0d1117', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-15 blur-2xl" style={{ backgroundColor: '#00d4ff' }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0,212,255,0.1)' }}>
                  <RiMedalLine size={14} style={{ color: '#00d4ff' }} />
                </div>
                <h3 className="text-gray-500 font-bold text-xs tracking-widest">HOMME DU TOURNOI</h3>
              </div>
              {hommeTournoi ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}>
                    <MdPerson size={22} />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{hommeTournoi.nom}</p>
                    <p className="text-gray-500 text-xs mb-0.5">{hommeTournoi.equipe}</p>
                    <p className="text-cyan-400 text-xs font-semibold flex items-center gap-1">
                      <RiMedalLine size={12} /> {hommeTournoi.score} passes
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-700 text-xs">
                  <MdPerson size={16} /> Aucune donnée
                </div>
              )}
            </div>

            {/* Champions */}
            <div
              className="rounded-2xl p-4 relative overflow-hidden"
              style={{ backgroundColor: '#0d1117', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full opacity-15 blur-2xl" style={{ backgroundColor: '#f59e0b' }} />
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(245,158,11,0.12)' }}>
                  <IoTrophyOutline size={14} style={{ color: '#f59e0b' }} />
                </div>
                <h3 className="text-gray-500 font-bold text-xs tracking-widest">CHAMPIONS</h3>
              </div>
              {data?.champions?.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {data.champions.map((c, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-gray-400 text-xs">{c[0]}</span>
                      <span className="text-white font-bold text-sm">{c[1]}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-gray-700 text-xs">
                  <MdLeaderboard size={16} /> Aucune donnée
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Section 2 : Top 5 Buteurs & Passeurs */}
        <div>
          <p className="text-gray-600 text-xs font-bold tracking-widest mb-3 flex items-center gap-2">
            <MdTrendingUp size={13} />
            TOP 5 BUTEURS / PASSEURS
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <MiniTopList
              title="TOP 5 BUTEURS"
              icon={<IoFootballOutline size={14} style={{ color: '#00d4ff' }} />}
              items={stats.topButeurs}
              accentColor="#00d4ff"
              accentBg="rgba(0,212,255,0.08)"
              statLabel="buts"
            />
            <MiniTopList
              title="TOP 5 PASSEURS"
              icon={<RiBarChartLine size={14} style={{ color: '#a855f7' }} />}
              items={stats.topPasseurs}
              accentColor="#a855f7"
              accentBg="rgba(168,85,247,0.08)"
              statLabel="passes"
            />
          </div>
        </div>

        {/* Section 3 : Matchs */}
        <div>
          <p className="text-gray-600 text-xs font-bold tracking-widest mb-3 flex items-center gap-2">
            <IoFootballOutline size={13} />
            MATCHS
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Derniers résultats */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: '#0d1117', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(16,185,129,0.12)' }}>
                  <RiBarChartLine size={15} style={{ color: '#10b981' }} />
                </div>
                <span className="text-gray-400 font-bold text-xs tracking-widest">DERNIERS RESULTATS</span>
              </div>
              {data?.derniersResultats?.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {data.derniersResultats.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition group"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => setSelectedMatch({ ...m, statut: 'termine' })}
                    >
                      <span className="text-gray-300 text-sm flex-1 text-right font-medium truncate pr-2">
                        {m.equipeDomicile?.nom}
                      </span>
                      <div
                        className="font-black text-sm px-3 py-1 rounded-lg tabular-nums shrink-0"
                        style={{ backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981' }}
                      >
                        {m.butsDomicile ?? m.scoreDomicile} — {m.butsExterieur ?? m.scoreExterieur}
                      </div>
                      <span className="text-gray-300 text-sm flex-1 text-left font-medium truncate pl-2">
                        {m.equipeExterieur?.nom}
                      </span>
                      <MdChevronRight size={16} className="text-gray-700 group-hover:text-gray-500 shrink-0 ml-1 transition" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <TbBallFootballOff size={28} style={{ color: '#374151' }} />
                  <p className="text-gray-600 text-xs">Aucun résultat disponible</p>
                </div>
              )}
            </div>

            {/* Prochains matchs */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: '#0d1117', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(0,212,255,0.1)' }}>
                  <HiOutlineCalendar size={15} style={{ color: '#00d4ff' }} />
                </div>
                <span className="text-gray-400 font-bold text-xs tracking-widest">PROCHAINS MATCHS</span>
              </div>
              {data?.prochainsMatchs?.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {data.prochainsMatchs.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition group"
                      style={{ backgroundColor: 'transparent' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      onClick={() => setSelectedMatch({ ...m, statut: 'a_venir' })}
                    >
                      <span className="text-gray-300 text-sm flex-1 text-right font-medium truncate pr-2">
                        {m.equipeDomicile?.nom}
                      </span>
                      <div
                        className="text-xs px-3 py-1 rounded-lg font-bold shrink-0 tabular-nums"
                        style={{ backgroundColor: 'rgba(0,212,255,0.1)', color: '#00d4ff' }}
                      >
                        {m.dateMatch}
                      </div>
                      <span className="text-gray-300 text-sm flex-1 text-left font-medium truncate pl-2">
                        {m.equipeExterieur?.nom}
                      </span>
                      <MdChevronRight size={16} className="text-gray-700 group-hover:text-gray-500 shrink-0 ml-1 transition" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <HiOutlineCalendar size={28} style={{ color: '#374151' }} />
                  <p className="text-gray-600 text-xs">Aucun match prévu</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 4 : Stat Cards */}
        <div>
          <p className="text-gray-600 text-xs font-bold tracking-widest mb-3 flex items-center gap-2">
            <TbTournament size={13} />
            TOURNOI / EQUIPES / GROUPES / MATCHS
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {statCards.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden"
                style={{ backgroundColor: '#0d1117', border: `1px solid ${s.border}` }}
              >
                <div className="absolute -top-5 -right-5 w-16 h-16 rounded-full blur-2xl opacity-40" style={{ backgroundColor: s.color }} />
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: s.bg, color: s.color }}>
                  {s.icon}
                </div>
                <div>
                  <p className="text-gray-600 text-xs font-bold tracking-widest">{s.label}</p>
                  <p className="text-white text-3xl font-black leading-tight">{s.value ?? 0}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}