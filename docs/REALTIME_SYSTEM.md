# Real-Time Messaging System

## Overview

The Inbox3 app now supports **real-time messaging** using multiple approaches to ensure messages appear instantly when sent or received, without requiring manual page refresh.

## 🚀 Real-Time Features

### 1. **Event-Based Real-Time Updates**
- **Aptos Event Polling**: Monitors blockchain events every 2 seconds
- **Instant Notifications**: Pop-up notifications when messages are received/sent
- **Automatic Inbox Refresh**: Inbox updates immediately when events occur

### 2. **Smart Refresh Strategy**
- **Normal Mode**: Refresh every 10 seconds
- **Active Mode**: Refresh every 3 seconds for 30 seconds after sending a message
- **Immediate Refresh**: Triggered instantly when messages are sent

### 3. **Visual Feedback**
- **Real-time Status Indicator**: Shows when real-time mode is active
- **Live Notifications**: Toast notifications for new messages
- **Last Updated Timestamp**: Shows when inbox was last refreshed
- **Loading States**: Visual indicators during refresh operations

## 🔧 Technical Implementation

### Real-Time Service (`src/lib/realtime.ts`)

```typescript
export class RealtimeService {
  // Subscribes to blockchain events for a specific user
  subscribe(userAddress: string, callback: (event: RealtimeMessage) => void)
  
  // Polls for new events every 2 seconds
  private pollForEvents()
  
  // Processes message events and notifies listeners
  private processMessageEvent(event: MessageEvent)
}
```

### Notification System (`src/lib/notifications.ts` & `src/components/NotificationSystem.tsx`)

```typescript
export function useNotifications() {
  const addNotification = (notification: Omit<Notification, 'id'>) => void
  const dismissNotification = (id: string) => void
  // Auto-dismiss after 5 seconds
}
```

### App Integration (`src/App.tsx`)

```typescript
// Real-time event handling
const handleRealtimeEvent = useCallback((event: RealtimeMessage) => {
  // Show notification
  addNotification({
    type: 'info',
    message: `New message from ${event.sender}`,
    duration: 5000
  })
  
  // Refresh inbox immediately
  refreshInbox()
}, [refreshInbox, addNotification])
```

## 🎯 How It Works

### 1. **Event Subscription**
When a user connects their wallet:
- The app subscribes to real-time events for their address
- Starts polling the Aptos blockchain for new events every 2 seconds

### 2. **Message Detection**
When a message is sent or received:
- The real-time service detects the `MessageSent` event
- Determines if the event is relevant to the current user
- Triggers the appropriate callback

### 3. **Instant Updates**
When an event is detected:
- A notification appears in the top-right corner
- The inbox refreshes automatically
- The user sees the new message immediately

### 4. **Smart Refresh**
- **After sending**: Aggressive refresh (3 seconds) for 30 seconds
- **Normal usage**: Standard refresh every 10 seconds
- **Real-time events**: Immediate refresh when events detected

## 🎨 User Experience Features

### Real-Time Status Panel
```jsx
<div className="flex items-center gap-2">
  <span>Real-time Updates:</span>
  <button onClick={toggleRealtime}>
    {isRealtimeEnabled ? 'ON' : 'OFF'}
  </button>
  {isRealtimeEnabled && (
    <div className="flex items-center gap-1 text-green-600">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span>Live</span>
    </div>
  )}
</div>
```

### Notification Types
- **📨 Message Received**: Blue notification with sender info
- **✅ Message Sent**: Green notification with recipient info
- **⚠️ Warnings**: Yellow notifications for errors
- **❌ Errors**: Red notifications for failures

### Inbox Enhancements
- **Last Updated**: Shows when inbox was last refreshed
- **Refreshing Indicator**: Shows when refresh is in progress
- **Manual Refresh**: Button to force refresh

## 📱 Usage

### For Users
1. **Connect Wallet**: Real-time mode starts automatically
2. **Send Messages**: Immediate feedback and notifications
3. **Receive Messages**: Instant notifications when friends send messages
4. **Toggle Real-time**: Use the ON/OFF button to enable/disable
5. **Manual Refresh**: Use the refresh button if needed

### For Developers
1. **Real-time Service**: Import and use `getRealtimeService()`
2. **Notifications**: Use `useNotifications()` hook
3. **Event Handling**: Subscribe to events with callbacks
4. **Customization**: Modify refresh intervals and notification styles

## 🔧 Configuration

### Refresh Intervals
```typescript
// Normal refresh interval (10 seconds)
const NORMAL_REFRESH_INTERVAL = 10000

// Aggressive refresh interval (3 seconds)
const AGGRESSIVE_REFRESH_INTERVAL = 3000

// Aggressive refresh duration (30 seconds)
const AGGRESSIVE_REFRESH_DURATION = 30000

// Event polling interval (2 seconds)
const EVENT_POLLING_INTERVAL = 2000
```

### Notification Settings
```typescript
// Default notification duration (5 seconds)
const DEFAULT_NOTIFICATION_DURATION = 5000

// Notification types and colors
const NOTIFICATION_STYLES = {
  success: 'bg-green-500 text-white',
  info: 'bg-blue-500 text-white',
  warning: 'bg-yellow-500 text-black',
  error: 'bg-red-500 text-white'
}
```

## 🚦 Performance Considerations

### Efficient Polling
- **Event Filtering**: Only processes relevant contract events
- **Sequence Tracking**: Avoids processing duplicate events
- **Conditional Polling**: Only polls when users are subscribed

### Memory Management
- **Auto-cleanup**: Unsubscribes when users disconnect
- **Event Cleanup**: Clears old events and notifications
- **Interval Management**: Properly clears intervals

### Network Optimization
- **Batch Processing**: Processes multiple events efficiently
- **Smart Intervals**: Adjusts refresh frequency based on activity
- **Error Handling**: Graceful handling of network issues

## 🔮 Future Enhancements

### Possible Improvements
1. **WebSocket Support**: Real WebSocket connections for instant updates
2. **Push Notifications**: Browser push notifications for offline users
3. **Message Previews**: Show message content in notifications
4. **Sound Notifications**: Audio alerts for new messages
5. **Message Threads**: Group related messages together
6. **Read Receipts**: Show when messages are read
7. **Typing Indicators**: Show when someone is typing
8. **Offline Support**: Cache messages for offline viewing

### Advanced Features
1. **Message Encryption**: End-to-end encryption for privacy
2. **File Attachments**: Support for sending files
3. **Voice Messages**: Audio message support
4. **Video Calls**: Integration with video calling
5. **Group Messaging**: Multi-user conversations
6. **Message Reactions**: Emoji reactions to messages
7. **Message Search**: Search through message history
8. **Message Backup**: Backup messages to IPFS

## 🏁 Conclusion

The real-time messaging system provides a seamless, instant messaging experience while maintaining the decentralized nature of the application. Users can now send and receive messages with immediate feedback, making the app feel as responsive as traditional messaging apps while leveraging blockchain technology for security and decentralization.

The system is designed to be:
- **Fast**: Messages appear instantly
- **Reliable**: Multiple fallback mechanisms
- **Efficient**: Smart refresh strategies
- **User-friendly**: Clear visual feedback
- **Scalable**: Can handle multiple users and high message volumes
