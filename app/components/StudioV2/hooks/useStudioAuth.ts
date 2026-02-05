'use client';

import { useSession, signIn } from 'next-auth/react';
import { useCallback, useMemo } from 'react';
import { useSettingsStore } from '@/lib/stores/settings.store';

export function useStudioAuth() {
    const { data: session } = useSession();
    const integrations = useSettingsStore(s => s.settings.integrations);

    const googleCalendarEnabled = integrations.googleCalendar.enabled;
    const googleTasksEnabled = integrations.googleTasks.enabled;

    const grantedScopes = useMemo(() => {
        return ((session as any)?.scope as string | undefined)?.split(' ') || [];
    }, [session]);

    const requiredScopes = useMemo(() => {
        const scopes = [];
        if (googleCalendarEnabled) scopes.push('https://www.googleapis.com/auth/calendar.events');
        if (googleTasksEnabled) scopes.push('https://www.googleapis.com/auth/tasks');
        return scopes;
    }, [googleCalendarEnabled, googleTasksEnabled]);

    const needsReauth = requiredScopes.some(sc => !grantedScopes.includes(sc));

    const handleReauth = useCallback(() => {
        signIn('google', { callbackUrl: '/studio' });
    }, []);

    return {
        session,
        needsReauth,
        handleReauth,
        hasUser: !!session?.user
    };
}
