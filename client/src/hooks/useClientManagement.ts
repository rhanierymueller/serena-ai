import { useState, useCallback, useMemo } from 'react';
import { Client, ClientStatus } from '../types';

export const useClientManagement = (initialClients: Client[] = []) => {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<ClientStatus>('all');
  const [draggedClient, setDraggedClient] = useState<number | null>(null);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'all' || client.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [clients, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === 'active').length;
    const pendingClients = clients.filter(c => c.status === 'pending').length;
    const totalSessions = clients.reduce((sum, c) => sum + c.sessionsCount, 0);

    return {
      totalClients,
      activeClients,
      pendingClients,
      totalSessions,
    };
  }, [clients]);

  const updateClientOrder = useCallback((clientId: number, newOrder: number) => {
    setClients(prev =>
      prev.map(client => (client.id === clientId ? { ...client, order: newOrder } : client))
    );
  }, []);

  const addNote = useCallback((clientId: number, note: string) => {
    if (!note.trim()) return;

    const newNote = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      content: note,
      author: 'Dr. Professional', 
    };

    setClients(prev =>
      prev.map(client =>
        client.id === clientId
          ? { ...client, clinicalNotes: [newNote, ...client.clinicalNotes] }
          : client
      )
    );
  }, []);

  const updateClient = useCallback((clientId: number, updates: Partial<Client>) => {
    setClients(prev =>
      prev.map(client => (client.id === clientId ? { ...client, ...updates } : client))
    );
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  }, []);

  const getMoodTrendIcon = useCallback((trend: string) => {
    switch (trend) {
      case 'improving':
        return '📈';
      case 'stable':
        return '➖';
      case 'declining':
        return '📉';
      default:
        return '➖';
    }
  }, []);

  const handleDragStart = useCallback((clientId: number) => {
    setDraggedClient(clientId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedClient(null);
  }, []);

  const handleDrop = useCallback(
    (targetClientId: number) => {
      if (draggedClient && draggedClient !== targetClientId) {
        const draggedIndex = clients.findIndex(c => c.id === draggedClient);
        const targetIndex = clients.findIndex(c => c.id === targetClientId);

        if (draggedIndex !== -1 && targetIndex !== -1) {
          const newClients = [...clients];
          const [draggedItem] = newClients.splice(draggedIndex, 1);
          newClients.splice(targetIndex, 0, draggedItem);
          const updatedClients = newClients.map((client, index) => ({
            ...client,
            order: index + 1,
          }));

          setClients(updatedClients);
        }
      }
      setDraggedClient(null);
    },
    [clients, draggedClient]
  );

  return {
    clients,
    filteredClients,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    draggedClient,
    stats,
    updateClientOrder,
    addNote,
    updateClient,
    getStatusColor,
    getMoodTrendIcon,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };
};