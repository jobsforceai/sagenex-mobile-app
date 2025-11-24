import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Pressable, LayoutChangeEvent } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';

// Use the hook to create/manage the player instance.

type Props = {
  source: string;
  onProgressUpdate?: (seconds: number) => void;
  onComplete?: () => void;
  initialPosition?: number;
};

const VideoPlayer: React.FC<Props> = ({ source, onProgressUpdate, onComplete, initialPosition = 0 }) => {
  const viewRef = useRef<any | null>(null);
  const player = useVideoPlayer(source as any);
  const [status, setStatus] = useState<any | null>(null);
  const lastSent = useRef(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);

  // Set initial position on player (in seconds)
  useEffect(() => {
    try {
      if (player && initialPosition > 0) {
        // player.currentTime is in seconds
        player.currentTime = initialPosition;
      }
    } catch (e) {
      // ignore
    }
  }, [player, initialPosition]);

  // Poll the player for status updates (time, duration, playing)
  useEffect(() => {
    if (!player) return;
    let mounted = true;
    const tick = () => {
      try {
        const current = typeof player.currentTime === 'number' ? player.currentTime : 0;
        const duration = typeof player.duration === 'number' ? player.duration : 0;
        const isLoaded = duration > 0 || current > 0;
        const s = {
          isLoaded,
          positionMillis: Math.floor(current * 1000),
          durationMillis: Math.floor(duration * 1000),
          isPlaying: !!player.playing,
        };
        if (mounted) setStatus(s);

        const currentSec = Math.floor(current);
        if (onProgressUpdate && Math.abs(currentSec - lastSent.current) > 5) {
          lastSent.current = currentSec;
          onProgressUpdate(currentSec);
        }

        if (duration > 0 && current >= duration) {
          onComplete && onComplete();
        }
      } catch (e) {
        // ignore
      }
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, [player, onProgressUpdate, onComplete]);

  const togglePlay = async () => {
    if (!player) return;
    try {
      if (player.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (e) {
      // ignore
    }
  };

  const toggleFullscreen = async () => {
    if (!viewRef.current) return;
    try {
      if (!isFullscreen && viewRef.current.enterFullscreen) {
        await viewRef.current.enterFullscreen();
        setIsFullscreen(true);
      } else if (isFullscreen && viewRef.current.exitFullscreen) {
        await viewRef.current.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      // ignore
    }
  };

  const onProgressBarLayout = (e: LayoutChangeEvent) => {
    setProgressWidth(e.nativeEvent.layout.width);
  };

  const seekTo = async (evt: any) => {
    if (!player || !status || !status.durationMillis) return;
    const x = evt.nativeEvent.locationX;
    const pct = Math.max(0, Math.min(1, x / (progressWidth || 1)));
    const seconds = (pct * (status.durationMillis || 0)) / 1000;
    try {
      player.currentTime = seconds;
    } catch (e) {
      try {
        player.seekBy(seconds);
      } catch (e2) {
        // ignore
      }
    }
    // update local status on next tick
  };

  const fmtTime = (seconds: number) => {
    const mm = Math.floor(seconds / 60);
    const ss = Math.floor(seconds % 60);
    return `${mm}:${ss < 10 ? '0' : ''}${ss}`;
  };

  const progressPct = status && status.isLoaded && status.durationMillis ? Math.min(100, ((status.positionMillis ?? 0) / status.durationMillis) * 100) : 0;
  const currentSeconds = status && status.isLoaded ? Math.floor((status.positionMillis ?? 0) / 1000) : 0;
  const durationSeconds = status && status.isLoaded ? Math.floor((status.durationMillis ?? 0) / 1000) : 0;

  return (
    <View style={styles.container}>
      <VideoView
        ref={viewRef}
        player={player}
        style={styles.video}
        contentFit="contain"
        // enable native controls when in fullscreen so users can exit fullscreen
        nativeControls={isFullscreen}
        // hide built-in timecodes overlay on platforms that show them
        showsTimecodes={false}
        // ensure fullscreen button and behavior is available
        fullscreenOptions={{ enable: true }}
        onFullscreenEnter={() => {
          setIsFullscreen(true);
        }}
        onFullscreenExit={() => {
          setIsFullscreen(false);
        }}
      />

      {!isFullscreen && (
        <View style={styles.controls}>
        <TouchableOpacity onPress={togglePlay} style={styles.playBtn}>
          <Ionicons name={status && (status as any).isPlaying ? 'pause' : 'play'} size={20} color="#fff" />
        </TouchableOpacity>
        <Pressable style={styles.progressWrap} onLayout={onProgressBarLayout} onPress={seekTo}>
          <View style={[styles.progressBar, { width: `${progressPct}%` }]} />
        </Pressable>
        <Text style={styles.timeText}>{fmtTime(currentSeconds)} / {fmtTime(durationSeconds)}</Text>
        <TouchableOpacity onPress={toggleFullscreen} style={{ marginLeft: 8 }}>
          <Ionicons name={isFullscreen ? 'contract' : 'resize'} size={18} color="#fff" />
        </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', borderRadius: 8, overflow: 'hidden' },
  video: { width: '100%', height: '100%' },
  controls: { position: 'absolute', left: 8, right: 8, bottom: 8, flexDirection: 'row', alignItems: 'center' },
  playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  progressWrap: { flex: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 6, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#41DA93' },
  timeText: { color: '#fff', marginLeft: 8, fontSize: 12 },
});

export default VideoPlayer;
