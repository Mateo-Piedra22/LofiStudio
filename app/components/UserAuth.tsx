'use client'

import { useEffect, useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, User, Cloud } from "lucide-react"
import ProfileModal from "./ProfileModal"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { useLocalStorage } from "@/lib/hooks/useLocalStorage"

export default function UserAuth() {
    const { data: session } = useSession()
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [showConsent, setShowConsent] = useState(false)
    const [googleCalendarEnabled, setGoogleCalendarEnabled] = useLocalStorage('googleCalendarEnabled', true)
    const [googleTasksEnabled, setGoogleTasksEnabled] = useLocalStorage('googleTasksEnabled', true)

    useEffect(() => {
        if (session?.user) {
            const asked = typeof window !== 'undefined' ? localStorage.getItem('consentAsked') : 'true'
            if (!asked) setShowConsent(true)
        }
    }, [session])

    const grantedScopes = ((session as any)?.scope as string | undefined)?.split(' ') || []
    const requiredScopes: string[] = []
    if (googleCalendarEnabled) requiredScopes.push('https://www.googleapis.com/auth/calendar.events')
    if (googleTasksEnabled) requiredScopes.push('https://www.googleapis.com/auth/tasks')
    const needsReauth = requiredScopes.some(sc => !grantedScopes.includes(sc))

    if (session?.user) {
        return (
            <>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-ring hover:ring-primary transition-all">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={session.user.image || ''} alt={session.user.name || ''} />
                                <AvatarFallback className="bg-primary/20 text-primary">{session.user.name?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 glass border-border text-foreground" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{session.user.name}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {session.user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                            <a href="/about">About</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                            <a href="/legal">Legales</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                            <a href="/terms">Términos y Condiciones</a>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                            <a href="/cookies">Política de Cookies</a>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem onClick={() => setShowProfileModal(true)} className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Edit Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem className={`focus:bg-accent/10 focus:text-foreground cursor-pointer ${needsReauth ? 'text-amber-500' : ''}`}> 
                            <Cloud className={`mr-2 h-4 w-4 ${needsReauth ? 'text-amber-500' : 'text-green-400'}`} />
                            <span>{needsReauth ? 'Permissions incomplete' : 'Sync Active'}</span>
                        </DropdownMenuItem>
                        {needsReauth && (
                            <DropdownMenuItem onClick={() => handleSignIn()} className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                                <Cloud className="mr-2 h-4 w-4" />
                                <span>Re-auth with Google</span>
                            </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem onClick={() => signOut()} className="focus:bg-destructive/20 focus:text-destructive text-destructive cursor-pointer">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <ProfileModal isOpen={showProfileModal} onClose={() => setShowProfileModal(false)} />
                <Dialog open={showConsent} onOpenChange={(o) => { setShowConsent(o); if (!o && typeof window !== 'undefined') localStorage.setItem('consentAsked', 'true') }}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle className="text-foreground">Google Integrations</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-foreground">Enable Google Calendar</p>
                                    <p className="text-xs text-muted-foreground">Request access during next login.</p>
                                </div>
                                <Switch checked={googleCalendarEnabled} onCheckedChange={(v) => setGoogleCalendarEnabled(!!v)} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-foreground">Enable Google Tasks</p>
                                    <p className="text-xs text-muted-foreground">Request access during next login.</p>
                                </div>
                                <Switch checked={googleTasksEnabled} onCheckedChange={(v) => setGoogleTasksEnabled(!!v)} />
                            </div>
                            <p className="text-xs text-muted-foreground">Sign out and sign in again to apply changes.</p>
                            <div className="flex justify-end">
                                <Button variant="secondary" onClick={() => setShowConsent(false)}>Done</Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    const handleSignIn = () => {
        const base = ['openid','email','profile']
        const extra: string[] = []
        if (googleCalendarEnabled) extra.push('https://www.googleapis.com/auth/calendar.events')
        if (googleTasksEnabled) extra.push('https://www.googleapis.com/auth/tasks')
        const scope = [...base, ...extra].join(' ')
        const params = new URLSearchParams({ callbackUrl: '/', scope })
        if (extra.length) params.set('prompt','consent')
        params.set('access_type','offline')
        params.set('include_granted_scopes','true')
        window.location.href = `/api/auth/signin/google?${params.toString()}`
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-ring hover:ring-primary transition-all">
                    <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center">
                        <User className="h-4 w-4" />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass border-border text-foreground" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Invitado</p>
                        <p className="text-xs leading-none text-muted-foreground">Explora LofiStudio</p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={() => handleSignIn()} className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Sign In</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                    <a href="/about">About</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                    <a href="/legal">Legales</a>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="focus:bg-accent/10 focus:text-foreground cursor-pointer">
                    <a href="/terms">Términos y Condiciones</a>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
