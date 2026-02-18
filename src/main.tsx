import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import BBCard from './BBCard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BBCard />
  </StrictMode>,
)
