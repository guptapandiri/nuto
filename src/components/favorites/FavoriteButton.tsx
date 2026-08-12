import { useFavorites } from '@/hooks/useFavorites';

export function FavoriteButton({
  slug,
  itemLabel,
  className = '',
}: {
  slug: string;
  itemLabel: string;
  className?: string;
}) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const active = isFavorite(slug);

  return (
    <button
      type="button"
      onClick={() => toggleFavorite(slug)}
      aria-pressed={active}
      aria-label={`${active ? 'Remove' : 'Add'} ${itemLabel} ${active ? 'from' : 'to'} favorites`}
      title={`${active ? 'Remove from' : 'Add to'} favorites`}
      className={`grid size-10 place-items-center rounded-full border transition-colors ${
        active
          ? 'border-[#E23744] bg-[#E23744] text-white'
          : 'border-neutral-300 bg-white text-neutral-700 hover:border-[#E23744] hover:text-[#E23744]'
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill={active ? 'currentColor' : 'none'} aria-hidden="true">
        <path
          d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
