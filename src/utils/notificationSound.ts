// Notification sound utility using Web Audio API
// Creates a pleasant notification chime without requiring external audio files

let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  return audioContext;
};

/**
 * Play a pleasant notification chime sound
 */
export const playNotificationSound = () => {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    // Resume audio context if suspended (required for some browsers)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // Create oscillator for the main tone
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Pleasant notification frequency (C5 note)
    oscillator.frequency.setValueAtTime(523.25, now);
    oscillator.type = 'sine';

    // Quick fade in and out for a soft chime
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    oscillator.start(now);
    oscillator.stop(now + 0.3);

    // Second tone for a pleasant two-tone chime
    const oscillator2 = ctx.createOscillator();
    const gainNode2 = ctx.createGain();

    oscillator2.connect(gainNode2);
    gainNode2.connect(ctx.destination);

    // E5 note
    oscillator2.frequency.setValueAtTime(659.25, now + 0.1);
    oscillator2.type = 'sine';

    gainNode2.gain.setValueAtTime(0, now + 0.1);
    gainNode2.gain.linearRampToValueAtTime(0.2, now + 0.15);
    gainNode2.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    oscillator2.start(now + 0.1);
    oscillator2.stop(now + 0.4);
  } catch (e) {
    console.warn('Failed to play notification sound:', e);
  }
};

/**
 * Request permission and enable notification sounds
 */
export const enableNotificationSounds = async (): Promise<boolean> => {
  const ctx = getAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }
    return true;
  } catch (e) {
    return false;
  }
};
