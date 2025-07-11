'use client'

import { useEffect, useState } from 'react'
import SearchBar from '../components/SearchBar'
import GameCard from '../components/GameCard'

export default function Home() {
  const [pile, setPile] = useState<any[]>([])

  useEffect(() => {
    const saved = localStorage.getItem('pileOfShame')
    if (saved) setPile(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('pileOfShame', JSON.stringify(pile))
  }, [pile])

  function handleSelect(game: any) {
    if (!pile.find((g) => g.id === game.id)) {
      setPile((prev) => [...prev, game])
    }
  }

  function removeGame(id: number) {
    setPile((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <main className="p-6 space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-center">🎮 Achievagrad</h1>
      <SearchBar onSelect={handleSelect} />

      {pile.length > 0 && (
        <>
          <h2 className="text-xl font-semibold">🗂️ Pile of Shame</h2>
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {pile.map((game) => (
              <GameCard key={game.id} game={game} onRemove={() => removeGame(game.id)} />
            ))}
          </section>
        </>
      )}
    </main>
  )
}