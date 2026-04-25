import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MdArrowBack, MdSportsSoccer } from 'react-icons/md';
import api from '../../api/axios';

export default function StatMatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [buts, setButs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchRes, butsRes] = await Promise.all([
          api.get(`/matchs/${id}`),
          api.get(`/matchs/${id}/buts`),
        ]);
        setMatch(matchRes.data);
        setButs(Array.isArray(butsRes.data) ? butsRes.data : []);
      } catch (err) {
        console.error('Erreur chargement stats match', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const StatBar = ({ label, valueLeft, valueRight }) => {
    const tot = valueLeft + valueRight || 1;
    const pctLeft = Math.round((valueLeft / tot) * 100);
    const pctRight = 100 - pctLeft;
    return (
      <div className="mb-5">
        <div className="flex justify-between items-center text-sm font-bold mb-2">
          <span className="text-cyan-400 w-8 text-left">{valueLeft}</span>
          <span className="text-gray-500 text-xs uppercase tracking-widest flex-1 text-center">{label}</span>
          <span className="text-purple-400 w-8 text-right">{valueRight}</span>
        </div>
        <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-800">
          <div style={{ width: `${pctLeft}%`, backgroundColor: '#22d3ee', transition: 'width 0.8s ease' }} />
          <div style={{ width: `${pctRight}%`, backgroundColor: '#a855f7', transition: 'width 0.8s ease' }} />
        </div>
      </div>
    );
  };

  const CartonBar = ({ label, valueLeft, valueRight, color }) => {
    const tot = valueLeft + valueRight || 1;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center text-sm font-bold mb-2">
          <span style={{ color }} className="w-8 text-left">{valueLeft}</span>
          <span className="text-gray-500 text-xs uppercase tracking-widest flex-1 text-center">{label}</span>
          <span style={{ color }} className="w-8 text-right">{valueRight}</span>
        </div>
        <div className="flex h-1.5 rounded-full overflow-hidden bg-gray-800">
          <div style={{ width: `${Math.round((valueLeft / tot) * 100)}%`, backgroundColor: color, transition: 'width 0.8s ease' }} />
          <div style={{ width: `${Math.round((valueRight / tot) * 100)}%`, backgroundColor: color + '55', transition: 'width 0.8s ease' }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="flex flex-col items-center gap-3">
          <MdSportsSoccer className="text-5xl text-cyan-400 animate-spin" />
          <p className="text-gray-500 text-sm">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!match) return null;

  // Buts par équipe
  const butsDomicile = buts.filter(b => b.buteur?.equipe?.id === match.equipeDomicile?.id);
  const butsExterieur = buts.filter(b => b.buteur?.equipe?.id === match.equipeExterieur?.id);

  // Stats lues directement depuis le match
  const domStats = {
    tirs:          match.tirsDomicile          || 0,
    tirsCadres:    match.tirsCadresDomicile     || 0,
    possession:    match.possessionDomicile     ?? 50,
    fautes:        match.fautesDomicile         || 0,
    cartonsJaunes: match.cartonsJaunesDomicile  || 0,
    cartonsRouges: match.cartonsRougesDomicile  || 0,
    corners:       match.cornersDomicile        || 0,
    horsJeu:       match.horsJeuDomicile        || 0,
  };

  const extStats = {
    tirs:          match.tirsExterieur          || 0,
    tirsCadres:    match.tirsCadresExterieur     || 0,
    possession:    match.possessionExterieur     ?? 50,
    fautes:        match.fautesExterieur         || 0,
    cartonsJaunes: match.cartonsJaunesExterieur  || 0,
    cartonsRouges: match.cartonsRougesExterieur  || 0,
    corners:       match.cornersExterieur        || 0,
    horsJeu:       match.horsJeuExterieur        || 0,
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/matchs')} className="text-gray-400 hover:text-cyan-400 transition">
          <MdArrowBack className="text-2xl" />
        </button>
        <div>
          <p className="text-gray-500 text-xs font-semibold tracking-widest">ANALYSE</p>
          <h1 className="text-3xl font-bold text-cyan-400">STATISTIQUES DU MATCH</h1>
        </div>
      </div>

      {/* Score Card */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{ backgroundColor: '#111827', border: '1px solid #1f2937' }}
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-10 blur-3xl bg-cyan-400" />

        <div className="flex items-center justify-center gap-6 relative">
          {/* Domicile */}
          <div className="flex-1 text-right">
            <p className="text-white font-bold text-2xl">{match.equipeDomicile?.nom}</p>
            <p className="text-gray-600 text-xs mt-1 tracking-widest">DOMICILE</p>
            <div className="mt-3 flex flex-col items-end gap-1">
              {butsDomicile.map((b, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
                  <span>{b.buteur?.prenom} {b.buteur?.nom}</span>
                  <MdSportsSoccer className="text-cyan-400 text-sm" />
                  <span className="text-gray-600">{b.minute}'</span>
                </div>
              ))}
            </div>
          </div>

          {/* Score */}
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-4">
              <span className="text-6xl font-bold text-white tabular-nums">{match.scoreDomicile}</span>
              <span className="text-gray-700 text-4xl">—</span>
              <span className="text-6xl font-bold text-white tabular-nums">{match.scoreExterieur}</span>
            </div>
            <span
              className="mt-2 text-xs font-bold px-3 py-1 rounded-full"
              style={{ backgroundColor: '#10b98120', color: '#10b981' }}
            >
              TERMINÉ
            </span>
          </div>

          {/* Extérieur */}
          <div className="flex-1 text-left">
            <p className="text-white font-bold text-2xl">{match.equipeExterieur?.nom}</p>
            <p className="text-gray-600 text-xs mt-1 tracking-widest">EXTÉRIEUR</p>
            <div className="mt-3 flex flex-col items-start gap-1">
              {butsExterieur.map((b, i) => (
                <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
                  <span className="text-gray-600">{b.minute}'</span>
                  <MdSportsSoccer className="text-purple-400 text-sm" />
                  <span>{b.buteur?.prenom} {b.buteur?.nom}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Comparaison */}
      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: '#111827', border: '1px solid #1f2937' }}
      >
        <div className="flex justify-between items-center mb-6">
          <span className="text-cyan-400 font-bold text-sm">{match.equipeDomicile?.nom}</span>
          <h2 className="text-gray-400 font-bold text-xs tracking-widest uppercase">Comparaison</h2>
          <span className="text-purple-400 font-bold text-sm">{match.equipeExterieur?.nom}</span>
        </div>

        <StatBar label="TIRS"          valueLeft={domStats.tirs}          valueRight={extStats.tirs} />
        <StatBar label="TIRS CADRÉS"   valueLeft={domStats.tirsCadres}    valueRight={extStats.tirsCadres} />
        <StatBar label="POSSESSION %"  valueLeft={domStats.possession}    valueRight={extStats.possession} />
        <StatBar label="FAUTES"        valueLeft={domStats.fautes}        valueRight={extStats.fautes} />
        <StatBar label="CORNERS"       valueLeft={domStats.corners}       valueRight={extStats.corners} />
        <StatBar label="HORS-JEU"      valueLeft={domStats.horsJeu}       valueRight={extStats.horsJeu} />

        <div className="border-t border-gray-800 my-4" />

        <CartonBar label="CARTONS JAUNES" valueLeft={domStats.cartonsJaunes} valueRight={extStats.cartonsJaunes} color="#facc15" />
        <CartonBar label="CARTONS ROUGES" valueLeft={domStats.cartonsRouges} valueRight={extStats.cartonsRouges} color="#f87171" />
      </div>

    </div>
  );
}