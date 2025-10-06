import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Wifi, WifiOff } from 'lucide-react';
import { ConnectionStatus } from '../types';

interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  onModeChange: (isLive: boolean) => void;
}

export function ConnectionStatusIndicator({ status, onModeChange }: ConnectionStatusIndicatorProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleModeChange = async (checked: boolean) => {
    setIsToggling(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onModeChange(checked);
    setIsToggling(false);
  };

  return (
    <div className="flex items-center gap-3">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant={status.isLive ? "default" : "secondary"}
              className="flex items-center gap-2 px-3 py-1"
            >
              {status.isLive ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {status.mode}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <p className="font-medium mb-1">
                {status.isLive ? 'Live IPN Feed' : 'Demo Mode'}
              </p>
              <p className="text-sm">
                {status.isLive 
                  ? 'Connected to Jenga PGW for real-time payment notifications'
                  : 'Using mock data for demonstration purposes'
                }
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last updated: {new Date(status.lastUpdate).toLocaleTimeString()}
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Demo</span>
        <Switch
          checked={status.isLive}
          onCheckedChange={handleModeChange}
          disabled={isToggling}
          aria-label="Toggle between Demo Mode and Live IPN Feed"
        />
        <span className="text-sm text-muted-foreground">Live</span>
      </div>
    </div>
  );
}
