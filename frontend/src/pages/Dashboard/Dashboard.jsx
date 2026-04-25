import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MdEmojiEvents, MdGroup, MdSportsSoccer,
  MdLeaderboard, MdStar, MdPerson, MdCalendarToday,
  MdArrowForward, MdTrendingUp
} from 'react-icons/md';
import api from '../../api/axios';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(err => console.error('Erreur dashboard', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-3">
        <MdSportsSoccer className="text-5xl text-cyan-400 animate-spin" />
        <p className="text-gray-500 text-sm">Chargement...</p>
      </div>
    </div>
  );

  const statCards = [
    { label: 'TOURNOIS', value: data?.nbTournois, icon: <MdEmojiEvents />, color: '#00d4ff', bg: '#00d4ff15' },
    { label: 'GROUPES',  value: data?.nbGroupes,  icon: <MdGroup />,       color: '#a855f7', bg: '#a855f715' },
    { label: 'ÉQUIPES',  value: data?.nbEquipes,  icon: <MdGroup />,       color: '#f59e0b', bg: '#f59e0b15' },
    { label: 'MATCHS',   value: data?.nbMatchs,   icon: <MdSportsSoccer />,color: '#10b981', bg: '#10b98115' },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-gray-500 text-xs font-semibold tracking-widest mb-1">VUE D'ENSEMBLE</p>
          <h1
            className="text-4xl font-bold bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)' }}
          >
            DASHBOARD
          </h1>
        </div>
        <div className="flex items-center gap-2 text-gray-600 text-xs">
          <MdCalendarToday className="text-cyan-400" />
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
            style={{ backgroundColor: '#111827', border: `1px solid ${s.color}25` }}
          >
            {/* Glow cercle décoratif */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-20 blur-xl"
              style={{ backgroundColor: s.color }}
            />
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
              style={{ backgroundColor: s.bg, color: s.color }}
            >
              {s.icon}
            </div>
            <div>
              <p className="text-gray-500 text-xs font-semibold tracking-widest">{s.label}</p>
              <p className="text-white text-4xl font-bold leading-tight">{s.value ?? 0}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Highlights : Top Buteur / Homme du tournoi / Champions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top Buteur */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ backgroundColor: '#111827', border: '1px solid #f59e0b25' }}
        >
          <div
            className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: '#f59e0b' }}
          />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b20' }}>
              <MdStar style={{ color: '#f59e0b', fontSize: 18 }} />
            </div>
            <h3 className="text-gray-400 font-bold text-xs tracking-widest">TOP BUTEUR</h3>
          </div>
          {data?.topButeur ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                <MdPerson />
              </div>
              <div>
                <p className="text-white font-bold text-base">{data.topButeur.joueur?.nom}</p>
                <p className="text-yellow-400 text-sm font-semibold">{data.topButeur.buts} buts ⚽</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MdPerson /> Aucune donnée
            </div>
          )}
        </div>

        {/* Homme du tournoi */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ backgroundColor: '#111827', border: '1px solid #00d4ff25' }}
        >
          <div
            className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: '#00d4ff' }}
          />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00d4ff20' }}>
              <MdPerson style={{ color: '#00d4ff', fontSize: 18 }} />
            </div>
            <h3 className="text-gray-400 font-bold text-xs tracking-widest">HOMME DU TOURNOI</h3>
          </div>
          {data?.hommeTournoi ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: '#00d4ff20', color: '#00d4ff' }}>
                <MdPerson />
              </div>
              <div>
                <p className="text-white font-bold text-base">{data.hommeTournoi.joueur?.nom}</p>
                <p className="text-cyan-400 text-sm">{data.hommeTournoi.buts} buts · {data.hommeTournoi.passesDecisives} passes</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MdPerson /> Aucune donnée
            </div>
          )}
        </div>

        {/* Champions */}
        <div
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{ backgroundColor: '#111827', border: '1px solid #f59e0b25' }}
        >
          <div
            className="absolute -bottom-6 -right-6 w-24 h-24 rounded-full opacity-10 blur-2xl"
            style={{ backgroundColor: '#f59e0b' }}
          />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#f59e0b20' }}>
              <MdEmojiEvents style={{ color: '#f59e0b', fontSize: 18 }} />
            </div>
            <h3 className="text-gray-400 font-bold text-xs tracking-widest">CHAMPIONS</h3>
          </div>
          {data?.champions && data.champions.length > 0 ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
                style={{ backgroundColor: '#f59e0b20', color: '#f59e0b' }}>
                <MdEmojiEvents />
              </div>
              <div>
                <p className="text-white font-bold text-base">{data.champions[0]?.equipe?.nom}</p>
                <p className="text-yellow-400 text-sm font-semibold">{data.champions[0]?.points} pts 🏆</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-gray-600 text-sm">
              <MdLeaderboard /> Aucune donnée
            </div>
          )}
        </div>
      </div>

      {/* Derniers résultats + Prochains matchs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Derniers résultats */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#111827', border: '1px solid #10b98125' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#10b98120' }}>
                <MdTrendingUp style={{ color: '#10b981', fontSize: 18 }} />
              </div>
              <h3 className="text-gray-400 font-bold text-xs tracking-widest">DERNIERS RÉSULTATS</h3>
            </div>
            <button
              onClick={() => navigate('/matchs')}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-cyan-400 transition"
            >
              Voir tout <MdArrowForward />
            </button>
          </div>

          {data?.derniersResultats?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.derniersResultats.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition"
                  onClick={() => navigate(`/matchs/${m.id}/edit`)}
                >
                  <span className="text-gray-300 text-sm flex-1 text-right">{m.equipeDomicile?.nom}</span>
                  <span
                    className="font-bold px-4 py-1 rounded-lg text-sm mx-3 tabular-nums"
                    style={{ backgroundColor: '#10b98120', color: '#10b981' }}
                  >
                    {m.butsDomicile ?? m.scoreDomicile} — {m.butsExterieur ?? m.scoreExterieur}
                  </span>
                  <span className="text-gray-300 text-sm flex-1 text-left">{m.equipeExterieur?.nom}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm text-center py-6">Aucun résultat disponible</p>
          )}
        </div>

        {/* Prochains matchs */}
        <div
          className="rounded-2xl p-5"
          style={{ backgroundColor: '#111827', border: '1px solid #00d4ff25' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#00d4ff20' }}>
                <MdCalendarToday style={{ color: '#00d4ff', fontSize: 18 }} />
              </div>
              <h3 className="text-gray-400 font-bold text-xs tracking-widest">PROCHAINS MATCHS</h3>
            </div>
            <button
              onClick={() => navigate('/matchs')}
              className="flex items-center gap-1 text-xs text-gray-600 hover:text-cyan-400 transition"
            >
              Voir tout <MdArrowForward />
            </button>
          </div>

          {data?.prochainsMatchs?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {data.prochainsMatchs.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition"
                  onClick={() => navigate(`/matchs/${m.id}/edit`)}
                >
                  <span className="text-gray-300 text-sm flex-1 text-right">{m.equipeDomicile?.nom}</span>
                  <span
                    className="text-xs px-3 py-1 rounded-lg font-bold mx-3 whitespace-nowrap"
                    style={{ backgroundColor: '#00d4ff15', color: '#00d4ff' }}
                  >
                    {m.dateMatch}
                  </span>
                  <span className="text-gray-300 text-sm flex-1 text-left">{m.equipeExterieur?.nom}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm text-center py-6">Aucun match prévu</p>
          )}
        </div>
      </div>

    </div>
  );
}