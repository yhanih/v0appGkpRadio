"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface AudioPlayerContextType {
    isPlaying: boolean;
    setIsPlaying: (playing: boolean) => void;
    isExpanded: boolean;
    setIsExpanded: (expanded: boolean) => void;
    isMinimized: boolean;
    setIsMinimized: (minimized: boolean) => void;
    isVisible: boolean;
    setIsVisible: (visible: boolean) => void;
    togglePlay: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(
    undefined
);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    const togglePlay = () => setIsPlaying((prev) => !prev);

    return (
        <AudioPlayerContext.Provider
            value={{
                isPlaying,
                setIsPlaying,
                isExpanded,
                setIsExpanded,
                isMinimized,
                setIsMinimized,
                isVisible,
                setIsVisible,
                togglePlay,
            }}
        >
            {children}
        </AudioPlayerContext.Provider>
    );
}

export function useAudioPlayer() {
    const context = useContext(AudioPlayerContext);
    if (context === undefined) {
        throw new Error("useAudioPlayer must be used within an AudioPlayerProvider");
    }
    return context;
}
