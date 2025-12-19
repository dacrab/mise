import { useState } from 'react';
import { actions } from 'astro:actions';

interface RecipeData {
    id?: string;
    title: string;
    description?: string | null;
    coverImage?: string | null;
    ingredients: string[];
    steps: string[];
}

interface RecipeEditorProps {
    initialData?: RecipeData;
    isEditing?: boolean;
}

export default function RecipeEditor({ initialData, isEditing = false }: RecipeEditorProps) {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    coverImage: initialData?.coverImage || '',
  });
  
  const [ingredients, setIngredients] = useState<string[]>(initialData?.ingredients || ['']);
  const [steps, setSteps] = useState<string[]>(initialData?.steps || ['']);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data, error } = await actions.getPresignedUrl({
        fileType: file.type,
        fileSize: file.size,
      });

      if (error || !data) throw new Error(error?.message || "Failed to get upload URL");

      await fetch(data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      setFormData(prev => ({ ...prev, coverImage: data.publicUrl }));
    } catch (err) {
      alert("Error uploading image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const validIngredients = ingredients.filter(i => i.trim() !== '');
      const validSteps = steps.filter(s => s.trim() !== '');

      const payload = {
          ...formData,
          ingredients: validIngredients,
          steps: validSteps,
      };

      const { data, error } = isEditing && initialData?.id 
        ? await actions.updateRecipe({ id: initialData.id, ...payload })
        : await actions.createRecipe(payload);

      if (error) throw new Error(error.message);
      window.location.href = `/recipe/${data.slug}`;
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-fade-in">
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-brand-border">
        <header className="mb-10 border-b border-gray-100 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-brand-primary font-bold text-xs uppercase tracking-widest">Recipe Builder</span>
            <h1 className="text-4xl font-bold font-serif">{isEditing ? 'Refine your creation' : 'Share a new flavor'}</h1>
          </div>
          <div className="flex gap-3">
             <a href="/dashboard" className="btn-ghost">Cancel</a>
             <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary px-10"
              >
                {loading ? 'Processing...' : (isEditing ? 'Save Changes' : 'Publish Recipe')}
              </button>
          </div>
        </header>

        <div className="grid-editor-layout">
          <div className="space-y-10">
            {/* Primary Details */}
            <section className="space-y-6">
               <h2 className="text-xl font-bold font-serif flex items-center gap-3">
                 <span className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center text-sm">1</span>
                 Essential Information
               </h2>
               
               <div className="space-y-4">
                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Recipe Title</label>
                   <input
                     type="text"
                     className="input-field text-xl font-bold"
                     value={formData.title}
                     onChange={e => setFormData({ ...formData, title: e.target.value })}
                     placeholder="The name of your dish..."
                   />
                 </div>

                 <div className="space-y-2">
                   <label className="text-xs font-bold uppercase tracking-wider text-gray-400">Short Description</label>
                   <textarea
                     className="input-field h-32 rounded-2xl py-4"
                     value={formData.description}
                     onChange={e => setFormData({ ...formData, description: e.target.value })}
                     placeholder="Tell the story behind this recipe..."
                   />
                 </div>
               </div>
            </section>

            {/* Ingredients & Steps */}
            <section className="space-y-10">
               <div className="space-y-6">
                  <h2 className="text-xl font-bold font-serif flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center text-sm">2</span>
                    Ingredients
                  </h2>
                  <div className="space-y-3">
                    {ingredients.map((ing, i) => (
                      <div key={i} className="flex gap-3 animate-fade-in">
                        <input
                          type="text"
                          className="input-field"
                          value={ing}
                          onChange={e => {
                            const newIngs = [...ingredients];
                            newIngs[i] = e.target.value;
                            setIngredients(newIngs);
                          }}
                          placeholder={`e.g. 2 cups of Flour`}
                        />
                        <button 
                          onClick={() => setIngredients(ingredients.filter((_, idx) => idx !== i))}
                          className="w-12 flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => setIngredients([...ingredients, ''])}
                      className="text-sm font-bold text-brand-primary flex items-center gap-2 hover:translate-x-1 transition-transform"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      Add another ingredient
                    </button>
                  </div>
               </div>

               <div className="space-y-6">
                  <h2 className="text-xl font-bold font-serif flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center text-sm">3</span>
                    Preparation Steps
                  </h2>
                  <div className="space-y-6">
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-4 group">
                        <div className="pt-2 text-xs font-bold text-gray-300 group-hover:text-brand-primary transition-colors">#{i+1}</div>
                        <div className="flex-1 space-y-2">
                           <textarea
                             className="input-field h-24 rounded-2xl"
                             value={step}
                             onChange={e => {
                               const newSteps = [...steps];
                               newSteps[i] = e.target.value;
                               setSteps(newSteps);
                             }}
                             placeholder="What's the next step?"
                           />
                           <button 
                             onClick={() => setSteps(steps.filter((_, idx) => idx !== i))}
                             className="text-xs text-gray-400 hover:text-red-500 font-medium"
                           >
                             Remove step
                           </button>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setSteps([...steps, ''])}
                      className="text-sm font-bold text-brand-primary flex items-center gap-2 hover:translate-x-1 transition-transform"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                      Add another step
                    </button>
                  </div>
               </div>
            </section>
          </div>

          {/* Sidebar: Media */}
          <aside className="space-y-8">
             <div className="p-6 rounded-2xl bg-brand-bg border border-brand-border space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                  Visuals
                </h3>
                
                <div className="space-y-4">
                  <div className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-colors ${formData.coverImage ? 'border-transparent' : 'border-gray-200 bg-white hover:border-brand-primary'}`}>
                    {formData.coverImage ? (
                      <>
                        <img src={formData.coverImage} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                           <label className="btn-primary text-xs py-2 cursor-pointer">
                              Change Image
                              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                           </label>
                        </div>
                      </>
                    ) : (
                      <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
                        <span className="text-xs font-bold text-gray-400">Upload Cover</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    )}
                  </div>
                  {uploading && <div className="text-[10px] text-center font-bold text-brand-primary animate-pulse uppercase">Uploading...</div>}
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                   <p className="text-[10px] text-gray-400 leading-tight">
                     Recommended: High-res JPG/PNG under 10MB.
                   </p>
                </div>
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
