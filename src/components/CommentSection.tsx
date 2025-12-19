import { useState } from 'react';
import { actions } from 'astro:actions';

interface CommentSectionProps {
    recipeId: string;
    initialComments: any[];
    isLoggedIn: boolean;
}

export default function CommentSection({ recipeId, initialComments, isLoggedIn }: CommentSectionProps) {
    const [comments] = useState<any[]>(initialComments);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        const { error } = await actions.addComment({ recipeId, content });
        
        if (error) {
            alert("Error posting comment.");
        } else {
            // Note: In a real app we'd want to fetch the updated user info or return it from the action
            // For now we'll just reload or optimistically add if we had user context here
            window.location.reload(); 
        }
        setLoading(false);
    };

    return (
        <section className="mt-16 pt-12 border-t border-gray-100">
            <h3 className="section-heading text-2xl mb-8">Discussion ({comments.length})</h3>

            {isLoggedIn ? (
                <form onSubmit={handleSubmit} className="mb-12">
                    <textarea 
                        className="input-field min-h-[100px] rounded-2xl py-4 mb-4"
                        placeholder="What do you think of this recipe?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn-primary"
                    >
                        {loading ? 'Posting...' : 'Post Comment'}
                    </button>
                </form>
            ) : (
                <div className="bg-brand-accent/30 p-6 rounded-2xl mb-12 text-center">
                    <p className="text-gray-600 mb-4">You must be signed in to join the conversation.</p>
                    <a href="/login" className="btn-outline text-sm">Sign In</a>
                </div>
            )}

            <div className="space-y-8">
                {comments.length === 0 && <p className="text-gray-400 italic">No comments yet. Be the first!</p>}
                {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4 group">
                        <div className="w-10 h-10 rounded-full bg-brand-accent overflow-hidden shrink-0">
                            {comment.user?.image ? (
                                <img src={comment.user.image} alt={comment.user.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-brand-primary">
                                    {comment.user?.name?.[0] || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-brand-text">{comment.user?.name}</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                    {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-600 leading-relaxed text-sm">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}