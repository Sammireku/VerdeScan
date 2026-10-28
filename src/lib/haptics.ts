// T-026: Tactile Haptic Feedback Utility for VerdeScan Field Operations
export function triggerHaptic(type: 'tap' | 'success' | 'warning' | 'shutter' | 'alert' = 'tap') {
  if (typeof window === 'undefined' || !('navigator' in window) || !navigator.vibrate) {
    return;
  }

  try {
    switch (type) {
      case 'tap':
        navigator.vibrate(12);
        break;
      case 'shutter':
        navigator.vibrate([18, 40, 25]);
        break;
      case 'success':
        navigator.vibrate([15, 30, 20]);
        break;
      case 'warning':
        navigator.vibrate([40, 60, 40]);
        break;
      case 'alert':
        navigator.vibrate([80, 50, 80, 50, 120]);
        break;
      default:
        navigator.vibrate(10);
    }
  } catch {
    // Ignore unsupported browser environments
  }
}
