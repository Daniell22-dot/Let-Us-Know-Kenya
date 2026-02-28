import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, Volume2, VolumeX, SkipBack, SkipForward, Music2 } from 'lucide-react';
import { usePodcastPlayer } from '../PodcastPlayerContext';

const GlobalPodcastPlayer = () => {
    const { currentPodcast, isPlaying, play, pause, stop, audioRef } = usePodcastPlayer();
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const internalAudioRef = useRef(null);

    // Sync internal ref with context ref
    useEffect(() => {
        audioRef.current = internalAudioRef.current;
    }, [audioRef]);

    useEffect(() => {
        const audio = internalAudioRef.current;
        if (!audio || !currentPodcast) return;

        if (currentPodcast.audioUrl) {
            audio.src = currentPodcast.audioUrl;
            audio.load();
            if (isPlaying) audio.play().catch(() => { });
        }
    }, [currentPodcast]);

    useEffect(() => {
        const audio = internalAudioRef.current;
        if (!audio) return;
        if (isPlaying) audio.play().catch(() => { });
        else audio.pause();
    }, [isPlaying]);

    const handleTimeUpdate = () => {
        const audio = internalAudioRef.current;
        if (!audio) return;
        setCurrentTime(audio.currentTime);
        setProgress((audio.currentTime / audio.duration) * 100 || 0);
    };

    const handleLoadedMetadata = () => {
        setDuration(internalAudioRef.current?.duration || 0);
    };

    const handleSeek = (e) => {
        const audio = internalAudioRef.current;
        if (!audio) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        audio.currentTime = pct * audio.duration;
    };

    const handleVolume = (e) => {
        const vol = parseFloat(e.target.value);
        setVolume(vol);
        if (internalAudioRef.current) internalAudioRef.current.volume = vol;
        setMuted(vol === 0);
    };

    const toggleMute = () => {
        const audio = internalAudioRef.current;
        if (!audio) return;
        const newMuted = !muted;
        setMuted(newMuted);
        audio.muted = newMuted;
    };

    const skip = (secs) => {
        const audio = internalAudioRef.current;
        if (!audio) return;
        audio.currentTime = Math.max(0, Math.min(audio.currentTime + secs, audio.duration));
    };

    const formatTime = (s) => {
        if (!s || isNaN(s)) return '0:00';
        const m = Math.floor(s / 60);
        const sec = Math.floor(s % 60);
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    if (!currentPodcast) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#1e293b] via-[#0f172a] to-[#1e293b] border-t-2 border-[#00a84f] shadow-2xl animate-slide-up">
            {/* Hidden audio element */}
            <audio
                ref={internalAudioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={stop}
            />

            {/* Progress bar */}
            <div
                className="w-full h-1 bg-white/10 cursor-pointer group"
                onClick={handleSeek}
            >
                <div
                    className="h-full bg-gradient-to-r from-[#00a84f] to-[#c41e3a] transition-all"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="container mx-auto px-4 py-3 flex items-center gap-4">
                {/* Thumbnail + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative w-12 h-12 flex-shrink-0">
                        {currentPodcast.thumbnail ? (
                            <img
                                src={currentPodcast.thumbnail}
                                alt={currentPodcast.title}
                                className="w-full h-full rounded-lg object-cover border border-white/20"
                            />
                        ) : (
                            <div className="w-full h-full rounded-lg bg-[#00a84f]/20 flex items-center justify-center border border-[#00a84f]/40">
                                <Music2 size={20} className="text-[#00a84f]" />
                            </div>
                        )}
                        {isPlaying && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00a84f] rounded-full animate-pulse" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="text-white font-semibold text-sm truncate">{currentPodcast.title}</p>
                        <p className="text-white/60 text-xs truncate">{currentPodcast.host}</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => skip(-15)}
                        className="text-white/60 hover:text-white transition-colors p-1"
                        title="Rewind 15s"
                    >
                        <SkipBack size={20} />
                    </button>

                    <button
                        onClick={isPlaying ? pause : () => play(currentPodcast)}
                        className="w-10 h-10 bg-[#00a84f] hover:bg-[#00953f] rounded-full flex items-center justify-center text-white transition-all hover:scale-110 shadow-lg"
                    >
                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                    </button>

                    <button
                        onClick={() => skip(15)}
                        className="text-white/60 hover:text-white transition-colors p-1"
                        title="Forward 15s"
                    >
                        <SkipForward size={20} />
                    </button>
                </div>

                {/* Time */}
                <div className="hidden md:flex items-center gap-1 text-white/60 text-xs font-mono min-w-[80px]">
                    <span>{formatTime(currentTime)}</span>
                    <span>/</span>
                    <span>{formatTime(duration)}</span>
                </div>

                {/* Volume */}
                <div className="hidden md:flex items-center gap-2">
                    <button onClick={toggleMute} className="text-white/60 hover:text-white transition-colors">
                        {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={muted ? 0 : volume}
                        onChange={handleVolume}
                        className="w-20 accent-[#00a84f]"
                    />
                </div>

                {/* Close */}
                <button
                    onClick={stop}
                    className="text-white/40 hover:text-white transition-colors p-1 ml-2"
                    title="Close player"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default GlobalPodcastPlayer;
