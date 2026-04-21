import { useState, useEffect, useCallback } from "react";
import "./styles.css";

const environment = import.meta.env.VITE_PUBLIC_ENVIRONMENT || "local";
const version = import.meta.env.VITE_PUBLIC_VERSION || "dev-local";

interface PokemonType {
  type: { name: string };
}

interface PokemonStat {
  base_stat: number;
  stat: { name: string };
}

interface Pokemon {
  id: number;
  name: string;
  sprites: { other: { "official-artwork": { front_default: string } } };
  types: PokemonType[];
  stats: PokemonStat[];
  height: number;
  weight: number;
}

const TYPE_COLORS: Record<string, string> = {
  fire: "#ff6b35",
  water: "#4a90d9",
  grass: "#5cb85c",
  electric: "#f7cc47",
  psychic: "#ee538b",
  ice: "#74d0c3",
  dragon: "#6c5ce7",
  dark: "#5a5464",
  fairy: "#e799c1",
  normal: "#a3a3a3",
  fighting: "#c0392b",
  flying: "#7eb4e2",
  poison: "#9b59b6",
  ground: "#d4a04a",
  rock: "#b5a16e",
  bug: "#91c12f",
  ghost: "#4a3f6b",
  steel: "#95a5a6",
};

const STAT_LABELS: Record<string, string> = {
  hp: "HP",
  attack: "ATK",
  defense: "DEF",
  "special-attack": "SpA",
  "special-defense": "SpD",
  speed: "SPD",
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="type-badge" style={{ background: TYPE_COLORS[type] ?? "#777" }}>
      {type}
    </span>
  );
}

function StatBar({ stat, value }: { stat: string; value: number }) {
  return (
    <div className="stat-row">
      <span className="stat-name">{STAT_LABELS[stat] ?? stat}</span>
      <span className="stat-value">{value}</span>
      <div className="stat-bar">
        <div className="stat-fill" style={{ width: `${Math.min((value / 255) * 100, 100)}%` }} />
      </div>
    </div>
  );
}

function PokemonCard({ pokemon }: { pokemon: Pokemon }) {
  const [flipped, setFlipped] = useState(false);
  const mainType = pokemon.types[0].type.name;
  const color = TYPE_COLORS[mainType] ?? "#777";

  return (
    <div
      className={`poke-card${flipped ? " flipped" : ""}`}
      onClick={() => setFlipped((f) => !f)}
      style={{ "--type-color": color } as React.CSSProperties}
      aria-label={`${pokemon.name} — clic para ver estadísticas`}
    >
      <div className="card-inner">
        <div className="card-face card-front">
          <div className="card-glow" />
          <div className="card-img-wrap">
            <img
              src={pokemon.sprites.other["official-artwork"].front_default}
              alt={pokemon.name}
              loading="lazy"
            />
          </div>
          <div className="card-info">
            <span className="poke-id">#{String(pokemon.id).padStart(3, "0")}</span>
            <h3 className="poke-name">{pokemon.name}</h3>
            <div className="types">
              {pokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} />
              ))}
            </div>
          </div>
          <span className="flip-hint">toca para ver stats →</span>
        </div>

        <div className="card-face card-back">
          <div className="card-glow" />
          <h3 className="poke-name back-name">{pokemon.name}</h3>
          <div className="stats">
            {pokemon.stats.map((s) => (
              <StatBar key={s.stat.name} stat={s.stat.name} value={s.base_stat} />
            ))}
          </div>
          <div className="card-meta">
            <span>📏 {pokemon.height / 10} m</span>
            <span>⚖️ {pokemon.weight / 10} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
}

const LIMIT = 20;

export default function App() {
  const [pokemon, setPokemon] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchBatch = useCallback(async (currentOffset: number) => {
    setLoading(true);
    try {
      const listRes = await fetch(
        `https://pokeapi.co/api/v2/pokemon?limit=${LIMIT}&offset=${currentOffset}`
      );
      const list = await listRes.json();
      setHasMore(!!list.next);
      const details: Pokemon[] = await Promise.all(
        list.results.map((p: { url: string }) => fetch(p.url).then((r) => r.json()))
      );
      setPokemon((prev) => (currentOffset === 0 ? details : [...prev, ...details]));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBatch(0);
  }, [fetchBatch]);

  const loadMore = () => {
    const next = offset + LIMIT;
    setOffset(next);
    fetchBatch(next);
  };

  const filtered = pokemon.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <main className="shell">
      <header className="dex-header">
        <div className="dex-logo">
          <span className="pokeball">◉</span>
          Pokédex
        </div>
        <div className="env-strip">
          <span className="badge">{environment}</span>
          <code className="mono">{version}</code>
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">Laboratorio · PokeAPI</p>
        <h1>Gotta Catch 'Em All</h1>
        <p className="hero-copy">
          Explora el mundo Pokémon. Toca cualquier carta para revelar sus estadísticas.
        </p>
      </section>

      <div className="search-wrap">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          type="search"
          placeholder="Buscar Pokémon por nombre…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <span className="search-count">
            {filtered.length} resultado{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {loading && pokemon.length === 0 ? (
        <div className="poke-grid">
          {Array.from({ length: LIMIT }).map((_, i) => (
            <div key={i} className="poke-card skeleton" />
          ))}
        </div>
      ) : (
        <>
          <div className="poke-grid">
            {filtered.map((p) => (
              <PokemonCard key={p.id} pokemon={p} />
            ))}
          </div>

          {!search && hasMore && (
            <div className="load-more-wrap">
              <button className="load-more-btn" onClick={loadMore} disabled={loading}>
                {loading ? "Cargando…" : "Cargar más Pokémon"}
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
