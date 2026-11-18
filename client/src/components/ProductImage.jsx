import { useState } from 'react'
import { CATEGORY_EMOJI, hueOf } from '../format'

// Works for a product ({ images: [...] }) and for a cart line ({ image }).
// With no photo, it shows warm gradient art with the category emoji.
export default function ProductImage({ item }) {
  const [failed, setFailed] = useState(false)
  const src = item.images ? item.images[0] : item.image

  if (src && !failed) {
    return (
      <img className="pimg" src={src} alt={item.name} loading="lazy" onError={() => setFailed(true)} />
    )
  }
  const h = hueOf(item.name)
  return (
    <div className="pimg art" style={{ '--h': h, '--h2': h + 25 }} role="img" aria-label={item.name}>
      <span>{CATEGORY_EMOJI[item.category] || '🧵'}</span>
    </div>
  )
}
