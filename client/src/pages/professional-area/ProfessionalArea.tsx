import React, { useState, useEffect } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { useI18n } from '../../i18n/I18nContext';
import {
  Briefcase,
  Users,
  MessageCircle,
  BarChart3,
  Calendar,
  Mail,
  Lock,
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Clock,
  TrendingUp,
  Heart,
  Brain,
  Shield,
  User,
  Send,
  X,
  Star,
  AlertCircle,
  CheckCircle,
  Video,
  Plus,
  FileText,
  GripVertical,
  Mic,
  MicOff,
  MessageSquare,
  CalendarPlus,
  Link,
  Copy,
} from 'lucide-react';

interface Note {
  id: number;
  date: string;
  content: string;
  author: string;
}

interface Meeting {
  id: number;
  clientId: number;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  link: string;
  notes?: string;
}

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  joinDate: string;
  lastSession: string;
  sessionsCount: number;
  status: 'active' | 'inactive' | 'pending';
  avatar: string;
  moodTrend: 'improving' | 'stable' | 'declining';
  currentPlan: string;
  notes: string;
  clinicalNotes: Note[];
  order: number;
  meetings?: Meeting[];
}

interface Professional {
  id: number;
  name: string;
  email: string;
  specialty: string;
  license: string;
  avatar: string;
}

