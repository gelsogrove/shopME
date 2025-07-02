import React, { useEffect } from 'react';
import { ArrowLeft, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { PageLayout } from '../components/layout/PageLayout';
import { OperatorRequestsPanel } from '../components/shared/OperatorRequestsPanel';
import { useOperatorRequests } from '../hooks/useOperatorRequests';
import { useWorkspace } from '../hooks/use-workspace';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function OperatorRequestsPage() {
  const navigate = useNavigate();
  const { workspace, loading: isWorkspaceLoading } = useWorkspace();
  
  const {
    operatorRequests,
    totalRequests,
    isLoading,
    isError,
    error,
    refetch,
    takeControl,
    isTakingControl
  } = useOperatorRequests();

  // Redirect if no workspace
  useEffect(() => {
    if (!isWorkspaceLoading && !workspace) {
      navigate('/clients');
    }
  }, [isWorkspaceLoading, workspace, navigate]);

  // Handle taking control with navigation
  const handleTakeControlWithNav = async (requestId: string) => {
    try {
      await takeControl(requestId);
      
      // Find the request to get chat information
      const request = operatorRequests.find(req => req.id === requestId);
      if (request) {
        toast.success('Controllo acquisito!', {
          description: `Sei stato reindirizzato alla chat con ${request.phoneNumber}`,
          action: {
            label: 'Vai alla chat',
            onClick: () => navigate(`/chat?sessionId=${request.chatId}`)
          }
        });
        
        // Auto-navigate to chat after 2 seconds
        setTimeout(() => {
          navigate(`/chat?sessionId=${request.chatId}`);
        }, 2000);
      }
    } catch (error) {
      console.error('Error taking control:', error);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  if (isWorkspaceLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="flex flex-col items-center gap-2">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Caricamento workspace...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/chat')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Torna alle chat
            </Button>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Richieste Operatore
              </h1>
              <p className="text-sm text-muted-foreground">
                Gestisci tutte le richieste di assistenza umana del workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Aggiorna
            </Button>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{totalRequests}</p>
                <p className="text-sm text-muted-foreground">Richieste Attive</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {operatorRequests.filter(req => {
                    const diffInMinutes = Math.floor((new Date().getTime() - new Date(req.createdAt).getTime()) / (1000 * 60));
                    return diffInMinutes > 30;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Urgenti (&gt;30min)</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {operatorRequests.filter(req => {
                    const diffInMinutes = Math.floor((new Date().getTime() - new Date(req.createdAt).getTime()) / (1000 * 60));
                    return diffInMinutes <= 10;
                  }).length}
                </p>
                <p className="text-sm text-muted-foreground">Recenti (&lt;10min)</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Error State */}
        {isError && (
          <Card className="p-6 border-red-200 bg-red-50">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Errore nel caricamento</h3>
                <p className="text-sm text-red-600">
                  {error instanceof Error ? error.message : 'Errore sconosciuto'}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="ml-auto"
              >
                Riprova
              </Button>
            </div>
          </Card>
        )}

        {/* Main Panel */}
        <OperatorRequestsPanel
          operatorRequests={operatorRequests}
          onTakeControl={handleTakeControlWithNav}
          isTakingControl={isTakingControl}
          isLoading={isLoading}
        />

        {/* Instructions */}
        {totalRequests === 0 && !isLoading && (
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="space-y-3">
              <h3 className="font-semibold text-blue-800">Come funziona il sistema Operator Requests</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p>
                  <strong>1. Cliente richiede operatore:</strong> Quando un cliente scrive frasi come "voglio parlare con un operatore" o "ho bisogno di aiuto umano", N8N intercetta la richiesta.
                </p>
                <p>
                  <strong>2. Richiesta salvata:</strong> Il sistema salva automaticamente la richiesta nel database con tutti i dettagli della conversazione.
                </p>
                <p>
                  <strong>3. Notifica visiva:</strong> Appare immediatamente un'icona rossa pulsante nella lista chat e in questa pagina.
                </p>
                <p>
                  <strong>4. Presa di controllo:</strong> Clicca sull'icona rossa per prendere il controllo della chat e rispondere direttamente al cliente.
                </p>
                <p>
                  <strong>5. Cancellazione automatica:</strong> Quando prendi il controllo, la richiesta viene automaticamente rimossa dal sistema.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}