import React, { useRef, useEffect, useCallback, useState } from 'react';
import { Socket } from 'socket.io-client';
import { Play, Pause, Film, Maximize, Minimize } from 'lucide-react';

interface VideoPlayerProps {
  roomId: string;
  isHost: boolean;
  socket: Socket;
  imdbId?: string;
  contentTitle?: string;
  videoUrl?: string;
}

// Multiple public domain sample videos as fallback chain
const SAMPLE_VIDEOS = [
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
];

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ roomId, isHost, socket, imdbId, contentTitle, videoUrl }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const isRemoteAction = useRef(false);
  
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoReady, setVideoReady] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  // Current video source: if videoUrl fails, fallback to sample chain
  const videoSrc = videoIndex === 0 && videoUrl ? videoUrl : SAMPLE_VIDEOS[videoIndex % SAMPLE_VIDEOS.length];

  // Sync state from server
  useEffect(() => {
    const handleSync = (data: { isPlaying: boolean; currentTime: number }) => {
      const video = videoRef.current;
      if (!video) return;
      isRemoteAction.current = true;
      video.currentTime = data.currentTime;
      if (data.isPlaying) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
      setTimeout(() => { isRemoteAction.current = false; }, 200);
    };

    const handleRemotePlay = (data: { currentTime: number }) => {
      const video = videoRef.current;
      if (!video) return;
      isRemoteAction.current = true;
      video.currentTime = data.currentTime;
      video.play().catch(() => {});
      setTimeout(() => { isRemoteAction.current = false; }, 200);
    };

    const handleRemotePause = (data: { currentTime: number }) => {
      const video = videoRef.current;
      if (!video) return;
      isRemoteAction.current = true;
      video.currentTime = data.currentTime;
      video.pause();
      setTimeout(() => { isRemoteAction.current = false; }, 200);
    };

    const handleRemoteSeek = (data: { currentTime: number }) => {
      const video = videoRef.current;
      if (!video) return;
      isRemoteAction.current = true;
      video.currentTime = data.currentTime;
      setTimeout(() => { isRemoteAction.current = false; }, 200);
    };

    socket.on('player:sync', handleSync);
    socket.on('player:play', handleRemotePlay);
    socket.on('player:pause', handleRemotePause);
    socket.on('player:seek', handleRemoteSeek);

    return () => {
      socket.off('player:sync', handleSync);
      socket.off('player:play', handleRemotePlay);
      socket.off('player:pause', handleRemotePause);
      socket.off('player:seek', handleRemoteSeek);
    };
  }, [socket]);

  // Fullscreen listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Hide controls on idle
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 2500);
    }
  };

  const handlePlayEvent = useCallback(() => {
    setIsPlaying(true);
    if (isHost && !isRemoteAction.current) {
      socket.emit('player:play', { roomId, currentTime: videoRef.current?.currentTime || 0 });
    }
    handleMouseMove();
  }, [isHost, roomId, socket]);

  const handlePauseEvent = useCallback(() => {
    setIsPlaying(false);
    setShowControls(true);
    if (isHost && !isRemoteAction.current) {
      socket.emit('player:pause', { roomId, currentTime: videoRef.current?.currentTime || 0 });
    }
  }, [isHost, roomId, socket]);

  const handleSeekedEvent = useCallback(() => {
    if (isHost && !isRemoteAction.current) {
      socket.emit('player:seek', { roomId, currentTime: videoRef.current?.currentTime || 0 });
    }
  }, [isHost, roomId, socket]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setVideoReady(true);
    }
  }, []);

  const handleVideoError = useCallback(() => {
    console.warn(`[VideoPlayer] Video source failed: ${videoSrc}`);
    if (videoIndex < SAMPLE_VIDEOS.length) {
      // Try next fallback
      setVideoIndex((prev) => prev + 1);
    } else {
      setVideoError(true);
    }
  }, [videoIndex, videoSrc]);

  const togglePlay = () => {
    if (!isHost) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isHost || !progressRef.current || !videoRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    // Let onSeeked emit the sync
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (videoError) {
    return (
      <div className="relative w-full aspect-video bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl overflow-hidden flex items-center justify-center">
        <div className="text-center p-8">
          <Film className="w-16 h-16 text-primary-500 mx-auto mb-4 animate-pulse" />
          <h3 className="text-xl font-bold mb-2">Error de Video</h3>
          <p className="text-dark-400 text-sm mb-4">No se pudo cargar el video ni los fallbacks.</p>
        </div>
      </div>
    );
  }

  if (imdbId) {
    return (
      <div 
        ref={containerRef} 
        className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group select-none flex items-center justify-center"
      >
        <iframe
          src={`https://vidsrc.me/embed/movie?imdb=${imdbId}&ds_lang=es`}
          className="w-full h-full border-0"
          allowFullScreen
          referrerPolicy="origin"
        ></iframe>
        
        {/* Sync Disabled Notice */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none transition-opacity duration-300">
          <div className="bg-black/60 backdrop-blur-md border border-red-500/30 rounded-lg px-3 py-2 shadow-lg">
            <div className="flex items-center gap-2 mb-0.5">
              <Film className="w-3.5 h-3.5 text-red-400" />
              <span className="text-[10px] font-bold tracking-wider text-red-400 uppercase">Prototipo Académico</span>
            </div>
            <p className="text-white text-xs font-medium">
              Sincronización deshabilitada para reproducir contenido real.
            </p>
          </div>
        </div>

        {/* Fullscreen Button */}
        <div className="absolute bottom-4 right-4 z-20 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
          <button onClick={toggleFullscreen} className="p-2 bg-black/60 hover:bg-black/80 rounded-lg text-white transition-colors">
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative w-full aspect-video bg-black rounded-xl overflow-hidden group select-none"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        onPlay={handlePlayEvent}
        onPause={handlePauseEvent}
        onSeeked={handleSeekedEvent}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onError={handleVideoError}
        playsInline
        preload="metadata"
      />

      {/* Movie Title Watermark */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none transition-opacity duration-300" style={{ opacity: showControls ? 1 : 0 }}>
        <div className="bg-black/50 backdrop-blur-md border border-white/10 rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 mb-0.5">
            <Film className="w-3.5 h-3.5 text-primary-500" />
            <span className="text-[10px] font-bold tracking-wider text-primary-400 uppercase">Prototipo Académico</span>
          </div>
          <p className="text-white text-sm font-medium">Estás viendo: <span className="font-bold text-white/90">{contentTitle || 'Película Simulada'}</span></p>
        </div>
      </div>

      {/* Loading state */}
      {!videoReady && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center bg-dark-900/80 z-10 pointer-events-none">
          <div className="text-center">
            <div className="w-10 h-10 border-3 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-dark-400 text-sm">Cargando video real...</p>
          </div>
        </div>
      )}

      {/* Custom Controls */}
      <div 
        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 pt-10 pb-4 transition-opacity duration-300 z-20"
        style={{ opacity: showControls || !isPlaying ? 1 : 0 }}
      >
        {/* Progress Bar */}
        <div 
          ref={progressRef}
          className={`h-1.5 bg-white/20 rounded-full mb-4 relative ${isHost ? 'cursor-pointer hover:h-2' : 'cursor-default'} transition-all`}
          onClick={handleProgressClick}
        >
          {/* Buffered / Progress */}
          <div 
            className="absolute top-0 left-0 h-full bg-primary-500 rounded-full"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          >
            {isHost && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow translate-x-1.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            )}
          </div>
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={togglePlay} 
              className={`text-white hover:text-primary-400 transition-colors ${!isHost && 'opacity-50 cursor-not-allowed'}`}
              disabled={!isHost}
              title={isHost ? (isPlaying ? 'Pausar' : 'Reproducir') : 'Solo el host controla la reproducción'}
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>
            
            <div className="text-white/90 text-sm font-medium tabular-nums">
              {formatTime(currentTime)} <span className="text-white/40 mx-1">/</span> {formatTime(duration)}
            </div>

            {!isHost && (
              <div className="ml-2 px-2.5 py-1 rounded bg-white/10 text-xs font-medium text-white/70">
                Host controla la reproducción
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <button onClick={toggleFullscreen} className="text-white hover:text-primary-400 transition-colors">
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Big Play Button Overlay for Host (only when paused) */}
      {isHost && !isPlaying && videoReady && showControls && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors pointer-events-auto z-10"
        >
          <div className="w-20 h-20 bg-primary-500/90 rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-2xl shadow-primary-500/50">
            <Play className="w-10 h-10 text-white fill-white ml-2" />
          </div>
        </button>
      )}
    </div>
  );
};
