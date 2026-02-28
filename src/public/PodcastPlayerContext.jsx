import React, { createContext, useContext, useState, useRef } from 'react';

const PodcastPlayerContext = createContext(null);

export const PodcastPlayerProvider = ({ children }) => {
    const [currentPodcast, setCurrentPodcast] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const play = (podcast) => {
        if (currentPodcast?.id === podcast.id) {
            // Resume if same podcast
            if (audioRef.current) {
                audioRef.current.play();
                setIsPlaying(true);
            }
        } else {
            setCurrentPodcast(podcast);
            setIsPlaying(true);
        }
    };

    const pause = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    };

    const stop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setCurrentPodcast(null);
        setIsPlaying(false);
    };

    return (
        <PodcastPlayerContext.Provider value={{ currentPodcast, isPlaying, play, pause, stop, audioRef }}>
            {children}
        </PodcastPlayerContext.Provider>
    );
};

export const usePodcastPlayer = () => {
    const ctx = useContext(PodcastPlayerContext);
    if (!ctx) throw new Error('usePodcastPlayer must be used within PodcastPlayerProvider');
    return ctx;
};

export default PodcastPlayerContext;