const ProfessionalArea: React.FC = () => {
  const { t } = useI18n();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive' | 'pending'>(
    'all'
  );
  const [chatMessage, setChatMessage] = useState('');
  const [newNote, setNewNote] = useState('');
  const [draggedClient, setDraggedClient] = useState<number | null>(null);
  const [isVideoCall, setIsVideoCall] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoCallChatOpen, setIsVideoCallChatOpen] = useState(false);
  const [userStream, setUserStream] = useState<MediaStream | null>(null);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [meetingDuration, setMeetingDuration] = useState(60);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [generatedLink, setGeneratedLink] = useState('');
  const professional: Professional = {
    id: 1,
    name: 'Dr. Maria Silva',
    email: 'maria@avylia.com',
    specialty: 'Psicologia Clínica',
    license: 'CRP 12345',
    avatar: '/image/profile.webp',
  };

  const mockClients: Client[] = [
    {
      id: 1,
      name: 'Ana Costa',
      email: 'ana@email.com',
      phone: '(11) 99999-9999',
      joinDate: '2024-01-15',
      lastSession: '2024-01-20',
      sessionsCount: 12,
      status: 'active',
      avatar: '👩‍💼',
      moodTrend: 'improving',
      currentPlan: 'Premium',
      notes: 'Paciente apresenta melhora significativa no quadro de ansiedade.',
      order: 1,
      clinicalNotes: [
        {
          id: 1,
          date: '2024-01-20',
          content:
            'Paciente relatou diminuição dos episódios de ansiedade. Continuando com técnicas de respiração.',
          author: 'Dr. Maria Silva',
        },
        {
          id: 2,
          date: '2024-01-15',
          content:
            'Primeira consulta. Histórico de ansiedade generalizada. Iniciando terapia cognitivo-comportamental.',
          author: 'Dr. Maria Silva',
        },
      ],
    },
    {
      id: 2,
      name: 'Carlos Santos',
      email: 'carlos@email.com',
      phone: '(11) 88888-8888',
      joinDate: '2024-01-10',
      lastSession: '2024-01-18',
      sessionsCount: 8,
      status: 'active',
      avatar: '👨‍💻',
      moodTrend: 'stable',
      currentPlan: 'Basic',
      notes: 'Trabalhando questões relacionadas ao trabalho e estresse.',
      order: 2,
      clinicalNotes: [
        {
          id: 3,
          date: '2024-01-18',
          content:
            'Discussão sobre estratégias de gerenciamento de estresse no trabalho. Paciente demonstra boa evolução.',
          author: 'Dr. Maria Silva',
        },
      ],
    },
    {
      id: 3,
      name: 'Beatriz Lima',
      email: 'beatriz@email.com',
      phone: '(11) 77777-7777',
      joinDate: '2024-01-05',
      lastSession: '2024-01-12',
      sessionsCount: 15,
      status: 'pending',
      avatar: '👩‍🎓',
      moodTrend: 'declining',
      currentPlan: 'Premium',
      notes: 'Necessita acompanhamento mais próximo. Última sessão cancelada.',
      order: 3,
      clinicalNotes: [
        {
          id: 4,
          date: '2024-01-12',
          content:
            'Paciente cancelou última sessão. Sinais de piora no quadro depressivo. Necessário contato urgente.',
          author: 'Dr. Maria Silva',
        },
      ],
    },
    {
      id: 4,
      name: 'João Oliveira',
      email: 'joao@email.com',
      phone: '(11) 66666-6666',
      joinDate: '2023-12-20',
      lastSession: '2024-01-19',
      sessionsCount: 20,
      status: 'active',
      avatar: '👨‍🏫',
      moodTrend: 'improving',
      currentPlan: 'Premium',
      notes: 'Excelente progresso no tratamento de depressão.',
      order: 4,
      clinicalNotes: [
        {
          id: 5,
          date: '2024-01-19',
          content:
            'Paciente demonstra grande melhora no humor. Redução significativa dos sintomas depressivos.',
          author: 'Dr. Maria Silva',
        },
        {
          id: 6,
          date: '2024-01-10',
          content: 'Ajuste na medicação. Paciente respondendo bem ao tratamento combinado.',
          author: 'Dr. Maria Silva',
        },
      ],
    },
  ];
  const [clients, setClients] = useState<Client[]>(mockClients);
  useEffect(() => {
    return () => {
      if (userStream) {
        userStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [userStream]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setSelectedClient(null);
    setShowChat(false);
  };

  const filteredClients = clients
    .filter(client => {
      const matchesSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || client.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => a.order - b.order);

  const handleDragStart = (e: React.DragEvent, clientId: number) => {
    setDraggedClient(clientId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetClientId: number) => {
    e.preventDefault();
    if (draggedClient === null) return;
    const updatedClients = [...clients];
    const draggedIndex = updatedClients.findIndex(c => c.id === draggedClient);
    const targetIndex = updatedClients.findIndex(c => c.id === targetClientId);
    if (draggedIndex === -1 || targetIndex === -1) return;
    const draggedClientData = updatedClients[draggedIndex];
    updatedClients.splice(draggedIndex, 1);
    updatedClients.splice(targetIndex, 0, draggedClientData);
    updatedClients.forEach((client, index) => {
      client.order = index + 1;
    });

    setClients(updatedClients);
    setDraggedClient(null);
  };

  const addNote = () => {
    if (!newNote.trim() || !selectedClient) return;

    const note: Note = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      content: newNote.trim(),
      author: professional.name,
    };

    const updatedClients = clients.map(client =>
      client.id === selectedClient.id
        ? { ...client, clinicalNotes: [note, ...client.clinicalNotes] }
        : client
    );
    setClients(updatedClients);
    setSelectedClient(prev =>
      prev ? { ...prev, clinicalNotes: [note, ...prev.clinicalNotes] } : null
    );
    setNewNote('');
  };

  const startVideoCall = async () => {
    setIsVideoCall(true);
    setIsCameraOn(true);
    setIsMuted(false);
    setIsVideoCallChatOpen(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setUserStream(stream);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Erro ao acessar a câmera. Verifique as permissões.');
    }
  };

  const toggleCamera = async () => {
    if (isCameraOn && userStream) {

      const videoTracks = userStream.getVideoTracks();
      videoTracks.forEach(track => track.stop());
      setIsCameraOn(false);
    } else {

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: !isMuted,
        });
        setUserStream(stream);
        setIsCameraOn(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Erro ao acessar a câmera. Verifique as permissões.');
      }
    }
  };

  const toggleMute = () => {
    if (userStream) {
      const audioTracks = userStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = isMuted; 
      });
    }
    setIsMuted(!isMuted);
  };

  const endCall = () => {

    if (userStream) {
      userStream.getTracks().forEach(track => track.stop());
      setUserStream(null);
    }
    setIsVideoCall(false);
    setIsCameraOn(true);
    setIsMuted(false);
    setIsVideoCallChatOpen(false);
  };

  const toggleVideoCallChat = () => {
    setIsVideoCallChatOpen(!isVideoCallChatOpen);
  };

  const scheduleMeeting = () => {
    if (!selectedClient || !selectedDate || !selectedTime) return;
    const meetingId = Date.now();
    const meetingLink = `${window.location.origin}/video-call/${meetingId}`;

    const newMeeting: Meeting = {
      id: meetingId,
      clientId: selectedClient.id,
      date: selectedDate,
      time: selectedTime,
      duration: meetingDuration,
      status: 'scheduled',
      link: meetingLink,
    };

    setMeetings([...meetings, newMeeting]);
    setGeneratedLink(meetingLink);

    setSelectedDate('');
    setSelectedTime('');
    setMeetingDuration(60);
  };

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    alert(t('professional.meetings.linkCopied'));
  };

  const openScheduleModal = (client: Client) => {
    setSelectedClient(client);
    setShowScheduleModal(true);
  };

  const getClientMeetings = (clientId: number) => {
    return meetings.filter(meeting => meeting.clientId === clientId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/20';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/20';
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getMoodTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'stable':
        return <Heart className="h-4 w-4 text-blue-400" />;
      case 'declining':
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Heart className="h-4 w-4 text-gray-400" />;
    }
  };

  const stats = {
    totalClients: clients.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    pendingClients: clients.filter(c => c.status === 'pending').length,
    totalSessions: clients.reduce((sum, client) => sum + client.sessionsCount, 0),
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header fixed showMenu />
        <main className="pt-20"><section className="py-20 px-4">
            <div className="max-w-4xl mx-auto text-center">
              <div className="flex items-center justify-center gap-3 mb-6">
                <Briefcase className="h-8 w-8 text-[#6DAEDB]" />
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] bg-clip-text text-transparent">
                  {t('professional.title')}
                </h1>
              </div>
              <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                {t('professional.subtitle')}
              </p>
            </div>
          </section><section className="pb-20 px-4">
            <div className="max-w-md mx-auto">
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {t('professional.login.title')}
                  </h2>
                  <p className="text-gray-400">{t('professional.login.subtitle')}</p>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="flex items-center gap-2 text-white mb-3 font-medium">
                      <Mail className="h-4 w-4 text-[#6DAEDB]" />
                      {t('professional.login.email')}
                    </label>
                    <input
                      type="email"
                      value="maria@avylia.com"
                      readOnly
                      className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all"
                      placeholder="seu@email.com"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-white mb-3 font-medium">
                      <Lock className="h-4 w-4 text-[#6DAEDB]" />
                      {t('professional.login.password')}
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value="••••••••"
                        readOnly
                        className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all pr-12"
                        placeholder="••••••••"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <Lock className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white font-semibold py-3 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    {t('professional.login.enterPlatform')}
                  </button>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-400">
                    {t('professional.login.forgotPassword')}{' '}
                    <span className="text-[#6DAEDB] hover:text-[#4F91C3] cursor-pointer">
                      {t('professional.login.clickHere')}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header fixed showMenu />
      <main className="pt-20"><section className="py-8 px-4 border-b border-white/10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={professional.avatar}
                  alt={professional.name}
                  className="w-16 h-16 rounded-full border-2 border-[#6DAEDB] object-cover"
                />
                <div>
                  <h1 className="text-2xl font-bold text-white">{professional.name}</h1>
                  <p className="text-gray-400">
                    {professional.specialty} • {professional.license}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-2 rounded-xl font-semibold transition-all"
              >
                {t('professional.logout')}
              </button>
            </div>
          </div>
        </section><section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="h-8 w-8 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {t('professional.dashboard.totalClients')}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-blue-400">{stats.totalClients}</p>
              </div>
              <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-sm border border-green-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {t('professional.dashboard.activeClients')}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-green-400">{stats.activeClients}</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-8 w-8 text-yellow-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {t('professional.dashboard.pendingClients')}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-yellow-400">{stats.pendingClients}</p>
              </div>
              <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-2">
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                  <h3 className="text-lg font-semibold text-white">
                    {t('professional.dashboard.totalSessions')}
                  </h3>
                </div>
                <p className="text-3xl font-bold text-purple-400">{stats.totalSessions}</p>
              </div>
            </div>
          </div>
        </section><section className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {t('professional.dashboard.manageClients')}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder={t('professional.dashboard.searchPlaceholder')}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      className="bg-black/50 border border-white/20 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value as any)}
                    className="bg-black/50 border border-white/20 rounded-xl px-4 py-2 text-white focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all"
                  >
                    <option value="all">{t('professional.dashboard.all')}</option>
                    <option value="active">{t('professional.dashboard.active')}</option>
                    <option value="inactive">{t('professional.dashboard.inactive')}</option>
                    <option value="pending">{t('professional.dashboard.pending')}</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredClients.map(client => (
                  <div
                    key={client.id}
                    draggable
                    onDragStart={e => handleDragStart(e, client.id)}
                    onDragOver={handleDragOver}
                    onDrop={e => handleDrop(e, client.id)}
                    className={`bg-black/30 border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all cursor-move ${
                      draggedClient === client.id ? 'opacity-50 scale-95' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <GripVertical className="h-5 w-5 text-gray-500" />
                        <div className="text-2xl">{client.avatar}</div>
                        <div>
                          <h3 className="font-semibold text-white">{client.name}</h3>
                          <p className="text-sm text-gray-400">{client.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {t('professional.client.status')}:
                        </span>
                        <span
                          className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(client.status)}`}
                        >
                          {client.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {t('professional.client.progress')}:
                        </span>
                        {getMoodTrendIcon(client.moodTrend)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-400">
                          {t('professional.client.sessions')}:
                        </span>
                        <span className="text-sm text-white">{client.sessionsCount}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            setShowChat(true);
                          }}
                          className="flex items-center justify-center gap-1 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white text-sm font-semibold py-2 rounded-lg transition-all"
                        >
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedClient(client);
                            startVideoCall();
                          }}
                          className="flex items-center justify-center gap-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-sm font-semibold py-2 rounded-lg transition-all"
                        >
                          <Video className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => openScheduleModal(client)}
                          className="flex items-center justify-center gap-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white text-sm font-semibold py-2 rounded-lg transition-all"
                        >
                          <CalendarPlus className="h-4 w-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => setSelectedClient(client)}
                        className="w-full border border-white/20 hover:border-white/40 text-white text-sm font-semibold py-2 rounded-lg transition-all"
                      >
                        {t('professional.client.details')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>{selectedClient && !showChat && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="text-3xl">{selectedClient.avatar}</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedClient.name}</h2>
                  <p className="text-gray-400">{selectedClient.email}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClient(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">{t('professional.client.phone')}</label>
                  <p className="text-white">{selectedClient.phone}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    {t('professional.client.joinDate')}
                  </label>
                  <p className="text-white">
                    {new Date(selectedClient.joinDate).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    {t('professional.client.lastSession')}
                  </label>
                  <p className="text-white">
                    {new Date(selectedClient.lastSession).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-400">
                    {t('professional.client.currentPlan')}
                  </label>
                  <p className="text-white">{selectedClient.currentPlan}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    {t('professional.client.sessions')}
                  </label>
                  <p className="text-white">{selectedClient.sessionsCount}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">
                    {t('professional.client.moodTrend')}
                  </label>
                  <div className="flex items-center gap-2">
                    {getMoodTrendIcon(selectedClient.moodTrend)}
                    <span className="text-white capitalize">{selectedClient.moodTrend}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="text-lg font-semibold text-white">
                  {t('professional.notes.title')}
                </label>
                <span className="text-sm text-gray-400">
                  {selectedClient.clinicalNotes.length} {t('professional.notes.count')}
                </span>
              </div><div className="bg-black/30 border border-white/10 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Plus className="h-5 w-5 text-[#6DAEDB]" />
                  <h4 className="font-medium text-white">{t('professional.notes.newNote')}</h4>
                </div>
                <div className="space-y-3">
                  <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder={t('professional.notes.placeholder')}
                    rows={3}
                    className="w-full bg-black/50 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all resize-none"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {new Date().toLocaleDateString('pt-BR')} • {professional.name}
                    </span>
                    <button
                      onClick={addNote}
                      disabled={!newNote.trim()}
                      className="flex items-center gap-2 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all"
                    >
                      <FileText className="h-4 w-4" />
                      {t('professional.notes.addNote')}
                    </button>
                  </div>
                </div>
              </div><div className="space-y-3 max-h-60 overflow-y-auto">
                {selectedClient.clinicalNotes.map(note => (
                  <div key={note.id} className="bg-black/20 border border-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-[#6DAEDB]" />
                        <span className="text-sm font-medium text-white">{note.author}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(note.date).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{note.content}</p>
                  </div>
                ))}
              </div><div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-lg font-semibold text-white">
                    {t('professional.meetings.title')}
                  </label>
                  <span className="text-sm text-gray-400">
                    {getClientMeetings(selectedClient.id).length} {t('professional.meetings.count')}
                  </span>
                </div>
                <div className="space-y-3 max-h-40 overflow-y-auto">
                  {getClientMeetings(selectedClient.id).map(meeting => (
                    <div
                      key={meeting.id}
                      className="bg-black/20 border border-white/5 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-400" />
                          <span className="text-sm font-medium text-white">
                            {new Date(meeting.date).toLocaleDateString('pt-BR')} às {meeting.time}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            meeting.status === 'scheduled'
                              ? 'bg-purple-400/20 text-purple-400'
                              : meeting.status === 'completed'
                                ? 'bg-green-400/20 text-green-400'
                                : 'bg-red-400/20 text-red-400'
                          }`}
                        >
                          {meeting.status === 'scheduled'
                            ? t('professional.meetings.scheduled')
                            : meeting.status === 'completed'
                              ? t('professional.meetings.completed')
                              : t('professional.meetings.cancelled')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">
                          {t('professional.meetings.duration', { duration: meeting.duration })}
                        </span>
                        <button
                          onClick={() => copyMeetingLink(meeting.link)}
                          className="flex items-center gap-1 text-xs text-[#6DAEDB] hover:text-[#4F91C3] transition-colors"
                        >
                          <Copy className="h-3 w-3" />
                          {t('professional.meetings.copyLink')}
                        </button>
                      </div>
                    </div>
                  ))}

                  {getClientMeetings(selectedClient.id).length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">{t('professional.meetings.noMeetings')}</p>
                    </div>
                  )}
                </div>
              </div><div className="mt-6">
                <label className="text-sm text-gray-400 mb-2 block">
                  {t('professional.notes.generalNotes')}
                </label>
                <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                  <p className="text-gray-300">{selectedClient.notes}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowChat(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white font-semibold py-3 rounded-xl transition-all"
              >
                <MessageCircle className="h-5 w-5" />
                {t('professional.client.chat')}
              </button>
              <button
                onClick={startVideoCall}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <Video className="h-5 w-5" />
                {t('professional.client.video')}
              </button>
              <button
                onClick={() => openScheduleModal(selectedClient)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                <CalendarPlus className="h-5 w-5" />
                {t('professional.meetings.schedule')}
              </button>
              <button
                onClick={() => setSelectedClient(null)}
                className="flex-1 border border-white/20 hover:border-white/40 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {t('professional.client.close')}
              </button>
            </div>
          </div>
        </div>
      )}{showChat && selectedClient && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => {
            if (e.target === e.currentTarget) {
              setShowChat(false);
            }
          }}
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{selectedClient.avatar}</div>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedClient.name}</h2>
                  <p className="text-sm text-gray-400">{t('professional.chat.title')}</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="text-lg">{selectedClient.avatar}</div>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-4 max-w-xs">
                    <p className="text-gray-300 text-sm">
                      {t('professional.chat.defaultMessage', {
                        professionalName: professional.name,
                      })}
                    </p>
                    <span className="text-xs text-gray-500 mt-1 block">10:30</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-xl p-4 max-w-xs">
                    <p className="text-white text-sm">{t('professional.chat.patientMessage')}</p>
                    <span className="text-xs text-white/70 mt-1 block">10:32</span>
                  </div>
                  <img
                    src={professional.avatar}
                    alt={professional.name}
                    className="w-8 h-8 rounded-full border border-[#6DAEDB] object-cover"
                  />
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-lg">{selectedClient.avatar}</div>
                  <div className="bg-black/30 border border-white/10 rounded-xl p-4 max-w-xs">
                    <p className="text-gray-300 text-sm">
                      Estou me sentindo melhor desde nossa última sessão. Os exercícios de
                      respiração estão ajudando muito.
                    </p>
                    <span className="text-xs text-gray-500 mt-1 block">10:35</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-white/10">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  placeholder={t('professional.chat.placeholder')}
                  className="flex-1 bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none focus:ring-2 focus:ring-[#6DAEDB]/20 transition-all"
                />
                <button
                  onClick={() => setChatMessage('')}
                  className="bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] hover:from-[#4F91C3] hover:to-[#3A7A9F] text-white p-3 rounded-xl transition-all"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}{isVideoCall && selectedClient && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={e => {
            if (e.target === e.currentTarget) {
              if (isVideoCallChatOpen) {
                setIsVideoCallChatOpen(false);
              } else {
                endCall();
              }
            }
          }}
        >
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center animate-pulse">
                  <Video className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {t('professional.videoCall.title')} {selectedClient.name}
                  </h2>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    {t('professional.videoCall.connected')}
                  </p>
                </div>
              </div>
              <button
                onClick={endCall}
                className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-xl transition-all"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gradient-to-r from-[#6DAEDB] to-[#4F91C3] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-6xl">{selectedClient.avatar}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{selectedClient.name}</h3>
                  <p className="text-gray-400">
                    {isCameraOn
                      ? t('professional.videoCall.cameraOn')
                      : t('professional.videoCall.cameraOff')}{' '}
                    •{' '}
                    {isMuted
                      ? t('professional.videoCall.microphoneMuted')
                      : t('professional.videoCall.microphoneOn')}
                  </p>
                </div>
              </div><div
                className={`absolute bottom-6 right-6 w-48 h-36 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden ${!isCameraOn ? 'opacity-50' : ''}`}
              >
                {isCameraOn && userStream ? (
                  <video
                    ref={ref => {
                      if (ref && userStream) {
                        ref.srcObject = userStream;
                        ref.play();
                      }
                    }}
                    autoPlay
                    muted
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center">
                    {!isCameraOn ? (
                      <>
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Video className="h-8 w-8 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-400 font-medium">
                          {t('professional.videoCall.cameraOff')}
                        </p>
                      </>
                    ) : (
                      <>
                        <img
                          src={professional.avatar}
                          alt={professional.name}
                          className="w-16 h-16 rounded-full border-2 border-[#6DAEDB] object-cover mx-auto mb-2"
                        />
                        <p className="text-sm text-white font-medium">{professional.name}</p>
                      </>
                    )}
                  </div>
                )}
              </div><div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={toggleCamera}
                  className={`w-12 h-12 ${isCameraOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-500 hover:bg-red-600'} text-white rounded-full flex items-center justify-center transition-all`}
                  title={
                    isCameraOn
                      ? t('professional.videoCall.turnOffCamera')
                      : t('professional.videoCall.turnOnCamera')
                  }
                >
                  <Video className="h-6 w-6" />
                </button>
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 ${isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full flex items-center justify-center transition-all`}
                  title={
                    isMuted
                      ? t('professional.videoCall.unmuteAudio')
                      : t('professional.videoCall.muteAudio')
                  }
                >
                  {isMuted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                </button>
                <button
                  onClick={toggleVideoCallChat}
                  className={`w-12 h-12 ${isVideoCallChatOpen ? 'bg-[#6DAEDB] hover:bg-[#4F91C3]' : 'bg-gray-700 hover:bg-gray-600'} text-white rounded-full flex items-center justify-center transition-all`}
                  title={
                    isVideoCallChatOpen
                      ? t('professional.videoCall.closeChat')
                      : t('professional.videoCall.openChat')
                  }
                >
                  <MessageSquare className="h-6 w-6" />
                </button>
                <button
                  onClick={endCall}
                  className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-all"
                  title={t('professional.videoCall.endCall')}
                >
                  <Phone className="h-6 w-6" />
                </button>
              </div>
            </div>{isVideoCallChatOpen && (
              <div
                className="absolute right-0 top-0 w-80 h-full bg-black/50 backdrop-blur-sm border-l border-white/10 flex flex-col"
                onClick={e => e.stopPropagation()}
              >
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                  <h3 className="font-semibold text-white">
                    {t('professional.videoCall.chatDuringSession')}
                  </h3>
                  <button
                    onClick={toggleVideoCallChat}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-sm text-gray-300">Obrigado por aceitar a videochamada!</p>
                      <span className="text-xs text-gray-500">{selectedClient.name}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-white/10">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('professional.videoCall.messagePlaceholder')}
                      className="flex-1 bg-gray-800 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:border-[#6DAEDB] focus:outline-none"
                    />
                    <button className="bg-[#6DAEDB] hover:bg-[#4F91C3] text-white p-2 rounded-lg transition-all">
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}{showScheduleModal && selectedClient && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 rounded-2xl p-8 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <CalendarPlus className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-bold text-white">
                  {t('professional.meetings.scheduleMeeting')}
                </h2>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-white font-medium">{selectedClient.name}</span>
              </div>
              <span className="text-sm text-gray-400">{selectedClient.email}</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t('professional.meetings.date')}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t('professional.meetings.time')}
                </label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={e => setSelectedTime(e.target.value)}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  {t('professional.meetings.duration')}
                </label>
                <select
                  value={meetingDuration}
                  onChange={e => setMeetingDuration(Number(e.target.value))}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400/20 transition-all"
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>1 hora</option>
                  <option value={90}>1h 30min</option>
                  <option value={120}>2 horas</option>
                </select>
              </div>
            </div>

            {generatedLink && (
              <div className="mt-6 p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Link className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-purple-400">
                    {t('professional.meetings.meetingLink')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={generatedLink}
                    readOnly
                    className="flex-1 bg-black/30 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-gray-300"
                  />
                  <button
                    onClick={() => copyMeetingLink(generatedLink)}
                    className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-lg transition-all"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={scheduleMeeting}
                disabled={!selectedDate || !selectedTime}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all"
              >
                {t('professional.meetings.scheduleMeeting')}
              </button>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setGeneratedLink('');
                  setSelectedDate('');
                  setSelectedTime('');
                }}
                className="border border-white/20 hover:border-white/40 text-white font-semibold py-3 px-6 rounded-xl transition-all"
              >
                {t('professional.meetings.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProfessionalArea;