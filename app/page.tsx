import type { Metadata } from 'next'
import LandingPage from '@/app/components/LandingPage'

export const metadata: Metadata = {
  title: 'LofiStudio - Your Personal Focus Space & Ambient Mixer',
  description: 'Boost your productivity with LofiStudio. Aesthetic background mixer, ambient sounds, music, Pomodoro timer, and many free widgets. No login required. Enter the flow state now.',
}

export default function Page() {
  return <LandingPage />
}