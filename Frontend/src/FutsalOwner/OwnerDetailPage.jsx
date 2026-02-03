
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft, Mail, Phone, MapPin, Building2, FileText,
  Image as ImageIcon, CheckCircle, XCircle, Clock,
  ExternalLink, X, ChevronLeft, ChevronRight, Download,
  User, Eye, Trash2
} from 'lucide-react';
import { showToast } from './components/Toast';

const API_BASE ='http://localhost:5000';

// ─── helpers ──────────────────────────────────────────────
const isPdf = (url) => !url ? false : url.includes('/raw/upload/') || url.toLowerCase().endsWith('.pdf');

const STATUS = {
  pending:  { label: 'Pending',  colors: 'bg-amber-100 text-amber-700',     Icon: Clock },
  approved: { label: 'Approved', colors: 'bg-emerald-100 text-emerald-700', Icon: CheckCircle },
  rejected: { label: 'Rejected', colors: 'bg-red-100 text-red-700',         Icon: XCircle },
};

const fmt = (d) => d
  ? new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
  : '—';

// ──────────────────────────────────────────────────────────
export default function OwnerDetailPage() {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [owner, setOwner]       = useState(null);
  const [loading, setLoading]   = useState(true);
  const [notes, setNotes]       = useState('');
  const [busy, setBusy]         = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // modal state
  const [pdfSrc, setPdfSrc]     = useState(null);   // PDF preview modal
  const [docImg, setDocImg]     = useState(null);   // doc-image modal
  const [lightbox, setLightbox] = useState(null);   // ground-image lightbox (index)

  // ── fetch ───────────────────────────────────────────────
  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_BASE}/futsal-owners/${id}`);
      setOwner(data.data);
      setNotes(data.data.adminNotes || '');
    } catch {
      showToast.error('Could not load this application.');
      navigate(-1);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  // ── approve / reject ────────────────────────────────────
  const act = async (status) => {
    setBusy(true);
    try {
      await axios.patch(`${API_BASE}/futsal-owners/${id}/status`, { status, adminNotes: notes });
      showToast.success(`Application ${status}.`);
      await load();
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  // ── delete ──────────────────────────────────────────────
  const del = async () => {
    setBusy(true);
    try {
      await axios.delete(`${API_BASE}/futsal-owners/${id}`);
      showToast.success('Application deleted.');
      navigate(-1);
    } catch (e) {
      showToast.error(e.response?.data?.message || 'Delete failed.');
    } finally {
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  // ── ESC key closes any open modal ───────────────────────
  useEffect(() => {
    const fn = (e) => {
      if (e.key !== 'Escape') return;
      if (pdfSrc)            { setPdfSrc(null); return; }
      if (docImg)            { setDocImg(null); return; }
      if (lightbox !== null) { setLightbox(null); return; }
    };
    addEventListener('keydown', fn);
    return () => removeEventListener('keydown', fn);
  }, [pdfSrc, docImg, lightbox]);

  // ── loading ─────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <svg className="animate-spin h-10 w-10 mx-auto text-green-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p className="mt-3 text-gray-500">Loading…</p>
      </div>
    </div>
  );

  if (!owner) return null;

  const st     = STATUS[owner.status] || STATUS.pending;
  const StIcon = st.Icon;
  const imgs   = owner.groundImages || [];

  // lightbox nav
  const prev = () => setLightbox((lightbox - 1 + imgs.length) % imgs.length);
  const next = () => setLightbox((lightbox + 1) % imgs.length);

  // ── render ──────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ── top bar ── */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-green-700 font-medium transition">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${st.colors}`}>
            <StIcon className="w-4 h-4" /> {st.label}
          </span>
        </div>

        {/* ── hero ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
          <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center shrink-0">
            <User className="w-7 h-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-gray-900 truncate">{owner.fullName}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-0.5 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Registered {fmt(owner.createdAt)}
              </span>
              {owner.status !== 'pending' && owner.statusUpdatedAt && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Updated {fmt(owner.statusUpdatedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── owner + futsal info ── */}
        <div className="grid md:grid-cols-2 gap-5">
          <Card icon={User} title="Owner Information">
            <Row icon={Mail}  label="Email" value={owner.email} />
            <Row icon={Phone} label="Phone" value={owner.phone} />
          </Card>

          <Card icon={Building2} title="Futsal Information">
            <Row icon={Building2} label="Futsal Name"      value={owner.futsalName} />
            <Row icon={MapPin}    label="Location"         value={owner.futsalLocation} />
            <Row icon={Phone}     label="Business Contact" value={owner.businessContact} />
            {owner.googleMapLink ? (
              <div className="flex items-start gap-3 mt-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Google Maps</p>
                  <a href={owner.googleMapLink} target="_blank" rel="noopener noreferrer"
                    className="text-green-600 hover:underline text-sm inline-flex items-center gap-1">
                    Open in Maps <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ) : (
              <Row icon={MapPin} label="Google Maps" value="Not provided" />
            )}
          </Card>
        </div>

        {/* ── documents ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 mb-4">
            <FileText className="w-5 h-5 text-green-600" /> Documents
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <DocCard
              label="Business Registration"
              url={owner.businessDoc}
              onPreview={() => isPdf(owner.businessDoc) ? setPdfSrc(owner.businessDoc) : setDocImg(owner.businessDoc)}
            />
            <DocCard
              label="Citizenship / ID"
              url={owner.citizenshipDoc}
              onPreview={() => isPdf(owner.citizenshipDoc) ? setPdfSrc(owner.citizenshipDoc) : setDocImg(owner.citizenshipDoc)}
            />
          </div>
        </div>

        {/* ── ground images ── */}
        {imgs.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                <ImageIcon className="w-5 h-5 text-green-600" /> Ground Images
              </h2>
              <span className="text-xs bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-semibold">
                {imgs.length} photo{imgs.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {imgs.map((url, i) => (
                <button key={i} onClick={() => setLightbox(i)}
                  className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:ring-2 hover:ring-green-500 transition group">
                  <img src={url} alt={`Ground ${i + 1}`} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition drop-shadow" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── admin notes + actions ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Admin Notes</h2>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes about this application…"
            rows={3}
            className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 resize-none
                       focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder-gray-400"
          />

          <div className="flex items-center justify-between mt-5">
            {/* approve / reject */}
            <div className="flex gap-3">
              {owner.status !== 'rejected' && (
                <button disabled={busy} onClick={() => act('rejected')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition disabled:opacity-50">
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              )}
              {owner.status !== 'approved' && (
                <button disabled={busy} onClick={() => act('approved')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50">
                  <CheckCircle className="w-4 h-4" /> Approve
                </button>
              )}
            </div>

            {/* delete */}
            <button disabled={busy} onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-sm font-medium transition disabled:opacity-50">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

      </div> {/* end max-w */}

      {/* ════════════════════════════════════════════════════
          MODALS
          ════════════════════════════════════════════════════ */}

      {/* ── PDF preview ── */}
      {pdfSrc && (
        <Backdrop onClose={() => setPdfSrc(null)}>
          <div className="relative w-full max-w-3xl bg-white rounded-xl overflow-hidden shadow-2xl" style={{ height: '80vh' }}>
            <CloseBtn onClose={() => setPdfSrc(null)} />
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfSrc)}&embedded=true`}
              className="w-full h-full"
              title="PDF Preview"
            />
          </div>
        </Backdrop>
      )}

      {/* ── document image preview ── */}
      {docImg && (
        <Backdrop onClose={() => setDocImg(null)}>
          <div className="relative">
            <CloseBtn onClose={() => setDocImg(null)} light />
            <img src={docImg} alt="Document" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </Backdrop>
      )}

      {/* ── ground image lightbox ── */}
      {lightbox !== null && (
        <Backdrop onClose={() => setLightbox(null)} dark>
          <div className="relative flex flex-col items-center gap-3">
            {/* main image */}
            <div className="relative">
              <CloseBtn onClose={() => setLightbox(null)} light />
              <img src={imgs[lightbox]} alt={`Ground ${lightbox + 1}`}
                className="max-w-full max-h-[72vh] object-contain rounded-lg" />
              {/* prev */}
              {imgs.length > 1 && (
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              {/* next */}
              {imgs.length > 1 && (
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition">
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* ── thumbnail strip ── */}
            {imgs.length > 1 && (
              <div className="flex gap-2 flex-wrap justify-center max-w-lg">
                {imgs.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(i)}
                    className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition
                      ${i === lightbox ? 'border-green-400 opacity-100 ring-2 ring-green-400/50' : 'border-transparent opacity-50 hover:opacity-80'}`}>
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* counter */}
            <p className="text-white/70 text-xs">{lightbox + 1} of {imgs.length}</p>
          </div>
        </Backdrop>
      )}

      {/* ── delete confirmation ── */}
      {confirmDelete && (
        <Backdrop onClose={() => setConfirmDelete(false)}>
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Delete application?</h3>
                <p className="text-sm text-gray-500">This removes the record and all uploaded files from Cloudinary. It cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                Cancel
              </button>
              <button onClick={del} disabled={busy}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition disabled:opacity-50">
                {busy ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </Backdrop>
      )}
    </div>
  );
}

// ─── shared modal primitives ──────────────────────────────
function Backdrop({ onClose, dark, children }) {
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${dark ? 'bg-black/85' : 'bg-black/60'}`}
      onClick={onClose}
    >
      <div onClick={e => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function CloseBtn({ onClose, light }) {
  return (
    <button onClick={onClose}
      className={`absolute top-2 right-2 z-10 rounded-full p-1.5 transition
        ${light ? 'bg-black/50 hover:bg-black/70 text-white' : 'bg-white/90 hover:bg-white text-gray-700 shadow'}`}>
      <X className="w-4 h-4" />
    </button>
  );
}

// ─── reusable card / row ──────────────────────────────────
function Card({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <Icon className="w-5 h-5 text-green-600" /> {title}
      </h2>
      {children}
    </div>
  );
}

function Row({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 mt-3">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-700 font-medium">{value || '—'}</p>
      </div>
    </div>
  );
}

// ─── document card (PDF or image, auto-detected) ──────────
function DocCard({ label, url, onPreview }) {
  if (!url) return (
    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-gray-400">
      <FileText className="w-8 h-8" />
      <p className="text-sm font-medium">{label}</p>
      <p className="text-xs">Not uploaded</p>
    </div>
  );

  const pdf = isPdf(url);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* top section — thumbnail for images, icon block for PDFs */}
      {pdf ? (
        <div className="bg-red-50 p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800">{label}</p>
            <p className="text-xs text-gray-500">PDF Document</p>
          </div>
          <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium shrink-0">
            <CheckCircle className="w-3 h-3" /> Uploaded
          </span>
        </div>
      ) : (
        <div className="relative">
          <img src={url} alt={label} className="w-full h-28 object-cover" />
          <span className="absolute top-2 right-2 text-xs bg-green-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 font-medium shadow">
            <CheckCircle className="w-3 h-3" /> Uploaded
          </span>
        </div>
      )}

      {/* buttons */}
      <div className="flex gap-2 p-3">
        <button onClick={onPreview}
          className="flex-1 flex items-center justify-center gap-1.5 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg py-2 font-medium transition">
          <Eye className="w-4 h-4" /> {pdf ? 'Preview' : 'View'}
        </button>
        <a href={url} download target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-2 transition">
          <Download className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}