import { useState, useEffect, useCallback } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { aptos, CONTRACT_ADDRESS } from '../config';

interface Message {
  sender: string;
  cid: number[] | string;
  timestamp: number;
  read: boolean;
  plain?: string;
}

interface ProcessedMessage extends Message {
  plain: string;
  cidString?: string;
  type?: 'text' | 'audio';
}

interface InboxProps {
  refreshKey?: number;
}

export default function Inbox({ refreshKey }: InboxProps) {
  const { account } = useWallet();
  const [msgs, setMsgs] = useState<ProcessedMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!account) return;
    console.log('Loading inbox - refreshKey:', refreshKey, 'account:', account.address);
    setLoading(true);
    try {
      console.log('Loading messages for account:', account.address);
      console.log('Using contract address:', CONTRACT_ADDRESS);

      const messages = await aptos.view({
        payload: {
          function: `${CONTRACT_ADDRESS}::Inbox3::inbox_of`,
          functionArguments: [account.address]
        }
      });

      console.log('Raw messages from contract:', messages);

      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        setMsgs([]);
        return;
      }

      const messageList = messages[0] as Message[];
      console.log('Message list:', messageList);

      const processedMessages: ProcessedMessage[] = await Promise.all(messageList.map(async (m: Message, index: number) => {
        try {
          console.log(`Processing message ${index}:`, m);

          let messageContent = `Message #${index} from ${m.sender.slice(0, 6)}...${m.sender.slice(-4)}`;
          let cidString = '';
          let messageType: 'text' | 'audio' = 'text';

          try {
            if (typeof m.cid === 'string' && m.cid.startsWith('0x')) {
              const hexString = m.cid.slice(2);
              cidString = '';
              for (let i = 0; i < hexString.length; i += 2) {
                const hexByte = hexString.substr(i, 2);
                cidString += String.fromCharCode(parseInt(hexByte, 16));
              }
            } else if (Array.isArray(m.cid)) {
              cidString = new TextDecoder().decode(new Uint8Array(m.cid));
            } else {
              cidString = String(m.cid);
            }
          } catch (decodeError) {
            console.log('CID decode failed:', decodeError);
            cidString = 'decode-failed';
          }

          try {
            if (cidString && cidString !== 'decode-failed') {
              const timestamp = new Date(m.timestamp * 1000).toLocaleString();

              try {
                const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cidString}`);
                if (response.ok) {
                  const data = await response.json();
                  messageContent = data.content || data.message || `Message sent at ${timestamp}`;
                  messageType = data.type || 'text';
                }
              } catch (fetchError) {
                console.log('IPFS fetch failed:', fetchError);
              }
            }
          } catch (contentError) {
            console.log('Error getting message content:', contentError);
          }

          return {
            ...m,
            plain: messageContent,
            cidString,
            type: messageType
          };
        } catch (error) {
          console.error('Error processing message:', error);
          return {
            ...m,
            plain: 'Error loading message',
            cidString: 'error',
            type: 'text'
          };
        }
      }));

      setMsgs(processedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }, [account, refreshKey]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  const markAsRead = async (messageId: number) => {
    if (!account) return;
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::Inbox3::mark_read`,
        type_arguments: [],
        arguments: [messageId]
      };

      const response = await window.aptos.signAndSubmitTransaction({ payload });
      await aptos.waitForTransaction({ transactionHash: response.hash });

      load();
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="spinner"></div>
          <span className="ml-2 text-secondary">Loading messages...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {msgs.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-(--border-color) rounded-2xl bg-(--bg-secondary)">
          <h3 className="font-medium text-primary mb-2">No messages yet</h3>
          <p className="text-secondary text-sm">
            Your inbox is empty. Messages will appear here once you receive them.
          </p>
        </div>
      ) : (
        <div className="inbox-container">
          <div className="space-y-0">
            {msgs.map((m, index) => (
              <div key={index} className={`message-item ${!m.read ? 'message-unread' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      {m.sender.slice(2, 4).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-primary text-sm" title={m.sender}>
                          {m.sender.slice(0, 6)}...{m.sender.slice(-4)}
                        </span>
                        <button
                          onClick={() => copyToClipboard(m.sender)}
                          className="text-xs text-(--text-secondary) hover:text-(--primary-brand) transition-colors"
                          title="Copy Address"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                        </button>
                        <div className="w-1 h-1 bg-muted rounded-full"></div>
                        <span className="text-xs text-muted">
                          {new Date(m.timestamp * 1000).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-(--text-secondary) break-all select-all">
                        {m.sender}
                      </span>
                    </div>
                  </div>
                  {!m.read && (
                    <div className="w-2 h-2 bg-[#FF591B] rounded-full"></div>
                  )}
                </div>
                <div className="message-content">
                  {m.type === 'audio' ? (
                    <audio controls src={m.plain} className="w-full mt-2" />
                  ) : (
                    <p className="text-sm text-(--text-primary)">{m.plain}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-3">
                  <a
                    href={`https://explorer.aptoslabs.com/account/${CONTRACT_ADDRESS}?network=testnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-(--primary-brand) hover:underline opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1"
                    title="View on Explorer"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    On-chain Proof
                  </a>
                  {!m.read && (
                    <button onClick={() => markAsRead(index)} className="btn btn-outline text-xs py-1 px-3">
                      Mark as Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
