'use client';

import { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import AnimatedIcon from '@/app/components/ui/animated-icon';
import { Pause, Play, Music2, ChevronUp, ChevronDown, Search, Shuffle, Repeat, SkipBack, SkipForward, List, X, BarChart3 } from 'lucide-react'
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import type React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface VideoInfo {
  id: string;
  kind?: 'video' | 'playlist';
  title: string;
  thumbnail: string;
  duration?: string | null;
  viewCount?: number;
  isOfficial?: boolean;
  itemCount?: number;
  channelTitle?: string;
}

interface PlayerProps {
  currentVideo: VideoInfo | null;
  setCurrentVideo: (video: VideoInfo | null) => void;
  onOpenStats?: () => void;
}

export default function Player({ currentVideo, setCurrentVideo, onOpenStats }: PlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useLocalStorage('playerVolume', 50);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<VideoInfo[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [playlist, setPlaylist] = useLocalStorage<VideoInfo[]>('playlist', []);
  const [currentIndex, setCurrentIndex] = useLocalStorage('currentPlaylistIndex', 0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [repeat, setRepeat] = useLocalStorage('playerRepeat', false);
  const [shuffle, setShuffle] = useLocalStorage('playerShuffle', false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showVideoBg, setShowVideoBg] = useLocalStorage('playerVideoBg', false);
  const [mode, setMode] = useLocalStorage<'radio' | 'youtube'>('playerMode', 'radio');
  const [isMobile, setIsMobile] = useState(false);
  type RadioStation = { stationuuid: string; name: string; favicon: string; url_resolved: string; country?: string; tags?: string };
  const [radioStation, setRadioStation] = useLocalStorage<RadioStation | null>('radioStation', null);
  const [radioResults, setRadioResults] = useState<RadioStation[]>([]);
  const [isRadioSearching, setIsRadioSearching] = useState(false);
  const [radioList, setRadioList] = useLocalStorage<RadioStation[]>('radioList', []);
  const [radioIndex, setRadioIndex] = useLocalStorage('radioIndex', 0);
  const [radioQuery, setRadioQuery] = useLocalStorage('radioQuery', 'lofi');
  const [radioGenre, setRadioGenre] = useLocalStorage<'lofi' | 'chillhop' | 'jazzhop'>('radioGenre', 'lofi');
  const curatedDefaults: RadioStation[] = [
    { stationuuid: 'curated-1', name: 'Laut.fm Lofi', favicon: '', url_resolved: 'https://lofi.stream.laut.fm/lofi', country: 'DE', tags: 'lofi' },
    { stationuuid: 'curated-2', name: 'REYFM #lofi', favicon: '', url_resolved: 'https://listen.reyfm.de/lofi_128kbps.mp3', country: 'DE', tags: 'lofi' },
  ];
  const curatedByGenre: Record<'lofi' | 'chillhop' | 'jazzhop', RadioStation[]> = {
    lofi: curatedDefaults,
    chillhop: [
      { stationuuid: 'curated-chillhop-1', name: 'FluxFM Chillhop', favicon: '', url_resolved: 'https://streams.fluxfm.de/Chillhop/mp3-128/', country: 'DE', tags: 'chillhop' },
    ],
    jazzhop: [],
  };
  const linkPreviewRef = useRef<VideoInfo | null>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpanded) setIsExpanded(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isExpanded]);
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [userPaused, setUserPaused] = useLocalStorage('playerUserPaused', false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 1,
      controls: 0,
      modestbranding: 1,
      playsinline: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : undefined,
    },
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (volume !== undefined) {
      event.target.setVolume(volume);
    }
    try { event.target.mute(); } catch {}
    setDuration(event.target.getDuration());
    setError(null);
    try { if (!userPaused && currentVideo) event.target.playVideo(); } catch {}
  };

  const onReadyBg: YouTubeProps['onReady'] = (e) => {
    try { e.target.mute(); e.target.playVideo(); } catch {}
  };

  const onError: YouTubeProps['onError'] = (event) => {
    console.error('YouTube Player Error:', event.data);
    let errorMessage = 'Failed to load video.';
    switch (event.data) {
      case 2: errorMessage = 'Invalid video ID.'; break;
      case 5: errorMessage = 'HTML5 Player error.'; break;
      case 100: errorMessage = 'Video not found or removed.'; break;
      case 101:
      case 150: errorMessage = 'Playback not allowed by owner on this site.'; break;
    }
    setError(`${errorMessage} Try searching for another song.`);
    setIsPlaying(false);
  };

  useEffect(() => {
    if (isPlaying && playerRef.current) {
      progressInterval.current = setInterval(() => {
        if (playerRef.current) {
          try {
            setCurrentTime(playerRef.current.getCurrentTime());
          } catch (e) { }
        }
      }, 1000);
    } else {
      if (progressInterval.current) clearInterval(progressInterval.current);
    }
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    const check = () => { try { setIsMobile((typeof window !== 'undefined' ? window.innerWidth : 1024) < 768); } catch {} };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    try {
      const active = showVideoBg && mode !== 'radio' && !!currentVideo;
      window.dispatchEvent(new CustomEvent('player:show-video-bg', { detail: active }));
    } catch {}
  }, [showVideoBg, mode, currentVideo]);

  const handlePlayPause = () => {
    if (mode === 'radio') {
      if (!audioRef.current || !radioStation) return;
      try {
        if (isPlaying) { audioRef.current.pause(); setUserPaused(true); }
        else { audioRef.current.play().catch(() => {}); setUserPaused(false); }
        setIsPlaying(!isPlaying);
        setError(null);
      } catch {
        setError('Playback error. Please refresh the page.');
      }
      return;
    }
    if (!playerRef.current || !currentVideo) return;
    try {
      if (isPlaying) { playerRef.current.pauseVideo(); setUserPaused(true); }
      else { try { playerRef.current.unMute(); } catch {}; playerRef.current.playVideo(); setUserPaused(false); }
      setIsPlaying(!isPlaying);
      setError(null);
    } catch (e) {
      setError('Playback error. Please refresh the page.');
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    const v = Math.max(0, Math.min(100, newVolume));
    setVolume(v);
    if (mode === 'radio') {
      if (audioRef.current) audioRef.current.volume = v / 100;
      return;
    }
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(v);
      } catch (e) { }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    if (mode === 'radio') {
      setIsRadioSearching(true);
      setError(null);
      try {
        const params = new URLSearchParams({ limit: '200', hidebroken: 'true', order: 'name' });
        params.set('name', searchQuery.trim());
        const u = `https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`;
        const r = await fetch(u);
        const d = await r.json();
        const arr = Array.isArray(d) ? d : [];
        setRadioResults(arr);
        setRadioList(arr);
        setRadioIndex(0);
        setRadioQuery(searchQuery.trim());
      } catch {
        setRadioResults([]);
        setError('Failed to search stations.');
      } finally {
        setIsRadioSearching(false);
      }
      return;
    }
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(`/api/youtube/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      if (data.error) {
        setError(data.error);
        setSearchResults([]);
        return;
      }
      setSearchResults(data.items || []);
    } catch (error) {
      setError('Failed to search videos. Please check your connection.');
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) { setSearchResults([]); setRadioResults([]); return; }
    const id = setTimeout(() => { handleSearch(); }, 300);
    return () => clearTimeout(id);
  }, [searchQuery, mode]);

  const formatIsoDuration = (iso?: string | null): string => {
    try {
      if (!iso) return '';
      const re = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
      const m = iso.match(re);
      if (!m) return '';
      const h = parseInt(m[1] || '0', 10);
      const min = parseInt(m[2] || '0', 10);
      const s = parseInt(m[3] || '0', 10);
      const total = h * 3600 + min * 60 + s;
      const mm = String(Math.floor(total / 60) % 60).padStart(2, '0');
      const ss = String(total % 60).padStart(2, '0');
      return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
    } catch { return ''; }
  };

  const formatViews = (n?: number): string => {
    try {
      const v = typeof n === 'number' ? n : 0;
      if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B views`;
      if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M views`;
      if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K views`;
      return `${v} views`;
    } catch { return ''; }
  };

  const formatItems = (n?: number): string => {
    try {
      const v = typeof n === 'number' ? n : 0;
      if (v >= 1_000) return `${(v / 1_000).toFixed(1)}k items`;
      return `${v} items`;
    } catch { return ''; }
  };

  useEffect(() => {
    const enrich = async () => {
      try {
        if (mode !== 'youtube') return;
        if (!Array.isArray(searchResults) || searchResults.length === 0) return;
        const missing = searchResults.filter(v => !v.duration && (v as any).kind !== 'playlist');
        if (missing.length === 0) return;
        const updates = await Promise.all(missing.map(async v => {
          try {
            const r = await fetch(`/api/youtube/video?id=${encodeURIComponent(v.id)}`);
            const d = await r.json();
            const item: VideoInfo = d.item || v;
            return { id: v.id, duration: item.duration || null } as { id: string; duration: string | null };
          } catch { return { id: v.id, duration: null }; }
        }));
        const mapDur = new Map(updates.map(u => [u.id, u.duration]));
        setSearchResults(prev => prev.map(v => ({ ...v, duration: mapDur.has(v.id) ? mapDur.get(v.id) || null : v.duration || null })));
      } catch {}
    };
    enrich();
  }, [searchResults, mode]);

  useEffect(() => {
    const once = () => {
      try {
        if (userPaused) return;
        if (mode === 'radio') {
          if (audioRef.current && radioStation) {
            audioRef.current.play().catch(() => {});
          }
        } else {
          if (playerRef.current && currentVideo) {
            playerRef.current.unMute();
            playerRef.current.playVideo();
          }
        }
      } catch {}
    };
    window.addEventListener('click', once, { once: true });
    return () => window.removeEventListener('click', once as any);
  }, [currentVideo, radioStation, mode, userPaused]);

  useEffect(() => {
    const boot = async () => {
      if (mode !== 'radio') return;
      try {
        const params = new URLSearchParams({ hidebroken: 'true', limit: '200', order: 'name' });
        params.set('tag', radioGenre);
        const r = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`);
        const d = await r.json();
        if (Array.isArray(d) && d.length > 0) {
          const list: RadioStation[] = d.map((s: any) => ({ stationuuid: s.stationuuid, name: s.name, favicon: s.favicon || '', url_resolved: s.url_resolved, country: s.country, tags: s.tags }));
          setRadioList(list);
          setRadioIndex(0);
          setRadioQuery('');
          setRadioStation(list[0]);
        } else {
          setRadioList(curatedByGenre[radioGenre]);
          setRadioIndex(0);
          setRadioQuery('');
          setRadioStation(curatedByGenre[radioGenre][0] || null);
        }
      } catch {
        setRadioList(curatedByGenre[radioGenre]);
        setRadioIndex(0);
        setRadioQuery('');
        setRadioStation(curatedByGenre[radioGenre][0] || null);
      }
    };
    boot();
  }, [mode, radioGenre]);

  const loadMoreStations = async () => {
    try {
      const params = new URLSearchParams({ limit: '200', hidebroken: 'true', order: 'name', offset: String(radioList.length) });
      if (radioQuery) params.set('name', radioQuery);
      else params.set('tag', radioGenre);
      const u = `https://de1.api.radio-browser.info/json/stations/search?${params.toString()}`;
      const r = await fetch(u);
      const d = await r.json();
      if (Array.isArray(d) && d.length > 0) {
        const more: RadioStation[] = d.map((s: any) => ({ stationuuid: s.stationuuid, name: s.name, favicon: s.favicon || '', url_resolved: s.url_resolved, country: s.country, tags: s.tags }));
        setRadioList([...radioList, ...more]);
      }
    } catch {}
  };

  const parseYouTubeUrl = (s: string): { type: 'video' | 'playlist'; id: string } | null => {
    try {
      const u = new URL(s);
      const host = u.hostname.replace('www.', '');
      if (host === 'youtu.be') {
        const id = u.pathname.slice(1);
        return id ? { type: 'video', id } : null;
      }
      if (host.includes('youtube.com')) {
        const list = u.searchParams.get('list');
        const v = u.searchParams.get('v');
        if (list && !v) return { type: 'playlist', id: list };
        if (list && v) return { type: 'playlist', id: list };
        if (v) return { type: 'video', id: v };
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts[0] === 'playlist' && list) return { type: 'playlist', id: list };
        if (parts[0] === 'embed' && parts[1]) return { type: 'video', id: parts[1] };
      }
      return null;
    } catch { return null; }
  };

  const handleImportLink = async () => {
    const parsed = parseYouTubeUrl(searchQuery.trim());
    if (!parsed) return;
    setError(null);
    if (parsed.type === 'video') {
      try {
        const r = await fetch(`/api/youtube/video?id=${encodeURIComponent(parsed.id)}`);
        const d = await r.json();
        const item: VideoInfo = d.item || { id: parsed.id, title: 'YouTube Video', thumbnail: `https://img.youtube.com/vi/${parsed.id}/mqdefault.jpg` };
        setCurrentVideo(item);
        setIsPlaying(true);
        if (!playlist.find(v => v.id === item.id)) {
          setPlaylist([...playlist, item]);
          setCurrentIndex(playlist.length);
        } else {
          setCurrentIndex(playlist.findIndex(v => v.id === item.id));
        }
        setShowSearch(false);
      } catch {
        setError('Failed to load video.');
      }
    } else {
      try {
        const r = await fetch(`/api/youtube/playlist?id=${encodeURIComponent(parsed.id)}`);
        const d = await r.json();
        const items: VideoInfo[] = d.items || [];
        if (items.length > 0) {
          setPlaylist(items);
          setCurrentIndex(0);
          setCurrentVideo(items[0]);
          setIsPlaying(true);
          setShowSearch(false);
        } else {
          setError('Playlist empty.');
        }
      } catch {
        setError('Failed to load playlist.');
      }
    }
  };

  useEffect(() => {
    const parsed = parseYouTubeUrl(searchQuery.trim());
    if (!parsed) { linkPreviewRef.current = null; return; }
    if (parsed.type === 'video') {
      fetch(`/api/youtube/video?id=${encodeURIComponent(parsed.id)}`).then(r => r.json()).then(d => { linkPreviewRef.current = d.item || null; }).catch(() => { linkPreviewRef.current = null; });
    } else {
      fetch(`/api/youtube/playlist?id=${encodeURIComponent(parsed.id)}`).then(r => r.json()).then(d => { const it = (d.items || [])[0]; linkPreviewRef.current = it || null; }).catch(() => { linkPreviewRef.current = null; });
    }
  }, [searchQuery]);

  const handleSelectVideo = async (video: VideoInfo) => {
    try {
      if ((video as any).kind === 'playlist') {
        const resp = await fetch(`/api/youtube/playlist?id=${encodeURIComponent(video.id)}`);
        const d = await resp.json();
        const items: VideoInfo[] = (d.items || []).map((it: any) => ({ id: it.id, title: it.title, thumbnail: it.thumbnail }));
        if (items.length > 0) {
          const newPlaylist = [...playlist, ...items.filter(it => !playlist.find(v => v.id === it.id))];
          setPlaylist(newPlaylist);
          setCurrentVideo(items[0]);
          setCurrentIndex(newPlaylist.findIndex(v => v.id === items[0].id));
          setMode('youtube');
          setSearchResults([]);
          setSearchQuery('');
          setIsPlaying(true);
          setUserPaused(false);
          setError(null);
          return;
        }
      }
      setCurrentVideo(video);
      setSearchResults([]);
      setSearchQuery('');
      setIsPlaying(true);
      setUserPaused(false);
      setError(null);
      if (!playlist.find(v => v.id === video.id)) {
        setPlaylist([...playlist, video]);
        setCurrentIndex(playlist.length);
      } else {
        setCurrentIndex(playlist.findIndex(v => v.id === video.id));
      }
      setMode('youtube');
    } catch {}
  };

  const handleNext = () => {
    if (mode === 'radio') {
      if (!audioRef.current) return;
      if (radioList.length === 0) {
        setRadioList(curatedByGenre[radioGenre]);
        setRadioIndex(0);
        setRadioStation(curatedByGenre[radioGenre][0] || null);
        return;
      }
      let idx = radioIndex + 1;
      if (idx >= radioList.length) {
        loadMoreStations().then(() => {}).catch(() => {});
        idx = 0;
      }
      setRadioIndex(idx);
      const st = radioList[idx];
      setRadioStation(st);
      audioRef.current.src = st.url_resolved;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      setError(null);
      return;
    }
    if (playlist.length === 0) return;
    let nextIndex;
    if (shuffle) {
      nextIndex = Math.floor(Math.random() * playlist.length);
    } else {
      nextIndex = (currentIndex + 1) % playlist.length;
    }
    setCurrentIndex(nextIndex);
    setCurrentVideo(playlist[nextIndex]);
    setIsPlaying(true);
    setError(null);
  };

  const handlePrevious = () => {
    if (mode === 'radio') {
      if (!audioRef.current) return;
      if (radioList.length === 0) {
        setRadioList(curatedByGenre[radioGenre]);
        setRadioIndex(0);
        setRadioStation(curatedByGenre[radioGenre][0] || null);
        return;
      }
      const idx = radioIndex === 0 ? radioList.length - 1 : radioIndex - 1;
      setRadioIndex(idx);
      const st = radioList[idx];
      setRadioStation(st);
      audioRef.current.src = st.url_resolved;
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
      setError(null);
      return;
    }
    if (playlist.length === 0) return;
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentVideo(playlist[prevIndex]);
      setIsPlaying(true);
      setUserPaused(false);
      setError(null);
  };

  const handleRemoveFromPlaylist = (index: number) => {
    const newPlaylist = playlist.filter((_, i) => i !== index);
    setPlaylist(newPlaylist);
    if (index === currentIndex && newPlaylist.length > 0) {
      setCurrentVideo(newPlaylist[0]);
      setCurrentIndex(0);
    }
  };

  const handleSeek = (time: number) => {
    if (playerRef.current) {
      try {
        playerRef.current.seekTo(time);
        setCurrentTime(time);
      } catch (e) { }
    }
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    setIsPlaying(event.data === 1);
    if (event.data === 0) {
      if (userPaused) return;
      if (mode !== 'radio') {
        if (repeat) playerRef.current?.playVideo();
        else if (playlist.length > 0) handleNext();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  const collapsedUI = (
    isMobile ? (
      <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-auto">
        <div className="glass-widget border-t px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {mode === 'radio' && radioStation && (
              <div className="flex items-center gap-3">
                {radioStation.favicon ? (
                  <img src={radioStation.favicon} alt={radioStation.name} className={`w-10 h-10 rounded object-cover ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                ) : (
                  <AnimatedIcon animationSrc="/lottie/Music2.json" fallbackIcon={Music2} className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
                )}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{radioStation.name}</p>
                  <p className="text-[11px] text-muted-foreground">{isPlaying ? 'Playing' : 'Paused'}</p>
                </div>
              </div>
            )}
            {mode !== 'radio' && currentVideo && (
              <div className="flex items-center gap-3">
                <img src={currentVideo.thumbnail} alt={currentVideo.title} className={`w-10 h-10 rounded object-cover ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{currentVideo.title}</p>
                  <p className="text-[11px] text-muted-foreground">{isPlaying ? 'Playing' : 'Paused'}</p>
                </div>
              </div>
            )}
            {mode !== 'radio' && !currentVideo && (
              <p className="text-sm text-muted-foreground">No music selected</p>
            )}
          </div>
          <div className="flex items-center gap-4 flex-wrap justify-end">
            <Button
              onClick={handlePlayPause}
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-primary text-primary-foreground"
              disabled={mode === 'radio' ? !radioStation : !currentVideo}
            >
              {isPlaying ? (
                <AnimatedIcon animationSrc="/lottie/Pause.json" fallbackIcon={Pause} className="w-5 h-5" />
              ) : (
                <AnimatedIcon animationSrc="/lottie/Play.json" fallbackIcon={Play} className="w-5 h-5 ml-0.5" />
              )}
            </Button>
            <Badge
              variant={mode === 'radio' ? 'secondary' : 'default'}
              className="px-2 py-0.5 text-[10px] cursor-pointer"
              onClick={() => setMode(mode === 'radio' ? 'youtube' : 'radio')}
            >
              {mode === 'radio' ? 'Lofi Radio' : 'YouTube'}
            </Badge>
            {onOpenStats && (
              <Button onClick={onOpenStats} variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-accent/10 transition-colors">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
              </Button>
            )}
            <button onClick={() => setIsExpanded(true)} className="p-2 rounded-full hover:bg-accent/10 transition-colors">
              <AnimatedIcon animationSrc="/lottie/ChevronUp.json" fallbackIcon={ChevronUp} className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    ) : (
      <div className="fixed left-1/2 -translate-x-1/2 z-[100] pointer-events-auto" style={{ bottom: `calc(16px + env(safe-area-inset-bottom))` }}>
        <div className="glass-panel rounded-full p-1.5 pr-3 flex items-center gap-2 shadow-2xl border border-border hover:scale-105 transition-all group">
          <button
            onClick={handlePlayPause}
            disabled={mode === 'radio' ? !radioStation : !currentVideo}
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center transition-all shadow-lg",
              mode === 'radio'
                ? radioStation ? "bg-primary text-primary-foreground hover:scale-110" : "bg-accent/20 text-muted-foreground cursor-not-allowed"
                : currentVideo ? "bg-primary text-primary-foreground hover:scale-110" : "bg-accent/20 text-muted-foreground cursor-not-allowed"
            )}
          >
            {isPlaying ? (
              <AnimatedIcon animationSrc="/lottie/Pause.json" fallbackIcon={Pause} className="w-5 h-5" />
            ) : (
              <AnimatedIcon animationSrc="/lottie/Play.json" fallbackIcon={Play} className="w-5 h-5 ml-0.5" />
            )}
          </button>

        {mode === 'radio' && radioStation && (
          <div className="flex items-center gap-3">
            {radioStation.favicon ? (
              <img
                src={radioStation.favicon}
                alt={radioStation.name}
                className={`w-8 h-8 rounded-lg object-cover ${isPlaying ? 'animate-spin' : ''}`}
                style={{ animationDuration: '6s' }}
              />
            ) : (
              <AnimatedIcon animationSrc="/lottie/Music2.json" fallbackIcon={Music2} className={`w-6 h-6 ${isPlaying ? 'animate-pulse' : ''}`} />
            )}
            <div className="max-w-[180px]">
              <p className="text-xs font-medium text-foreground truncate">{radioStation.name}</p>
              <p className="text-[10px] text-muted-foreground">{isPlaying ? 'Playing' : 'Paused'}</p>
            </div>
          </div>
        )}
        {mode !== 'radio' && currentVideo && (
          <div className="flex items-center gap-3">
            <img
              src={currentVideo.thumbnail}
              alt={currentVideo.title}
              className={`w-8 h-8 rounded-lg object-cover ${isPlaying ? 'animate-spin' : ''}`}
              style={{ animationDuration: '6s' }}
            />
            <div className="max-w-[180px]">
              <p className="text-xs font-medium text-foreground truncate">
                {currentVideo.title}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {isPlaying ? 'Playing' : 'Paused'}
              </p>
            </div>
          </div>
        )}

        {mode !== 'radio' && !currentVideo && (
          <p className="text-xs text-muted-foreground">No music selected</p>
        )}

        <Badge
          variant={mode === 'radio' ? 'secondary' : 'default'}
          className="ml-1 px-2 py-0.5 text-[10px] cursor-pointer"
          onClick={() => setMode(mode === 'radio' ? 'youtube' : 'radio')}
        >
          {mode === 'radio' ? 'Lofi Radio' : 'YouTube'}
        </Badge>

          <button
            onClick={() => setIsExpanded(true)}
            className="ml-2 p-2 rounded-full hover:bg-accent/10 transition-colors"
          >
            <AnimatedIcon animationSrc="/lottie/ChevronUp.json" fallbackIcon={ChevronUp} className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    )
  );

  const expandedUI = (
    isMobile ? (
      <div className="fixed inset-0 z-[120] flex items-end justify-center">
        <div className="w-full max-w-none glass-panel rounded-t-3xl overflow-hidden shadow-2xl border border-border">
          <div className="flex items-center justify-between px-6 py-3 bg-background/50 border-b border-border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lofi Player</span>
            </div>
            <button onClick={() => setIsExpanded(false)} className="text-muted-foreground hover:text-foreground transition-colors">
              <AnimatedIcon animationSrc="/lottie/X.json" fallbackIcon={X} className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6 space-y-6">
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-center justify-between">
                <p className="text-sm text-destructive">{error}</p>
                {currentVideo && (
                  <a href={`https://youtube.com/watch?v=${currentVideo.id}`} target="_blank" rel="noopener noreferrer" className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90">Open on YouTube</a>
                )}
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant={mode === 'radio' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('radio')}>Radio</Button>
                <Button variant={mode === 'youtube' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('youtube')}>YouTube</Button>
              </div>
              <div className="flex items-center gap-2">
                {mode === 'radio' ? (
                  <div className="flex items-center gap-1">
                    <Button variant={radioGenre === 'lofi' ? 'default' : 'ghost'} size="sm" onClick={() => { setRadioGenre('lofi'); setRadioQuery(''); setRadioResults([]); }}>Lofi</Button>
                    <Button variant={radioGenre === 'chillhop' ? 'default' : 'ghost'} size="sm" onClick={() => { setRadioGenre('chillhop'); setRadioQuery(''); setRadioResults([]); }}>Chillhop</Button>
                    <Button variant={radioGenre === 'jazzhop' ? 'default' : 'ghost'} size="sm" onClick={() => { setRadioGenre('jazzhop'); setRadioQuery(''); setRadioResults([]); }}>Jazzhop</Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">Show Video</span>
                    <Switch checked={showVideoBg} onCheckedChange={(v) => setShowVideoBg(!!v)} />
                    <Button onClick={() => setShowSearch(true)} variant="ghost" size="sm" className="gap-2">
                      <AnimatedIcon animationSrc="/lottie/Search.json" fallbackIcon={Search} className="w-4 h-4" />
                      Search
                    </Button>
                  </div>
                )}
              </div>
            </div>
            {showSearch && (
              <div className="fixed inset-0 z-[130] flex items-end justify-center" onClick={() => { setShowSearch(false); setSearchResults([]); }}>
                <div className="w-full glass-panel rounded-t-2xl border border-border shadow-2xl p-4" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Button variant={mode === 'radio' ? 'default' : 'ghost'} size="sm" onClick={() => { setMode('radio'); setSearchQuery(''); setSearchResults([]); }}>Radio</Button>
                      <Button variant={mode === 'youtube' ? 'default' : 'ghost'} size="sm" onClick={() => { setMode('youtube'); setSearchQuery(''); setRadioResults([]); }}>YouTube</Button>
                    </div>
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={mode === 'radio' ? 'Search radio stations' : 'Search or paste a YouTube link'} className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { if (mode === 'radio') setSearchQuery(searchQuery.trim()); else handleImportLink(); } }} />
                    <AnimatedIcon animationSrc="/lottie/Search.json" fallbackIcon={Search} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    {mode === 'youtube' && (() => {
                      const parsed = parseYouTubeUrl(searchQuery.trim());
                      if (!parsed) return null;
                      return (
                        <div className="absolute right-24 top-1/2 -translate-y-1/2">
                          <Badge variant={parsed.type === 'playlist' ? 'secondary' : 'default'} className="px-2 py-0.5 text-[10px]">{parsed.type === 'playlist' ? 'Playlist link' : 'Video link'}</Badge>
                        </div>
                      );
                    })()}
                    {mode === 'youtube' && linkPreviewRef.current && (
                      <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl overflow-hidden shadow-xl z-50">
                        <div className="flex items-center gap-3 p-3">
                          <img src={linkPreviewRef.current.thumbnail} className="w-10 h-10 rounded object-cover" />
                          <span className="text-xs text-foreground truncate">{linkPreviewRef.current.title}</span>
                          <Button onClick={handleImportLink} size="sm" className="ml-auto">Add</Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {mode === 'radio' ? (
              <div className="text-center py-4 text-muted-foreground text-sm">Use the controls below to manage playback.</div>
            ) : null}
            <div className="flex items-center justify-between">
              {mode !== 'radio' && (
                <div className="flex items-center gap-2">
                  <Button onClick={handlePrevious} variant="ghost" size="icon" className="text-foreground hover:scale-110 transition-transform"><AnimatedIcon animationSrc="/lottie/SkipBack.json" fallbackIcon={SkipBack} className="w-5 h-5" /></Button>
                  <Button onClick={handlePlayPause} className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all shadow-lg flex items-center justify-center">{isPlaying ? <AnimatedIcon animationSrc="/lottie/Pause.json" fallbackIcon={Pause} className="w-5 h-5" /> : <AnimatedIcon animationSrc="/lottie/Play.json" fallbackIcon={Play} className="w-5 h-5 ml-0.5" />}</Button>
                  <Button onClick={handleNext} variant="ghost" size="icon" className="text-foreground hover:scale-110 transition-transform"><AnimatedIcon animationSrc="/lottie/SkipForward.json" fallbackIcon={SkipForward} className="w-5 h-5" /></Button>
                </div>
              )}
              <div className="w-28 hidden sm:flex items-center gap-1">
                <div className="flex-1 h-2 bg-muted rounded-full relative cursor-pointer" onClick={(e: React.MouseEvent<HTMLDivElement>) => { const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect(); const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)); handleVolumeChange(Math.round(ratio * 100)); }}>
                  <div className="h-full bg-primary rounded-full" style={{ width: `${volume}%` }} />
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleVolumeChange(Math.max(0, volume - 10))}>-</Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleVolumeChange(Math.min(100, volume + 10))}>+</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="fixed left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-auto" style={{ bottom: `calc(16px + env(safe-area-inset-bottom))` }}>
        <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-border">
          <div className="flex items-center justify-between px-6 py-3 bg-background/50 border-b border-border">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lofi Player</span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <AnimatedIcon animationSrc="/lottie/ChevronDown.json" fallbackIcon={ChevronDown} className="w-4 h-4" />
            </button>
          </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 flex items-center justify-between">
              <p className="text-sm text-destructive">{error}</p>
              {currentVideo && (
                <a
                  href={`https://youtube.com/watch?v=${currentVideo.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs px-2 py-1 rounded bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Open on YouTube
                </a>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant={mode === 'radio' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('radio')}>Radio</Button>
              <Button variant={mode === 'youtube' ? 'default' : 'ghost'} size="sm" onClick={() => setMode('youtube')}>YouTube</Button>
            </div>
            <div className="flex items-center gap-2">
              {mode === 'radio' ? (
                <div className="flex items-center gap-1">
                  <Button variant={radioGenre === 'lofi' ? 'default' : 'ghost'} size="sm" onClick={() => { setRadioGenre('lofi'); setRadioQuery(''); setRadioResults([]); }}>Lofi</Button>
                  <Button variant={radioGenre === 'chillhop' ? 'default' : 'ghost'} size="sm" onClick={() => { setRadioGenre('chillhop'); setRadioQuery(''); setRadioResults([]); }}>Chillhop</Button>
                  <Button variant={radioGenre === 'jazzhop' ? 'default' : 'ghost'} size="sm" onClick={() => { setRadioGenre('jazzhop'); setRadioQuery(''); setRadioResults([]); }}>Jazzhop</Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">Show Video</span>
                  <Switch checked={showVideoBg} onCheckedChange={(v) => setShowVideoBg(!!v)} />
                  <Button onClick={() => setShowSearch(true)} variant="ghost" size="sm" className="gap-2">
                    <AnimatedIcon animationSrc="/lottie/Search.json" fallbackIcon={Search} className="w-4 h-4" />
                    Search
                  </Button>
                </div>
              )}
            </div>
          </div>
          {showSearch && mounted && createPortal(
            <div className="fixed inset-0 z-[120] flex items-end justify-center p-4" onClick={() => { setShowSearch(false); setSearchResults([]); }}>
              <div className="w-full max-w-2xl glass-panel rounded-2xl border border-border shadow-2xl p-4" onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={'Search or paste a YouTube link'}
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { handleImportLink(); } }}
                    onFocus={() => { if (searchQuery.trim().length >= 2) handleSearch(); }}
                  />
                  <AnimatedIcon animationSrc="/lottie/Search.json" fallbackIcon={Search} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {(() => {
                    const parsed = parseYouTubeUrl(searchQuery.trim());
                    if (!parsed) return null;
                    return (
                      <div className="absolute right-24 top-1/2 -translate-y-1/2">
                        <Badge variant={parsed.type === 'playlist' ? 'secondary' : 'default'} className="px-2 py-0.5 text-[10px]">
                          {parsed.type === 'playlist' ? 'Playlist link' : 'Video link'}
                        </Badge>
                      </div>
                    );
                  })()}
                  {searchResults.length > 0 && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl overflow-hidden shadow-xl z-50 max-h-[80vh] overflow-y-auto">
                      {searchResults.map((video) => (
                        <button
                          key={video.id}
                          onClick={() => { handleSelectVideo(video); setShowSearch(false); }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-accent/10 transition-colors text-left border-b border-border last:border-0"
                        >
                          <img src={video.thumbnail} alt="" className="w-12 h-12 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{video.title}</p>
                            {video.channelTitle ? <p className="text-[11px] text-muted-foreground truncate">{video.channelTitle}</p> : null}
                            <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                              {video.kind === 'playlist' ? (
                                <>
                                  <span>Playlist • {formatItems((video as any).itemCount)}</span>
                                </>
                              ) : (
                                <span>{video.duration ? `${formatIsoDuration(video.duration)} • ${formatViews((video as any).viewCount)}` : `${formatViews((video as any).viewCount)}`}</span>
                              )}
                              {(video as any).isOfficial ? <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px]">Official</span> : null}
                              {video.kind && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted text-muted-foreground text-[10px]">
                                  {video.kind === 'playlist' ? 'Playlist' : 'Video'}
                                </span>
                              )}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {mode === 'youtube' && linkPreviewRef.current && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-xl overflow-hidden shadow-xl z-50">
                      <button
                        onClick={() => { const v = linkPreviewRef.current as VideoInfo; handleSelectVideo(v); setShowSearch(false); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-accent/10 transition-colors text-left"
                      >
                        <img src={(linkPreviewRef.current as any).thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{(linkPreviewRef.current as any).title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">YouTube link detected</p>
                        </div>
                      </button>
                    </div>
                  )}
                  {mode === 'radio' && radioResults.length > 0 && null}
                </div>
              </div>
            </div>, document.body
          )}

          <div className="flex flex-col gap-4">
            {mode === 'radio' && radioStation ? (
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  {radioStation.favicon ? (
                    <img src={radioStation.favicon} alt={radioStation.name} className="w-16 h-16 rounded-xl object-cover shadow-lg" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center"><AnimatedIcon animationSrc="/lottie/Music2.json" fallbackIcon={Music2} className="w-6 h-6" /></div>
                  )}
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-ring" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground font-medium truncate">{radioStation.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">Lofi Radio</Badge>
                  </div>
                </div>
              </div>
            ) : currentVideo ? (
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <img
                    src={currentVideo.thumbnail}
                    alt={currentVideo.title}
                    className={`w-16 h-16 rounded-xl object-cover shadow-lg transition-transform duration-700 ${isPlaying ? 'rotate-0' : 'grayscale opacity-70'}`}
                  />
                  <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-ring" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-foreground font-medium truncate">{currentVideo.title}</h3>
                  {(() => {
                    const isLive = duration === 0 || /live/i.test(currentVideo.title);
                    if (isLive) {
                      return (
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-red-500">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Live
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground font-mono">{formatTime(currentTime)}</span>
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden relative">
                          <div
                            className="h-full bg-primary rounded-full relative"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                          <div
                            className="absolute inset-0 w-full h-full cursor-pointer"
                            onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                              const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                              const t = ratio * duration;
                              handleSeek(t);
                            }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">{formatTime(duration)}</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No media selected.
              </div>
            )}

            <div className="flex items-center justify-between">
               {mode !== 'radio' && (
                 <div className="flex items-center gap-2">
                   <Button
                     onClick={() => setShuffle(!shuffle)}
                     variant="ghost"
                     size="icon"
                     className={cn("h-8 w-8 rounded-full", shuffle ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}
                   >
                     <AnimatedIcon animationSrc="/lottie/Shuffle.json" fallbackIcon={Shuffle} className="w-4 h-4" />
                   </Button>
                   <Button
                     onClick={() => setRepeat(!repeat)}
                     variant="ghost"
                     size="icon"
                     className={cn("h-8 w-8 rounded-full", repeat ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}
                   >
                     <AnimatedIcon animationSrc="/lottie/Repeat.json" fallbackIcon={Repeat} className="w-4 h-4" />
                   </Button>
                 </div>
               )}

              <div className="flex items-center gap-4">
                <Button onClick={handlePrevious} variant="ghost" size="icon" className="text-foreground hover:scale-110 transition-transform">
                  <AnimatedIcon animationSrc="/lottie/SkipBack.json" fallbackIcon={SkipBack} className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handlePlayPause}
                  className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all shadow-lg flex items-center justify-center"
                >
                  {isPlaying ? <AnimatedIcon animationSrc="/lottie/Pause.json" fallbackIcon={Pause} className="w-5 h-5" /> : <AnimatedIcon animationSrc="/lottie/Play.json" fallbackIcon={Play} className="w-5 h-5 ml-0.5" />}
                </Button>
                <Button onClick={handleNext} variant="ghost" size="icon" className="text-foreground hover:scale-110 transition-transform">
                  <AnimatedIcon animationSrc="/lottie/SkipForward.json" fallbackIcon={SkipForward} className="w-5 h-5" />
                </Button>
              </div>

               {mode !== 'radio' && (
                 <div className="flex items-center gap-2">
                   <Button
                     onClick={() => setShowPlaylist(!showPlaylist)}
                     variant="ghost"
                     size="icon"
                     className={cn("h-8 w-8 rounded-full", showPlaylist ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}
                   >
                     <AnimatedIcon animationSrc="/lottie/List.json" fallbackIcon={List} className="w-4 h-4" />
                   </Button>
                 </div>
               )}
                <div className="w-28 hidden sm:flex items-center gap-1">
                  <div
                    className="flex-1 h-2 bg-muted rounded-full relative cursor-pointer"
                    onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                      const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
                      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                      handleVolumeChange(Math.round(ratio * 100));
                    }}
                  >
                    <div className="h-full bg-primary rounded-full" style={{ width: `${volume}%` }} />
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleVolumeChange(Math.max(0, volume - 10))}>-</Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleVolumeChange(Math.min(100, volume + 10))}>+</Button>
                </div>
              </div>
            </div>

          {mode !== 'radio' && showPlaylist && (
            <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 border-t border-border pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Up Next</span>
                <span className="text-xs text-muted-foreground">{playlist.length} tracks</span>
              </div>
              <ScrollArea className="h-32">
                <div className="space-y-1 pr-3">
                  {playlist.map((video, index) => (
                    <button
                      key={`${video.id}-${index}`}
                      onClick={() => {
                        setCurrentIndex(index);
                        setCurrentVideo(video);
                        setIsPlaying(true);
                      }}
                      draggable
                      onDragStart={() => { (progressInterval as any).current = index as any; }}
                      onDragOver={(e: React.DragEvent<HTMLButtonElement>) => { e.preventDefault(); }}
                      onDrop={() => {
                        const from = Number((progressInterval as any).current);
                        const to = index;
                        if (isNaN(from)) return;
                        const arr = [...playlist];
                        const [m] = arr.splice(from, 1);
                        arr.splice(to, 0, m);
                        setPlaylist(arr);
                        const cur = currentIndex === from ? to : currentIndex > from && currentIndex <= to ? currentIndex - 1 : currentIndex < from && currentIndex >= to ? currentIndex + 1 : currentIndex;
                        setCurrentIndex(cur);
                      }}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left group",
                        index === currentIndex ? "bg-accent/10" : "hover:bg-accent/10"
                      )}
                    >
                      <div className="relative">
                        <img src={video.thumbnail} className="w-8 h-8 rounded object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                        {index === currentIndex && isPlaying && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded">
                            <div className="w-1 h-3 bg-foreground animate-pulse" />
                          </div>
                        )}
                      </div>
                      <span className={cn("text-xs truncate flex-1", index === currentIndex ? "text-foreground font-medium" : "text-muted-foreground group-hover:text-foreground")}>
                        {video.title}
                      </span>
                      <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                          e.stopPropagation();
                          handleRemoveFromPlaylist(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                      >
                        <AnimatedIcon animationSrc="/lottie/X.json" fallbackIcon={X} className="w-3 h-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
        </div>
      </div>
    )
  );

  return (
    <>
      {isExpanded ? expandedUI : collapsedUI}
      {mode !== 'radio' && currentVideo ? (
        <div style={{ position: 'fixed', width: 1, height: 1, opacity: 0, pointerEvents: 'none', bottom: 0, left: 0 }}>
          <YouTube
            videoId={currentVideo!.id}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
            onError={onError}
          />
        </div>
      ) : null}
      {showVideoBg && mode !== 'radio' && currentVideo ? (
        <YouTube
          videoId={currentVideo!.id}
          className="yt-bg-container"
          iframeClassName="yt-bg-iframe"
          opts={{ height: '100%', width: '100%', playerVars: { autoplay: 1, controls: 0, modestbranding: 1, playsinline: 1, mute: 1, rel: 0, fs: 0, cc_load_policy: 0, disablekb: 1, origin: typeof window !== 'undefined' ? window.location.origin : undefined } }}
          onReady={onReadyBg}
        />
      ) : null}
      {mode === 'radio' && radioStation ? (
        <audio
          ref={audioRef}
          src={radioStation!.url_resolved}
          crossOrigin="anonymous"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onError={() => { if (!userPaused) handleNext(); }}
          onStalled={() => { if (!userPaused) handleNext(); }}
          style={{ display: 'none' }}
        />
  ) : null}
    </>
  );
}
