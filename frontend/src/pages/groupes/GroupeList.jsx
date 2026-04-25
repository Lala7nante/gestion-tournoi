import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdDelete, MdArrowBack, MdGroup, MdClose } from 'react-icons/md';
import api from '../../api/axios';

export default function GroupeList() {
  const { tournoiId } = useParams();
  const [groupes, setGroupes] = useState([]);
  const [tournoi, setTournoi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // groupeId ciblé
  const [form, setForm] = useState({ nom: '', ville: '', coach: '' });
  const [formError, setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchTournoi();
    fetchGroupes();
  }, [tournoiId]);

  const fetchTournoi = async () => {
    try {
      const res = await api.get(`/tournois/${tournoiId}`);
      setTournoi(res.data);
    } catch (err) {
      console.error('Erreur chargement tournoi', err);
    }
  };

  const fetchGroupes = async () => {
  try {
    const res = await api.get(`/tournois/${tournoiId}/groupes`);
    console.log('DATA GROUPES:', res.data); 
    const data = Array.isArray(res.data) ? res.data : res.data.content ?? [];
    const groupesAvecEquipes = await Promise.all(
      data.map(async (g) => {
        const eq = await api.get(`/groupes/${g.id}/equipes`);
        return { ...g, equipes: eq.data };
      })
    );
    setGroupes(groupesAvecEquipes);
  } catch (err) {
    console.error('Erreur chargement groupes', err);
  }
};

  const handleAddGroupe = async () => {
    setLoading(true);
    try {
      await api.post(`/tournois/${tournoiId}/groupes`);
      fetchGroupes();
    } catch (err) {
      alert(err.response?.data || 'Erreur ajout groupe');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroupe = async (id) => {
    if (!confirm('Supprimer ce groupe et toutes ses équipes ?')) return;
    try {
      await api.delete(`/tournois/${tournoiId}/groupes/${id}`);
      fetchGroupes();
    } catch (err) {
      console.error('Erreur suppression groupe', err);
    }
  };

  const handleDeleteEquipe = async (equipeId) => {
    if (!confirm('Supprimer cette équipe ?')) return;
    try {
      await api.delete(`/equipes/${equipeId}`);
      fetchGroupes();
    } catch (err) {
      console.error('Erreur suppression équipe', err);
    }
  };

  const openModal = (groupeId) => {
    setModal(groupeId);
    setForm({ nom: '', ville: '', coach: '' });
    setFormError('');
  };

  const closeModal = () => {
    setModal(null);
    setFormError('');
  };

  const handleAddEquipe = async () => {
    if (!form.nom.trim()) {
      setFormError("Le nom est obligatoire.");
      return;
    }
    try {
      await api.post(`/groupes/${modal}/equipes`, form);
      fetchGroupes();
      closeModal();
    } catch (err) {
      setFormError(err.response?.data || "Erreur ajout équipe");
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/tournois')} className="text-gray-400 hover:text-cyan-400 transition">
            <MdArrowBack className="text-2xl" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-cyan-400">GROUPES</h1>
            <p className="text-gray-400 mt-1">
              {tournoi ? tournoi.nom : '...'} — {groupes.length} / {tournoi?.nbGroupes ?? '?'} groupes
            </p>
          </div>
        </div>
        <button
          onClick={handleAddGroupe}
          disabled={loading || (tournoi && groupes.length >= tournoi.nbGroupes)}
          className="flex items-center gap-2 font-bold px-5 py-3 rounded-lg bg-cyan-400 text-black hover:bg-cyan-300 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <MdAdd className="text-xl" /> AJOUTER UN GROUPE
        </button>
      </div>

      {/* Cards Groupes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupes.map((groupe) => (
          <div
            key={groupe.id}
            className="rounded-xl p-6 flex flex-col gap-4 transition-all duration-200"
            style={{ backgroundColor: '#0f1117', border: '1px solid #1e2130', borderTop: '2px solid #00d4ff' }}
          >
            {/* Header carte */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-lg text-xl font-black text-black"
                  style={{ backgroundColor: '#00d4ff' }}
                >
                  {groupe.nom}
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Groupe {groupe.nom}</h2>
                  <p className="text-gray-400 text-xs">{groupe.equipes?.length ?? 0} équipe(s)</p>
                </div>
              </div>
              <button onClick={() => handleDeleteGroupe(groupe.id)} className="text-gray-600 hover:text-red-500 transition">
                <MdDelete className="text-xl" />
              </button>
            </div>

            {/* Liste équipes */}
            <div className="flex flex-col gap-2">
              {groupe.equipes?.length === 0 && (
                <p className="text-gray-600 text-sm text-center py-2">Aucune équipe</p>
              )}
              {groupe.equipes?.map((equipe) => (
                <div
                  key={equipe.id}
                  className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ backgroundColor: '#1a1d26' }}
                >
                  <div className="flex items-center gap-2">
                    <MdGroup style={{ color: '#00d4ff' }} />
                    <span className="text-white text-sm font-medium">{equipe.nom}</span>
                    {equipe.ville && <span className="text-gray-500 text-xs">· {equipe.ville}</span>}
                  </div>
                  <button onClick={() => handleDeleteEquipe(equipe.id)} className="text-gray-600 hover:text-red-500 transition">
                    <MdDelete className="text-base" />
                  </button>
                </div>
              ))}
            </div>

            {/* Bouton ajouter équipe */}
            <button
              onClick={() => openModal(groupe.id)}
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg border border-dashed border-gray-700 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition text-sm"
            >
              <MdAdd /> AJOUTER UNE ÉQUIPE
            </button>
          </div>
        ))}

        {groupes.length === 0 && (
          <div className="col-span-3 text-center text-gray-600 py-20">
            Aucun groupe. Cliquez sur "AJOUTER UN GROUPE" pour commencer.
          </div>
        )}
      </div>

      {/* Modal ajout équipe */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="rounded-xl p-6 w-full max-w-md" style={{ backgroundColor: '#0f1117', border: '1px solid #1e2130' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-cyan-400">NOUVELLE ÉQUIPE</h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-white transition">
                <MdClose className="text-2xl" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded bg-red-500/10 text-red-400 text-sm">{formError}</div>
            )}

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Nom de l'équipe *"
                value={form.nom}
                onChange={(e) => setForm({ ...form, nom: e.target.value })}
                className="w-full px-4 py-2 rounded bg-[#1a1d26] border border-gray-700 text-white focus:border-cyan-400 outline-none"
              />
              <input
                type="text"
                placeholder="Ville"
                value={form.ville}
                onChange={(e) => setForm({ ...form, ville: e.target.value })}
                className="w-full px-4 py-2 rounded bg-[#1a1d26] border border-gray-700 text-white focus:border-cyan-400 outline-none"
              />
              <input
                type="text"
                placeholder="Coach"
                value={form.coach}
                onChange={(e) => setForm({ ...form, coach: e.target.value })}
                className="w-full px-4 py-2 rounded bg-[#1a1d26] border border-gray-700 text-white focus:border-cyan-400 outline-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2 rounded border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transition"
              >
                ANNULER
              </button>
              <button
                onClick={handleAddEquipe}
                className="flex-1 py-2 rounded bg-cyan-400 text-black font-bold hover:bg-cyan-300 transition"
              >
                CRÉER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}