import { ShareIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/Toast";

export function ShareButton({ title }: { title: string }) {
  const { toast } = useToast();
  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast("Link copied!", "success");
      }
    } catch (err) {
      if (err instanceof Error && err.name !== "AbortError") toast("Could not share", "error");
    }
  };
  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className="flex items-center gap-1.5 text-sm text-stone hover:text-sage transition-colors"
      aria-label="Share"
    >
      <ShareIcon className="w-4 h-4" />
      Share
    </button>
  );
}
