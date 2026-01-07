import { useState } from 'react';
import { actions } from 'astro:actions';
import type { RecipeInput } from '@/lib';
import { CATEGORIES, TrashIcon, PlusIcon, ImageIcon, Label, SectionHeader } from '@/lib';

export default function RecipeEditor({ initialData, isEditing = false }: { initialData?: RecipeInput; isEditing?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title || '', description: initialData?.description || '', coverImage: initialData?.coverImage || '',
    category: initialData?.category || 'General', videoUrl: initialData?.videoUrl || '', status: initialData?.status || 'published',
  });
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || ['']);
  const [steps, setSteps] = useState<string[]>(initialData?.steps || ['']);

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));
  const updateList = (list: string[], setList: (v: string[]) => void, i: number, value: string) => {
    const updated = [...list]; updated[i] = value; setList(updated);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { data, error } = await actions.getPresignedUrl({ fileType: file.type, fileSize: file.size });
      if (error || !data) throw new Error(error?.message || "Upload failed");
      await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      update('coverImage', data.publicUrl);
    } catch { alert("Error uploading image"); }
    finally { setUploading(false); }
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setLoading(true);
    try {
      const payload = { ...form, status, ingredients: ingredients.filter(i => i.trim()), steps: steps.filter(s => s.trim()) };
      const { data, error } = isEditing && initialData?.id
        ? await actions.updateRecipe({ id: initialData.id, ...payload })
        : await actions.createRecipe(payload);
      if (error) throw new Error(error.message);
      window.location.href = `/recipe/${data.slug}`;
    } catch (err: any) { alert(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-brand-border">
        <header className="mb-10 border-b border-gray-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-brand-primary font-bold text-xs uppercase tracking-widest">Recipe Builder</span>
            <h1 className="text-4xl font-bold font-serif">{isEditing ? 'Refine your creation' : 'Share a new flavor'}</h1>
          </div>
          <div className="flex gap-3">
            <a href="/dashboard" className="btn-ghost">Cancel</a>
            <button onClick={() => handleSubmit('draft')} disabled={loading} className="btn-outline px-6">Save Draft</button>
            <button onClick={() => handleSubmit('published')} disabled={loading} className="btn-primary px-10">
              {loading ? 'Processing...' : (isEditing ? 'Save & Publish' : 'Publish Recipe')}
            </button>
          </div>
        </header>

        <div className="grid-editor-layout">
          <div className="space-y-10">
            <section className="space-y-6">
              <SectionHeader step={1} title="Essential Information" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Recipe Title</Label>
                  <input id="title" type="text" className="input-field text-xl font-bold" value={form.title} onChange={e => update('title', e.target.value)} placeholder="The name of your dish..." />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select id="category" className="input-field" value={form.category} onChange={e => update('category', e.target.value)}>
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="video">Video Link (Optional)</Label>
                    <input id="video" type="url" className="input-field" value={form.videoUrl} onChange={e => update('videoUrl', e.target.value)} placeholder="YouTube or TikTok URL" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Short Description</Label>
                  <textarea id="description" className="input-field h-32 rounded-2xl py-4" value={form.description} onChange={e => update('description', e.target.value)} placeholder="Tell the story behind this recipe..." />
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader step={2} title="Ingredients" />
              <div className="space-y-3">
                {ingredients.map((ing, i) => (
                  <div key={i} className="flex gap-3">
                    <input type="text" className="input-field" value={ing} placeholder="e.g. 2 cups of Flour" onChange={e => updateList(ingredients, setIngredients, i, e.target.value)} />
                    <button onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))} className="w-12 flex items-center justify-center text-gray-300 hover:text-red-500"><TrashIcon /></button>
                  </div>
                ))}
                <button onClick={() => setIngredients([...ingredients, ''])} className="text-sm font-bold text-brand-primary flex items-center gap-2 hover:translate-x-1 transition-transform"><PlusIcon /> Add ingredient</button>
              </div>
            </section>

            <section className="space-y-6">
              <SectionHeader step={3} title="Preparation Steps" />
              <div className="space-y-6">
                {steps.map((step, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="pt-2 text-xs font-bold text-gray-300 group-hover:text-brand-primary">#{i + 1}</div>
                    <div className="flex-1 space-y-2">
                      <textarea className="input-field h-24 rounded-2xl" value={step} placeholder="What's the next step?" onChange={e => updateList(steps, setSteps, i, e.target.value)} />
                      <button onClick={() => setSteps(steps.filter((_, idx) => idx !== i))} className="text-xs text-gray-400 hover:text-red-500 font-medium">Remove step</button>
                    </div>
                  </div>
                ))}
                <button onClick={() => setSteps([...steps, ''])} className="text-sm font-bold text-brand-primary flex items-center gap-2 hover:translate-x-1 transition-transform"><PlusIcon /> Add step</button>
              </div>
            </section>
          </div>

          <aside>
            <div className="p-6 rounded-2xl bg-brand-bg border border-brand-border space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2"><ImageIcon /> Visuals</h3>
              <div className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-colors ${form.coverImage ? 'border-transparent' : 'border-gray-200 bg-white hover:border-brand-primary'}`}>
                {form.coverImage ? (
                  <>
                    <img src={form.coverImage} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="btn-primary text-xs py-2 cursor-pointer">Change Image<input type="file" accept="image/*" onChange={handleUpload} className="hidden" /></label>
                    </div>
                  </>
                ) : (
                  <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                    <span className="text-xs font-bold text-gray-400">Upload Cover</span>
                    <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                  </label>
                )}
              </div>
              {uploading && <div className="text-[10px] text-center font-bold text-brand-primary animate-pulse uppercase">Uploading...</div>}
              <p className="text-[10px] text-gray-400 pt-4 border-t border-gray-100">Recommended: High-res JPG/PNG under 10MB.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
