import React, { useEffect, useState } from 'react';
import { Check, Trash2, Star } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('false');

  const fetch = async () => {
    setLoading(true);
    const { data } = await api.get(`/reviews/admin/all?isApproved=${filter}`);
    setReviews(data.reviews || []);
    setLoading(false);
  };
  useEffect(() => { fetch(); }, [filter]);

  const handleApprove = async (id) => {
    await api.put(`/reviews/${id}/approve`);
    toast.success('Review approved!');
    fetch();
  };
  const handleDelete = async (id) => {
    await api.delete(`/reviews/${id}`);
    toast.success('Review deleted');
    fetch();
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white">Reviews</h1>
        <div className="flex gap-2">
          {[{ val: 'false', label: 'Pending' }, { val: 'true', label: 'Approved' }].map(({ val, label }) => (
            <button key={val} onClick={() => setFilter(val)} className={`btn-sm rounded-xl font-medium ${filter === val ? 'btn-primary' : 'btn-secondary'}`}>{label}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16"><p className="text-4xl mb-3">⭐</p><p className="text-slate-400">No {filter === 'false' ? 'pending' : 'approved'} reviews</p></div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="admin-card flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {r.user?.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-200 text-sm">{r.user?.name}</span>
                  <div className="flex items-center gap-0.5">
                    {Array(5).fill(0).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} />)}
                  </div>
                  <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-sky-400 mt-0.5">Re: {r.product?.name}</p>
                <p className="text-sm text-slate-300 mt-1">{r.comment}</p>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                {!r.isApproved && (
                  <button onClick={() => handleApprove(r._id)} className="btn-icon text-emerald-400 hover:text-emerald-300"><Check size={16} /></button>
                )}
                <button onClick={() => handleDelete(r._id)} className="btn-icon text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
