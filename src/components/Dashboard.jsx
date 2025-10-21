import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Activity, 
  TrendingUp, 
  Clock,
  Plus
} from 'lucide-react';
import { conferenciasService } from '../services/api';
import { formatarData } from '../lib/utils';
import ConferenciasList from './ConferenciasList';

export default function Dashboard({ onNovaConferencia }) {
  const [estatisticas, setEstatisticas] = useState({
    total: 0,
    esteMes: 0,
    totalPortas: 0,
    cidadesAtendidas: 0
  });
  const [loading, setLoading] = useState(true);

  // Carregar estatísticas
  const carregarEstatisticas = async () => {
    setLoading(true);
    
    try {
      const conferencias = await conferenciasService.buscarConferencias();
      
      // Calcular estatísticas
      const agora = new Date();
      const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
      
      const conferenciasMes = conferencias.filter(conf => 
        new Date(conf.dataConferencia) >= inicioMes
      );
      
      const totalPortas = conferencias.reduce((total, conf) => 
        total + (conf.portas?.length || 0), 0
      );
      
      const cidadesUnicas = new Set(
        conferencias.map(conf => conf.cidade?.toLowerCase()).filter(Boolean)
      );
      
      setEstatisticas({
        total: conferencias.length,
        esteMes: conferenciasMes.length,
        totalPortas,
        cidadesAtendidas: cidadesUnicas.size
      });
      
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Carregando dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Visão geral do sistema de conferências
          </p>
        </div>
        <Button 
          onClick={onNovaConferencia}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nova Conferência
        </Button>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Conferências
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.total}</div>
            <p className="text-xs text-muted-foreground">
              Todas as conferências registradas
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Este Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.esteMes}</div>
            <p className="text-xs text-muted-foreground">
              Conferências realizadas este mês
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Portas
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.totalPortas}</div>
            <p className="text-xs text-muted-foreground">
              Portas conferidas no total
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cidades Atendidas
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estatisticas.cidadesAtendidas}</div>
            <p className="text-xs text-muted-foreground">
              Cidades com conferências
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Últimas conferências */}
      <ConferenciasList 
        limite={5} 
        titulo="Últimas 05 Conferências"
      />

      {/* Ações rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={onNovaConferencia}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Plus className="h-6 w-6" />
              <span>Nova Conferência</span>
            </Button>
            
            <Button 
              onClick={() => window.location.reload()}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Activity className="h-6 w-6" />
              <span>Atualizar Dados</span>
            </Button>
            
            <Button 
              onClick={carregarEstatisticas}
              variant="outline" 
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <TrendingUp className="h-6 w-6" />
              <span>Recalcular Estatísticas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
