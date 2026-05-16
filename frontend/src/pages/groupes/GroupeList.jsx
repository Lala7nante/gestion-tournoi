import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MdAdd, MdDelete, MdArrowBack, MdGroup, MdClose } from 'react-icons/md';
import api from '../../api/axios';

export default function GroupeList() {
  const { tournoiId } = useParams();
  const [groupes, setGroupes] = useState([]);
  const [tournoi, setTournoi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);
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
    <div
      className="min-h-screen"
      style={{ backgroundColor: '#0a0a0f' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/tournois')}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#6b7280' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.1)'; e.currentTarget.style.color = '#00d4ff'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#6b7280'; }}
          >
            <MdArrowBack className="text-xl" />
          </button>
          <div>
            <p className="text-gray-600 text-xs font-semibold tracking-widest mb-0.5">TOURNOI</p>
            <h1
              className="text-4xl font-bold"
              style={{
                background: 'linear-gradient(90deg, #00d4ff 0%, #7c3aed 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              GROUPES
            </h1>
            <p className="text-gray-500 mt-0.5 text-sm">
              {tournoi ? tournoi.nom : '...'} —{' '}
              <span className="text-cyan-400 font-semibold">{groupes.length}</span>
              {' '}/ {tournoi?.nbGroupes ?? '?'} groupes
            </p>
          </div>
        </div>

        <button
          onClick={handleAddGroupe}
          disabled={loading || (tournoi && groupes.length >= tournoi.nbGroupes)}
          className="flex items-center gap-2 font-bold px-5 py-3 rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: '#00d4ff', color: '#000' }}
          onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.backgroundColor = '#00bfea'; }}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00d4ff'}
        >
          <MdAdd className="text-xl" /> AJOUTER UN GROUPE
        </button>
      </div>

      {/* Cards Groupes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupes.map((groupe) => (
          <div
            key={groupe.id}
            className="rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              borderTop: '2px solid #00d4ff',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
          >
            {/* Header carte */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex items-center justify-center w-12 h-12 rounded-xl text-xl font-black text-black shrink-0"
                  style={{ backgroundColor: '#00d4ff', boxShadow: '0 0 16px rgba(0,212,255,0.3)' }}
                >
                  {groupe.nom}
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg">Groupe {groupe.nom}</h2>
                  <p className="text-gray-500 text-xs">
                    <span className="text-cyan-400 font-semibold">{groupe.equipes?.length ?? 0}</span> équipe(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteGroupe(groupe.id)}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition"
                style={{ backgroundColor: 'rgba(248,113,113,0.08)', color: '#6b7280' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.15)'; e.currentTarget.style.color = '#f87171'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(248,113,113,0.08)'; e.currentTarget.style.color = '#6b7280'; }}
              >
                <MdDelete className="text-base" />
              </button>
            </div>

            {/* Séparateur */}
            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />

            {/* Liste équipes */}
            <div className="flex flex-col gap-2">
              {groupe.equipes?.length === 0 && (
                <p className="text-gray-600 text-xs text-center py-3 italic">Aucune équipe dans ce groupe</p>
              )}
              {groupe.equipes?.map((equipe) => (
                <div
                  key={equipe.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl transition"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MdGroup style={{ color: '#00d4ff', flexShrink: 0 }} />
                    <span className="text-white text-sm font-medium truncate">{equipe.nom}</span>
                    {equipe.ville && (
                      <span className="text-gray-600 text-xs shrink-0">· {equipe.ville}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEquipe(equipe.id)}
                    className="w-6 h-6 rounded flex items-center justify-center transition shrink-0 ml-2"
                    style={{ color: '#4b5563' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                    onMouseLeave={e => e.currentTarget.style.color = '#4b5563'}
                  >
                    <MdDelete className="text-base" />
                  </button>
                </div>
              ))}
            </div>

            {/* Bouton ajouter équipe */}
            <button
              onClick={() => openModal(groupe.id)}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl transition text-sm font-semibold"
              style={{
                border: '1px dashed rgba(255,255,255,0.15)',
                color: '#4b5563',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#00d4ff';
                e.currentTarget.style.color = '#00d4ff';
                e.currentTarget.style.backgroundColor = 'rgba(0,212,255,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
                e.currentTarget.style.color = '#4b5563';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <MdAdd /> AJOUTER UNE ÉQUIPE
            </button>
          </div>
        ))}

        {groupes.length === 0 && (
          <div className="col-span-3 flex flex-col items-center justify-center py-24 gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)' }}
            >
              <MdGroup size={32} style={{ color: '#00d4ff' }} />
            </div>
            <p className="text-gray-600 text-sm">Aucun groupe. Cliquez sur "AJOUTER UN GROUPE" pour commencer.</p>
          </div>
        )}
      </div>

      {/* Modal ajout équipe */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
          onClick={closeModal}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md"
            style={{
              backgroundColor: '#0d1117',
              border: '1px solid rgba(0,212,255,0.15)',
              boxShadow: '0 0 40px rgba(0,212,255,0.06)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{
                  background: 'linear-gradient(90deg, #00d4ff 0%, #7c3aed 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                NOUVELLE ÉQUIPE
              </h2>
              <button
                onClick={closeModal}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#6b7280' }}
                onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
              >
                <MdClose size={16} />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 rounded-xl text-sm"
                style={{ backgroundColor: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', color: '#f87171' }}>
                {formError}
              </div>
            )}

            <div className="flex flex-col gap-3">
              {[
                { placeholder: "Nom de l'équipe *", key: 'nom' },
                { placeholder: 'Ville', key: 'ville' },
                { placeholder: 'Coach', key: 'coach' },
              ].map(({ placeholder, key }) => (
                <input
                  key={key}
                  type="text"
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl text-white text-sm outline-none transition"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    placeholder: '#4b5563',
                  }}
                  onFocus={e => e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition"
                style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#6b7280' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6b7280'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
              >
                ANNULER
              </button>
              <button
                onClick={handleAddEquipe}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition"
                style={{ backgroundColor: '#00d4ff', color: '#000' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#00bfea'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00d4ff'}
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