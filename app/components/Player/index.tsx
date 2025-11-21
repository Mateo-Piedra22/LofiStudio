'use client';

import { useState, useRef, useEffect } from 'react';
import YouTube, { YouTubeProps } from 'react-youtube';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';
import { Search, X, List, SkipForward, SkipBack, Repeat, Shuffle, ChevronDown, ChevronUp, Play, Pause, Music2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
}

interface PlayerProps {
  currentVideo: VideoInfo | null;
  setCurrentVideo: (video: VideoInfo | null) => void;
}

export default function Player({ currentVideo, setCurrentVideo }: PlayerProps) {
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
  const playerRef = useRef<any>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  const opts: YouTubeProps['opts'] = {
    height: '0',
    width: '0',
    playerVars: {
      autoplay: 0,
      controls: 0,
      modestbranding: 1,
    },
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    if (volume !== undefined) {
      event.target.setVolume(volume);
    }
    setDuration(event.target.getDuration());
    setError(null);
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

  const handlePlayPause = () => {
    if (!playerRef.current || !currentVideo) return;
    try {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
      setIsPlaying(!isPlaying);
      setError(null);
    } catch (e) {
      setError('Playback error. Please refresh the page.');
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (playerRef.current) {
      try {
        playerRef.current.setVolume(newVolume);
      } catch (e) { }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
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
    if (q.length < 2) { setSearchResults([]); return; }
    const id = setTimeout(() => { handleSearch(); }, 250);
    return () => clearTimeout(id);
  }, [searchQuery]);

  const handleSelectVideo = (video: VideoInfo) => {
    setCurrentVideo(video);
    setSearchResults([]);
    setSearchQuery('');
    setIsPlaying(true);
    setError(null);
    if (!playlist.find(v => v.id === video.id)) {
      setPlaylist([...playlist, video]);
      setCurrentIndex(playlist.length);
    } else {
      setCurrentIndex(playlist.findIndex(v => v.id === video.id));
    }
  };

  const handleNext = () => {
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
    if (playlist.length === 0) return;
    const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    setCurrentVideo(playlist[prevIndex]);
    setIsPlaying(true);
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
      if (repeat) playerRef.current?.playVideo();
      else if (playlist.length > 0) handleNext();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Mini Player (Collapsed State)
  if (!isExpanded) {
    return (
      <div className="fixed left-1/2 -translate-x-1/2 z-[100] pointer-events-auto" style={{ bottom: `calc(16px + env(safe-area-inset-bottom))` }}>
        <div className="glass-panel rounded-full p-1.5 pr-3 flex items-center gap-2 shadow-2xl border border-border hover:scale-105 transition-all cursor-pointer group">
          <button
            onClick={handlePlayPause}
            disabled={!currentVideo}
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center transition-all shadow-lg",
              currentVideo
                ? "bg-primary text-primary-foreground hover:scale-110"
                : "bg-accent/20 text-muted-foreground cursor-not-allowed"
            )}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          {currentVideo && (
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

          {!currentVideo && (
            <p className="text-xs text-muted-foreground">No music selected</p>
          )}

          <button
            onClick={() => setIsExpanded(true)}
            className="ml-2 p-2 rounded-full hover:bg-accent/10 transition-colors"
          >
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  }

  // Full Player (Expanded State)
  return (
    <div className="fixed left-1/2 -translate-x-1/2 z-[100] w-full max-w-2xl px-4 animate-in slide-in-from-bottom-4 fade-in duration-300 pointer-events-auto" style={{ bottom: `calc(16px + env(safe-area-inset-bottom))` }}>
      <div className="glass-panel rounded-3xl overflow-hidden shadow-2xl border border-border">
        {/* Header / Minimize */}
        <div className="flex items-center justify-between px-6 py-3 bg-background/50 border-b border-border">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Lofi Player</span>
          </div>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Toggle */}
          <div className="flex justify-end">
            <Button onClick={() => setShowSearch(true)} variant="ghost" size="sm" className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
          {showSearch && (
            <div className="fixed inset-0 z-[120] flex items-end justify-center p-4" onClick={() => { setShowSearch(false); setSearchResults([]); }}>
              <div className="w-full max-w-2xl glass-panel rounded-2xl border border-border shadow-2xl p-4" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for songs..."
                    className="w-full bg-background/50 border border-border rounded-xl px-4 py-3 pl-11 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  {searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl overflow-hidden shadow-xl z-50 max-h-60 overflow-y-auto">
                      {searchResults.map((video) => (
                        <button
                          key={video.id}
                          onClick={() => { handleSelectVideo(video); setShowSearch(false); }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-accent/10 transition-colors text-left border-b border-border last:border-0"
                        >
                          <img src={video.thumbnail} alt="" className="w-10 h-10 rounded object-cover" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-foreground truncate">{video.title}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Main Player Controls */}
          <div className="flex flex-col gap-4">
            {currentVideo ? (
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
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground font-mono">{formatTime(currentTime)}</span>
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={duration}
                    value={currentTime}
                    onChange={(e) => handleSeek(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                No video selected. Search or choose from playlist.
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShuffle(!shuffle)}
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 rounded-full", shuffle ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}
                >
                  <Shuffle className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => setRepeat(!repeat)}
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 rounded-full", repeat ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}
                >
                  <Repeat className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-4">
                <Button onClick={handlePrevious} variant="ghost" size="icon" className="text-foreground hover:scale-110 transition-transform">
                  <SkipBack className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handlePlayPause}
                  className="h-12 w-12 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all shadow-lg flex items-center justify-center"
                >
                  {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
                </Button>
                <Button onClick={handleNext} variant="ghost" size="icon" className="text-foreground hover:scale-110 transition-transform">
                  <SkipForward className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  variant="ghost"
                  size="icon"
                  className={cn("h-8 w-8 rounded-full", showPlaylist ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}
                >
                  <List className="w-4 h-4" />
                </Button>
                <div className="w-24 hidden sm:flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => handleVolumeChange(Number(e.target.value))}
                    className="w-full h-1 bg-muted rounded-full appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Playlist Drawer */}
          {showPlaylist && (
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromPlaylist(index);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-all"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      </div>

      {/* Hidden YouTube Player */}
      {currentVideo && (
        <div className="hidden">
          <YouTube
            videoId={currentVideo.id}
            opts={opts}
            onReady={onReady}
            onStateChange={onStateChange}
            onError={onError}
          />
        </div>
      )}
    </div>
  );
}
