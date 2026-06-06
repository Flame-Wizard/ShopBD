import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Plus, X, Image } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const BD_LOCATIONS = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Comilla', 'Mymensingh', 'Gazipur'];
const CHANNELS = ['Online Store', 'Daraz', 'Facebook Shop', 'Physical Store'];

export default function AdminProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState(['']);
  const [loading, setLoading] = useState(false);
  const [variants, setVariants] = useState([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data.categories || []));
    if (isEdit) {
      api.get(`/products/admin/all?keyword=${id}`).then(() => {
        // fetch individual product by id
        api.get(`/products/admin/all`).then(({ data }) => {
          const p = data.products?.find(x => x._id === id);
          if (p) {
            reset({ name: p.name, slug: p.slug, sku: p.sku, description: p.description, price: p.price, salePrice: p.salePrice || '', stock: p.stock, brand: p.brand, category: p.category?._id, location: p.location, salesChannel: p.salesChannel, costPrice: p.costPrice, metaTitle: p.metaTitle, metaDescription: p.metaDescription, isPublished: p.isPublished });
            setImages(p.images?.length > 0 ? p.images : ['']);
            setVariants(p.variants || []);
          }
        });
      });
    }
  }, [id]);

  const onSubmit = async (data) => {
    setLoading(true);
    const payload = { ...data, images: images.filter(Boolean), variants, price: Number(data.price), salePrice: data.salePrice ? Number(data.salePrice) : null, stock: Number(data.stock), costPrice: Number(data.costPrice || 0) };
    try {
      if (isEdit) {
        await api.put(`/products/${id}`, payload);
        toast.success('Product updated!');
      } else {
        await api.post('/products', payload);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    }
    setLoading(false);
  };

  const addVariant = () => setVariants(v => [...v, { name: '', options: [''] }]);
  const updateVariant = (i, field, value) => setVariants(v => v.map((x, j) => j === i ? { ...x, [field]: value } : x));
  const removeVariant = (i) => setVariants(v => v.filter((_, j) => j !== i));

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/admin/products')} className="btn-secondary btn-sm">← Back</button>
        <h1 className="text-2xl font-bold text-white">{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic Info */}
        <div className="admin-card space-y-4">
          <h2 className="font-bold text-slate-100">Basic Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Product Name *</label>
              <input {...register('name', { required: true })} className="input" placeholder="e.g. Samsung Galaxy A54" />
            </div>
            <div>
              <label className="label">URL Slug</label>
              <input {...register('slug')} className="input" placeholder="auto-generated if empty" />
            </div>
            <div>
              <label className="label">SKU</label>
              <input {...register('sku')} className="input" placeholder="e.g. EL-001" />
            </div>
            <div>
              <label className="label">Brand</label>
              <input {...register('brand')} className="input" placeholder="e.g. Samsung" />
            </div>
            <div>
              <label className="label">Category *</label>
              <select {...register('category', { required: true })} className="select">
                <option value="">Select category...</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea {...register('description')} className="input min-h-[120px] resize-none" placeholder="Detailed product description..." />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="admin-card space-y-4">
          <h2 className="font-bold text-slate-100">Pricing & Stock</h2>
          <div className="grid sm:grid-cols-4 gap-4">
            <div>
              <label className="label">Price (৳) *</label>
              <input {...register('price', { required: true, min: 0 })} type="number" className="input" placeholder="0" />
            </div>
            <div>
              <label className="label">Sale Price (৳)</label>
              <input {...register('salePrice')} type="number" className="input" placeholder="Optional" />
            </div>
            <div>
              <label className="label">Cost Price (৳)</label>
              <input {...register('costPrice')} type="number" className="input" placeholder="For analytics" />
            </div>
            <div>
              <label className="label">Stock *</label>
              <input {...register('stock', { required: true, min: 0 })} type="number" className="input" placeholder="0" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Location</label>
              <select {...register('location')} className="select">
                {BD_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sales Channel</label>
              <select {...register('salesChannel')} className="select">
                {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-100">Images (URLs)</h2>
            <button type="button" onClick={() => setImages(i => [...i, ''])} className="btn-secondary btn-sm flex items-center gap-1">
              <Plus size={14} /> Add Image
            </button>
          </div>
          <p className="text-xs text-slate-400">Paste Unsplash, Pexels, or any public image URL.</p>
          {images.map((img, i) => (
            <div key={i} className="flex gap-2 items-center">
              {img && <img src={img} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" onError={e => e.target.style.display = 'none'} />}
              {!img && <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0"><Image size={14} className="text-slate-400" /></div>}
              <input
                value={img}
                onChange={e => setImages(imgs => imgs.map((x, j) => j === i ? e.target.value : x))}
                className="input flex-1 text-sm"
                placeholder="https://images.unsplash.com/photo-xxxx?w=800"
              />
              {images.length > 1 && (
                <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))} className="btn-icon text-red-400">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Variants */}
        <div className="admin-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-100">Variants</h2>
            <button type="button" onClick={addVariant} className="btn-secondary btn-sm flex items-center gap-1">
              <Plus size={14} /> Add Variant
            </button>
          </div>
          {variants.map((v, i) => (
            <div key={i} className="flex gap-2 items-start flex-wrap">
              <input value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} placeholder="e.g. Color" className="input flex-shrink-0 w-28" />
              <input value={v.options.join(', ')} onChange={e => updateVariant(i, 'options', e.target.value.split(',').map(x => x.trim()))} placeholder="Option 1, Option 2" className="input flex-1" />
              <button type="button" onClick={() => removeVariant(i)} className="btn-icon text-red-400"><X size={16} /></button>
            </div>
          ))}
          {variants.length === 0 && <p className="text-slate-500 text-sm">No variants. Add size, color, etc.</p>}
        </div>

        {/* SEO + Status */}
        <div className="admin-card space-y-4">
          <h2 className="font-bold text-slate-100">SEO & Status</h2>
          <div>
            <label className="label">Meta Title</label>
            <input {...register('metaTitle')} className="input" />
          </div>
          <div>
            <label className="label">Meta Description</label>
            <textarea {...register('metaDescription')} className="input resize-none h-20" />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input {...register('isPublished')} type="checkbox" className="w-5 h-5 rounded" defaultChecked />
            <span className="text-slate-300 font-medium">Published (visible in store)</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
          <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
