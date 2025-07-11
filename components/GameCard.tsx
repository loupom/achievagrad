interface GameCardProps {
  game: {
    id: number
    name: string
    cover?: { image_id: string }
    first_release_date?: number
    genres?: { name: string }[]
  }
  onRemove?: () => void
}

function getCoverUrl(image_id: string, size: string = 'cover_big') {
  return `https://images.igdb.com/igdb/image/upload/t_${size}/${image_id}.jpg`
}

function formatYear(timestamp: number | undefined) {
  if (!timestamp) return 'N/A'
  return new Date(timestamp * 1000).getFullYear()
}

export default function GameCard({ game, onRemove }: GameCardProps) {
  return (
    <div className="border rounded-xl p-4 shadow hover:shadow-lg transition relative">
      {game.cover?.image_id && (
        <img
          src={getCoverUrl(game.cover.image_id)}
          alt={`Cover of ${game.name}`}
          className="w-full h-48 object-cover rounded"
        />
      )}
      <h2 className="text-lg font-semibold mt-2">{game.name}</h2>
      <p className="text-sm text-gray-500">
        {game.genres?.map((g) => g.name).join(', ') || 'Genre inconnu'}
      </p>
      <p className="text-sm text-gray-400">{formatYear(game.first_release_date)}</p>

      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 text-sm bg-red-500 text-white px-2 py-1 rounded"
        >
          Retirer
        </button>
      )}
    </div>
  )
}