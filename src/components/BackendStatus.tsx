import { useEffect, useState } from 'react';
import { checkBackendHealth, getApiConfig } from '../config/api';

export const BackendStatus = () => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setIsChecking(true);
      const healthy = await checkBackendHealth();
      setIsHealthy(healthy);
      setIsChecking(false);
    };

    checkHealth();
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const config = getApiConfig();

  // Only show in development mode
  if (!config.isDevelopment) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white rounded-lg shadow-lg p-3 text-sm border border-gray-200">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${
          isChecking ? 'bg-yellow-400 animate-pulse' :
          isHealthy ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <div>
          <div className="font-semibold text-gray-900">
            {isChecking ? 'Checking...' : isHealthy ? 'Backend Connected' : 'Backend Offline'}
          </div>
          <div className="text-xs text-gray-500">{config.baseUrl}</div>
        </div>
      </div>
    </div>
  );
};
