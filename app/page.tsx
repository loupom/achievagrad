'use client'

import { useState } from 'react'

export default function Home() {
  const [results, setResults] = useState<any[]>([])

  async function searchGames() {
    const res = await fetch('/api/igdb/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'Zelda' }),
    })

    const text = await res.text()
    console.log('Réponse brute IGDB :', text)

    try {
      const data = JSON.parse(text)
        if (Array.isArray(data)) {
          setResults(data)
        } else {
          console.error('La réponse IGDB n’est pas un tableau :', data)
          setResults([])
        }
    } catch (e) {
      console.error('Erreur de parsing JSON :', e)
    }
  }

  function getCoverUrl(image_id: string, size: string = 'cover_big') {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${image_id}.jpg`
}

function formatYear(timestamp: number | undefined) {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).getFullYear()
}


  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recherche IGDB</h1>
      <button
        onClick={searchGames}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
      >
        Chercher 'Zelda'
      </button>

      <ul className="mt-6 space-y-2">
  {results.length > 0 ? (
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-6">
  {results.map((game) => (
    <div key={game.id} className="border rounded-xl p-4 shadow hover:shadow-lg transition">
      {game.cover?.image_id && (
        <img
          src={getCoverUrl(game.cover.image_id)}
          alt={`Cover of ${game.name}`}
          className="w-full h-48 object-cover rounded"
        />
      )}
      <h2 className="text-lg font-semibold mt-2">{game.name}</h2>
      <p className="text-sm text-gray-500">
        {game.genres?.map((g: any) => g.name).join(', ') || 'Genre inconnu'}
      </p>
      <p className="text-sm text-gray-400">{formatYear(game.first_release_date)}</p>
    </div>
  ))}
</div>

  ) : (
    <p className="text-sm text-gray-500">Aucun résultat</p>
  )}
</ul>

    </main>
  )
}
