import type { Metadata } from 'next'
import StudioClient from '@/app/components/Studio/StudioClient'

export const metadata: Metadata = {
  title: 'Studio - Focus space',
}

export default function Page() {
  return <StudioClient />
}
