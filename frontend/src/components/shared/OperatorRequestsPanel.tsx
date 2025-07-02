import React, { useState } from 'react';
import { Clock, User, MessageSquare, Phone, Calendar, Filter, SortAsc, SortDesc } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { OperatorRequest } from '../../services/operatorRequestsApi';
import { OperatorRequestIndicator } from './OperatorRequestIndicator';
import { cn } from '../../lib/utils';

interface OperatorRequestsPanelProps {
  operatorRequests: OperatorRequest[];
  onTakeControl: (requestId: string) => void;
  isTakingControl: boolean;
  isLoading?: boolean;
  className?: string;
}

type SortOption = 'newest' | 'oldest' | 'phone';
type FilterOption = 'all' | 'urgent' | 'recent';

export const OperatorRequestsPanel: React.FC<OperatorRequestsPanelProps> = ({
  operatorRequests,
  onTakeControl,
  isTakingControl,
  isLoading = false,
  className
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
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

  const isUrgent = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes > 30; // Consider urgent if older than 30 minutes
    } catch {
      return false;
    }
  };

  const isRecent = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes <= 10; // Consider recent if within 10 minutes
    } catch {
      return false;
    }
  };

  // Filter requests
  const filteredRequests = operatorRequests.filter(request => {
    switch (filterBy) {
      case 'urgent':
        return isUrgent(request.createdAt);
      case 'recent':
        return isRecent(request.createdAt);
      default:
        return true;
    }
  });

  // Sort requests
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'phone':
        return a.phoneNumber.localeCompare(b.phoneNumber);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const urgentCount = operatorRequests.filter(req => isUrgent(req.createdAt)).length;
  const recentCount = operatorRequests.filter(req => isRecent(req.createdAt)).length;

  if (isLoading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-center h-40">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-red-500 border-t-transparent" />
            <p className="text-sm text-muted-foreground">Caricamento richieste...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-800 flex items-center gap-2">
              <User className="h-5 w-5" />
              Richieste Operatore
              <Badge variant="destructive" className="ml-2">
                {operatorRequests.length}
              </Badge>
            </h3>
            <p className="text-sm text-muted-foreground">
              Gestisci le richieste di assistenza umana
            </p>
          </div>
        </div>

        {/* Stats */}
        {operatorRequests.length > 0 && (
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-lg font-bold text-red-600">{operatorRequests.length}</div>
              <div className="text-xs text-red-500">Totali</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="text-lg font-bold text-orange-600">{urgentCount}</div>
              <div className="text-xs text-orange-500">Urgenti (&gt;30min)</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-lg font-bold text-green-600">{recentCount}</div>
              <div className="text-xs text-green-500">Recenti (&lt;10min)</div>
            </div>
          </div>
        )}

        {/* Controls */}
        {operatorRequests.length > 0 && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterBy} onValueChange={(value) => setFilterBy(value as FilterOption)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte ({operatorRequests.length})</SelectItem>
                  <SelectItem value="urgent">Urgenti ({urgentCount})</SelectItem>
                  <SelectItem value="recent">Recenti ({recentCount})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              {sortBy === 'newest' ? <SortDesc className="h-4 w-4 text-muted-foreground" /> : <SortAsc className="h-4 w-4 text-muted-foreground" />}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Più recenti</SelectItem>
                  <SelectItem value="oldest">Più vecchie</SelectItem>
                  <SelectItem value="phone">Per telefono</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Requests List */}
        {sortedRequests.length > 0 ? (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {sortedRequests.map((request) => (
                <div
                  key={request.id}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    isUrgent(request.createdAt) 
                      ? 'bg-red-50 border-red-200 ring-1 ring-red-200' 
                      : isRecent(request.createdAt)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200'
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Header */}
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-sm">{request.phoneNumber}</span>
                        {isUrgent(request.createdAt) && (
                          <Badge variant="destructive" className="text-xs">URGENTE</Badge>
                        )}
                        {isRecent(request.createdAt) && (
                          <Badge className="bg-green-500 text-white text-xs">NUOVO</Badge>
                        )}
                      </div>

                      {/* Message */}
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-700 italic">
                            "{request.message}"
                          </p>
                        </div>
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(request.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>Creata {getTimeAgo(request.createdAt)}</span>
                        </div>
                      </div>

                      {/* Chat ID */}
                      <div className="text-xs text-muted-foreground">
                        Chat ID: <code className="bg-gray-100 px-1 rounded">{request.chatId}</code>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
                      <OperatorRequestIndicator
                        operatorRequest={request}
                        onTakeControl={onTakeControl}
                        isLoading={isTakingControl}
                        showDetails={false}
                        size="lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          <div className="text-center py-8">
            {operatorRequests.length === 0 ? (
              <div className="space-y-2">
                <User className="h-12 w-12 text-muted-foreground mx-auto" />
                <h4 className="text-lg font-medium text-muted-foreground">Nessuna richiesta operatore</h4>
                <p className="text-sm text-muted-foreground">
                  Le richieste di assistenza umana appariranno qui
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Filter className="h-12 w-12 text-muted-foreground mx-auto" />
                <h4 className="text-lg font-medium text-muted-foreground">Nessun risultato</h4>
                <p className="text-sm text-muted-foreground">
                  Nessuna richiesta corrisponde ai filtri selezionati
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setFilterBy('all');
                    setSortBy('newest');
                  }}
                >
                  Cancella filtri
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};