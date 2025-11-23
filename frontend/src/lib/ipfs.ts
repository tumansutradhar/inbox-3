const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const PINATA_SECRET_KEY = import.meta.env.VITE_PINATA_SECRET_KEY;
const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || 'gateway.pinata.cloud';

export const upload = async (data: string): Promise<string> => {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    console.warn('Pinata credentials not configured. Using mock CID.');
    const mockCid = 'mock-cid-' + Date.now();

    try {
      localStorage.setItem(`ipfs-${mockCid}`, data);
      console.log('Stored mock IPFS data locally:', mockCid);
    } catch (e) {
      console.warn('Failed to store mock data locally:', e);
    }

    return mockCid;
  }

  try {
    const blob = new Blob([data], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, 'message.json');

    const metadata = {
      name: `inbox3-message-${Date.now()}`,
      keyvalues: {
        app: 'inbox3',
        timestamp: Date.now().toString()
      }
    };
    formData.append('pinataMetadata', JSON.stringify(metadata));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': PINATA_API_KEY,
        'pinata_secret_api_key': PINATA_SECRET_KEY,
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }

    const result = await response.json();
    console.log('Uploaded to Pinata:', result.IpfsHash);
    return result.IpfsHash;
  } catch (error) {
    console.error('Pinata upload failed:', error);
    return 'fallback-cid-' + Date.now();
  }
};

export const download = async (cid: string): Promise<string> => {
  if (cid.startsWith('mock-cid-') || cid.startsWith('fallback-cid-')) {
    try {
      const storedData = localStorage.getItem(`ipfs-${cid}`);
      if (storedData) {
        console.log('Retrieved mock data from localStorage:', cid);
        return storedData;
      }
    } catch (e) {
      console.warn('Failed to retrieve mock data from localStorage:', e);
    }

    console.warn('Using fallback mock data - Pinata not configured.');
    return JSON.stringify({ content: 'Mock message content', timestamp: Date.now() });
  }

  try {
    const gateways = [
      `https://${PINATA_GATEWAY}/ipfs/${cid}`,
      `https://ipfs.io/ipfs/${cid}`,
      `https://gateway.ipfs.io/ipfs/${cid}`
    ];

    for (const gateway of gateways) {
      try {
        const response = await fetch(gateway);
        if (response.ok) {
          const text = await response.text();
          console.log('Downloaded from:', gateway);
          return text;
        }
      } catch (err) {
        console.warn(`Failed to fetch from ${gateway}:`, err);
      }
    }

    throw new Error('All IPFS gateways failed');
  } catch (error) {
    console.error('IPFS download failed:', error);
    return JSON.stringify({ content: 'Error loading message', timestamp: Date.now() });
  }
};

export const uploadToPinata = async (content: string, sender: string): Promise<string> => {
  const data = JSON.stringify({
    sender,
    content,
    timestamp: Date.now()
  });
  return upload(data);
};

export const getFromPinata = async (cid: string): Promise<{ content: string; sender: string; timestamp: number }> => {
  try {
    const jsonStr = await download(cid);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Failed to parse message JSON:', e);
    return { content: 'Failed to load message', sender: 'Unknown', timestamp: Date.now() };
  }
};
