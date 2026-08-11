import { Link, useLocation } from 'react-router';

export const concepts = [
  { id: 'roastery', path: '/concepts/roastery', label: 'Roastery', reference: 'Blue Tokai · Subko' },
  { id: 'blocks', path: '/concepts/blocks', label: 'Flavour Blocks', reference: 'Omsom · Fly By Jing' },
  { id: 'gifting', path: '/concepts/gifting', label: 'Gifting House', reference: 'Bombay Sweet Shop · Fortnum' },
] as const;

interface Props {
  id: string;
  background: string;
  color: string;
  accent: string;
  children: React.ReactNode;
}

/**
 * Wraps a concept page: sets its own palette on an isolated surface and pins a
 * switcher so the three directions can be compared without leaving the page.
 *
 * Each concept deliberately ignores the main site's design tokens — the whole
 * point is that they look like different companies.
 */
export function ConceptFrame({ id, background, color, accent, children }: Props) {
  const { pathname } = useLocation();

  return (
    <div style={{ backgroundColor: background, color }} className="min-h-dvh">
      {/* Switcher */}
      <div className="sticky top-0 z-50 bg-[#14161A] text-white/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-5 py-2.5 text-[12px]">
          <Link to="/concepts" className="font-medium tracking-wide underline-offset-4 hover:underline">
            ← Concepts
          </Link>
          <div className="flex flex-wrap gap-1.5">
            {concepts.map((concept) => {
              const active = pathname === concept.path;
              return (
                <Link
                  key={concept.id}
                  to={concept.path}
                  className={`rounded-full px-3 py-1 transition-colors ${
                    active ? 'bg-white text-[#14161A]' : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {concept.label}
                </Link>
              );
            })}
          </div>
          <span className="ml-auto hidden text-white/45 sm:inline">
            <span style={{ color: accent }}>
              Concept {concepts.findIndex((c) => c.id === id) + 1} of {concepts.length}
            </span>
          </span>
        </div>
      </div>

      {children}
    </div>
  );
}
