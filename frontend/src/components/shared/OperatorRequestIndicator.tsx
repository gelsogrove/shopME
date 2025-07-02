import React from 'react';
import { AlertCircle, User, Clock, MessageSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { OperatorRequest } from '../../services/operatorRequestsApi';
import { Badge } from '../ui/badge';
import { cn } from '../../lib/utils';

interface OperatorRequestIndicatorProps {
  operatorRequest: OperatorRequest;
  onTakeControl: (requestId: string) => void;
  isLoading?: boolean;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const OperatorRequestIndicator: React.FC<OperatorRequestIndicatorProps> = ({
  operatorRequest,
  onTakeControl,
  isLoading = false,
  showDetails = true,
  size = 'md',
  className
}) => {
  const handleClick = () => {
    if (!isLoading) {
      onTakeControl(operatorRequest.id);
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString('it-IT', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return 'N/A';
    }
  };

  const getTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return 'Ora';
      if (diffInMinutes < 60) return `${diffInMinutes}m fa`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h fa`;
      return `${Math.floor(diffInMinutes / 1440)}g fa`;
    } catch {
      return 'N/A';
    }
  };

  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const iconSizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClick}
              disabled={isLoading}
              className={cn(
                'relative p-0 rounded-full border-2 border-red-200 bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110',
                sizeClasses[size],
                isLoading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Animated pulse ring */}
              <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-30" />
              
              {/* Main icon container */}
              <div className="relative z-10 flex items-center justify-center">
                <AlertCircle 
                  className={cn(
                    'text-white animate-pulse',
                    iconSizeClasses[size]
                  )} 
                />
                <User 
                  className={cn(
                    'absolute text-white',
                    size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
                  )} 
                />
              </div>

              {/* Loading spinner overlay */}
              {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-600 bg-opacity-80 rounded-full">
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                </div>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-semibold text-red-600">
                🆘 Richiesta Operatore
              </div>
              <div className="text-sm">
                <div className="flex items-center gap-1 mb-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(operatorRequest.timestamp)} ({getTimeAgo(operatorRequest.createdAt)})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="h-3 w-3" />
                  <span className="italic">"{operatorRequest.message}"</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground border-t pt-1">
                Clicca per prendere il controllo della chat
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {showDetails && (
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="text-xs animate-pulse">
              OPERATORE RICHIESTO
            </Badge>
            <span className="text-xs text-muted-foreground">
              {getTimeAgo(operatorRequest.createdAt)}
            </span>
          </div>
          
          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
            <span className="italic">"{operatorRequest.message}"</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            📞 {operatorRequest.phoneNumber}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Simple badge component for showing operator request count
 */
interface OperatorRequestsBadgeProps {
  count: number;
  className?: string;
}

export const OperatorRequestsBadge: React.FC<OperatorRequestsBadgeProps> = ({
  count,
  className
}) => {
  if (count === 0) return null;

  return (
    <Badge 
      variant="destructive" 
      className={cn(
        'absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs font-bold animate-bounce',
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </Badge>
  );
};