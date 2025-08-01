import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { API_CONFIG } from '@/config/api';

export function NetworkStatus() {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkBackendConnection = async () => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        setIsBackendConnected(response.ok);
      } catch (error) {
        setIsBackendConnected(false);
      } finally {
        setIsChecking(false);
      }
    };

    checkBackendConnection();
    
    // Check every 30 seconds
    const interval = setInterval(checkBackendConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isChecking) {
    return (
      <Badge variant="secondary" className="text-xs">
        Checking...
      </Badge>
    );
  }

  return (
    <Badge 
      variant={isBackendConnected ? "default" : "destructive"} 
      className="text-xs"
    >
      {isBackendConnected ? "Backend Connected" : "Using Fallback API"}
    </Badge>
  );
}