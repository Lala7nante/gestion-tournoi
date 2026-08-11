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

  const butsDomicile = buts.filter(b => b.buteur?.equipe?.id === match.equipeDomicile?.id);
  const butsExterieur = buts.filter(b => b.buteur?.equipe?.id === match.equipeExterieur?.id);

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* En-tête avec bouton retour */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/matchs')} className="text-gray-400 hover:text-cyan-400 transition">
          <MdArrowBack size={24} />
        </button>
        <div>
          <p className="text-gray-500 text-xs font-semibold tracking-widest">ANALYSE</p>
          <h1 className="text-3xl font-bold text-cyan-400">STATISTIQUES DU MATCH</h1>
        </div>
      </div>

      {/* Carte score principal */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{ backgroundColor: '#111827', border: '1px solid #1f2937' }}
      >
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full opacity-10 blur-3xl bg-cyan-400" />

        {/* Noms des équipes et score */}
        <div className="flex items-center justify-center gap-6 relative mb-4">
          <div className="flex-1 text-right">
            <p className="text-white font-bold text-2xl">{match.equipeDomicile?.nom}</p>
            <p className="text-gray-600 text-xs mt-1 tracking-widest">DOMICILE</p>
          </div>

          {/* Score centré */}
          <div className="flex flex-col items-center min-w-[160px]">
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

          <div className="flex-1 text-left">
            <p className="text-white font-bold text-2xl">{match.equipeExterieur?.nom}</p>
            <p className="text-gray-600 text-xs mt-1 tracking-widest">EXTÉRIEUR</p>
          </div>
        </div>

        {/* Buteurs alignés sous chaque équipe */}
        <div className="flex items-start justify-center gap-6 relative">

          {/* Buteurs domicile — alignés à droite */}
          <div className="flex-1 flex flex-col items-end gap-1 min-w-0">
            {butsDomicile.map((b, i) => (
              <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
                <span>{b.buteur?.prenom} {b.buteur?.nom}</span>
                <MdSportsSoccer className="text-cyan-400 shrink-0" size={13} />
                <span className="text-gray-600">{b.minute}'</span>
              </div>
            ))}
          </div>

          {/* Espaceur centré */}
          <div className="min-w-[160px]" />

          {/* Buteurs extérieur — alignés à gauche */}
          <div className="flex-1 flex flex-col items-start gap-1 min-w-0">
            {butsExterieur.map((b, i) => (
              <div key={i} className="flex items-center gap-1 text-xs text-gray-400">
                <span className="text-gray-600">{b.minute}'</span>
                <MdSportsSoccer className="text-purple-400 shrink-0" size={13} />
                <span>{b.buteur?.prenom} {b.buteur?.nom}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}