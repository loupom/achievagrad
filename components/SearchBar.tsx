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

function getCoverUrl(image_id: string, size: string = 'cover_small') {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${image_id}.jpg`
}

function formatYear(timestamp: number | undefined) {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).getFullYear()
}

export default function SearchBar({ onSelect }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // detect outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setResults([])
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('pileOfShame')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          const ids = parsed.map((g: Game) => g.id)
          setSelectedIds(ids)
        }
      } catch (e) {
        console.error('Error parsing localStorage:', e)
      }
    }
  }, [])

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
        console.error('IGDB API error', err)
      } finally {
        setLoading(false)
      }
    }, 600)
  }, [query])

  const handleSelect = (game: Game) => {
    if (!selectedIds.includes(game.id)) {
      setSelectedIds((prev) => [...prev, game.id])
    }
    onSelect(game)
    setResults([])
    setQuery('')
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search a game..."
        className="w-full px-4 py-2 border rounded"
      />

      {(loading || (!loading && query)) && (
        <div className="absolute bg-white border rounded mt-1 w-full max-h-96 overflow-auto z-10 shadow-md">
          {loading ? (
            <div className="text-sm text-gray-500 text-center p-4">Loading...</div>
          ) : results.length === 0 ? (
            <div className="text-sm text-gray-500 text-center p-4">No results found</div>
          ) : (
            <ul>
              {results.map((game) => (
                <li
                  key={game.id}
                  className="flex items-start gap-4 p-2 hover:bg-gray-100 cursor-pointer transition"
                  onClick={() => handleSelect(game)}
                >
                  {game.cover?.image_id ? (
                    <img
                      src={getCoverUrl(game.cover.image_id)}
                      alt="cover"
                      className="w-16 h-20 object-cover rounded border"
                    />
                  ) : (
                    <div className="w-16 h-20 flex items-center justify-center rounded border bg-gray-100 text-xl">
                      🎮
                    </div>
                  )}

                  <div className="flex flex-col justify-start text-sm">
                    <p className="font-semibold text-base leading-tight mb-1">
                      {game.name}
                      {selectedIds.includes(game.id) && (
                        <span className="ml-2 text-green-600 text-sm">✅</span>
                      )}
                    </p>
                    <p className="text-gray-500">
                      {game.genres?.map((g) => g.name).join(', ') || 'Unknown genre'}
                    </p>
                    <p className="text-gray-400">{formatYear(game.first_release_date)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}