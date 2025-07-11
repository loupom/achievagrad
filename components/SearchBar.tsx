'use client'

import { useState, useEffect, useRef } from 'react'

interface Game {
  id: number
  name: string
  cover?: { image_id: string }
  first_release_date?: number
  genres?: { name: string }[]
}

interface Props {
  onSelect: (game: Game) => void
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    timeoutRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/igdb/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        })
        const data = await res.json()
        if (Array.isArray(data)) setResults(data)
      } catch (err) {
        console.error('Erreur API IGDB', err)
      } finally {
        setLoading(false)
      }
    }, 600)
  }, [query])

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un jeu..."
        className="w-full px-4 py-2 border rounded"
      />

      {loading && <p className="text-sm mt-1">Chargement...</p>}

      {results.length > 0 && (
        <ul className="absolute bg-white border rounded mt-1 w-full max-h-60 overflow-auto z-10">
          {results.map((game) => (
            <li
              key={game.id}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => {
                onSelect(game)
                setResults([])
                setQuery('')
              }}
            >
              {game.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}