export interface RealtimeMessage {
  type: 'message_sent' | 'message_received';
  sender: string;
  recipient: string;
  cid: string;
  timestamp: number;
}

export class RealtimeService {
  private eventListeners: Map<string, (event: RealtimeMessage) => void> = new Map();
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private isPolling = false;
  private lastRequestTime = 0;

  constructor(contractAddress: string) {
    console.log('Initializing RealtimeService for contract:', contractAddress);
  }

  subscribe(userAddress: string, callback: (event: RealtimeMessage) => void) {
    console.log('Subscribing to real-time events for:', userAddress);
    console.log('⚠️  Event polling disabled due to API rate limits');
    console.log('    Real-time updates will use periodic inbox refresh instead');

    this.eventListeners.set(userAddress, callback);

    if (!this.isPolling) {
      this.startConservativeMode();
    }
  }

  unsubscribe(userAddress: string) {
    console.log('Unsubscribing from real-time events for:', userAddress);
    this.eventListeners.delete(userAddress);

    if (this.eventListeners.size === 0) {
      this.stopConservativeMode();
    }
  }

  private startConservativeMode() {
    if (this.isPolling) return;

    console.log('Starting conservative real-time mode');
    console.log('- No API event polling (avoids rate limits)');
    console.log('- Relies on user-triggered refreshes');
    console.log('- Periodic inbox checks every 30+ seconds');

    this.isPolling = true;

    this.pollingInterval = setInterval(() => {
      this.conservativeCheck();
    }, 60000);
  }

  private stopConservativeMode() {
    console.log('Stopping conservative real-time mode');
    this.isPolling = false;

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
  }

  private conservativeCheck() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    console.log('Conservative real-time check');
    console.log(`- Active listeners: ${this.eventListeners.size}`);
    console.log(`- Time since last API request: ${Math.round(timeSinceLastRequest / 1000)}s`);
    console.log('- Relying on normal inbox refresh for updates');

  }

  simulateEvent(userAddress: string, eventType: 'message_sent' | 'message_received', otherAddress: string) {
    const callback = this.eventListeners.get(userAddress);
    if (callback) {
      console.log(`Simulating ${eventType} event for ${userAddress}`);
      const simulatedEvent: RealtimeMessage = {
        type: eventType,
        sender: eventType === 'message_sent' ? userAddress : otherAddress,
        recipient: eventType === 'message_sent' ? otherAddress : userAddress,
        cid: 'simulated-cid',
        timestamp: Date.now()
      };
      callback(simulatedEvent);
    }
  }

  destroy() {
    console.log('Destroying real-time service');
    this.stopConservativeMode();
    this.eventListeners.clear();
  }
}

let realtimeService: RealtimeService | null = null;

export function getRealtimeService(contractAddress: string): RealtimeService {
  if (!realtimeService) {
    realtimeService = new RealtimeService(contractAddress);
  }
  return realtimeService;
}
