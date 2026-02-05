/**
 * StudioClient (V2 Facade)
 * This file now delegates entirely to the modular V2 architecture
 */

'use client';

import StudioClientV2 from '@/app/components/StudioV2';

export default function StudioClient() {
    return <StudioClientV2 />;
}
