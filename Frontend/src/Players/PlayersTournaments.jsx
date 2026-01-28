import React, { useState } from 'react';
import PlayerSidebar from './PlayerSidebar';
import {
  Trophy,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Filter,
  ChevronRight,
  Medal,
  Target,
  Award
} from 'lucide-react';

const TournamentsPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('browse');
  const [filterStatus, setFilterStatus] = useState('All Tournaments');

  const stats = [
    {
      id: 1,
      title: 'Tournaments Won',
      value: '3',
      icon: <Trophy className="w-6 h-6" />,
      color: 'emerald'
    },
    {
      id: 2,
      title: 'Total Participated',
      value: '12',
      icon: <Medal className="w-6 h-6" />,
      color: 'amber'
    },
    {
      id: 3,
      title: 'Active Registrations',
      value: '2',
      icon: <Target className="w-6 h-6" />,
      color: 'blue'
    },
    {
      id: 4,
      title: 'Regional Rank',
      value: '#3',
      icon: <Award className="w-6 h-6" />,
      color: 'red'
    }
  ];

  const tournaments = [
    {
      id: 1,
      name: 'Winter Futsal Championship 2024',
      description: 'The biggest futsal tournament of the winter season featuring top teams from across the valley.',
      date: 'Dec 28, 2024',
      location: 'Arena Sports Complex',
      teams: '12/16 Teams',
      prize: 'NPR 100,000',
      entryFee: 'NPR 5,000',
      status: 'Registered',
      registrationProgress: 75,
      currentRegistrations: '12/16'
    },
    {
      id: 2,
      name: 'Corporate League Season 3',
      description: 'A league format tournament for corporate teams. Round-robin matches followed by playoffs.',
      date: 'Jan 15, 2025',
      location: 'Green Field Arena',
      teams: '8/12 Teams',
      prize: 'NPR 75,000',
      entryFee: 'NPR 8,000',
      status: 'Upcoming',
      registrationProgress: null
    },
    {
      id: 3,
      name: 'Weekend Warriors Cup',
      description: 'A fast-paced weekend tournament for amateur teams.',
      date: 'Dec 23, 2024',
      location: 'Sports Hub Kathmandu',
      teams: '16/16 Teams',
      prize: 'NPR 50,000',
      entryFee: 'NPR 3,000',
      status: 'Live',
      registrationProgress: null
    },
    {
      id: 4,
      name: 'Champions Trophy 2024',
      description: 'The premier annual championship for elite futsal teams.',
      date: 'Nov 15, 2024',
      location: 'National Sports Arena',
      teams: '24/24 Teams',
      prize: 'NPR 150,000',
      entryFee: 'NPR 10,000',
      status: 'Completed',
      registrationProgress: null
    },
    {
      id: 5,
      name: 'Spring Knockout Tournament',
      description: 'Single elimination format with exciting knockout rounds.',
      date: 'Mar 10, 2025',
      location: 'Valley Sports Center',
      teams: '0/16 Teams',
      prize: 'NPR 60,000',
      entryFee: 'NPR 4,500',
      status: 'Upcoming',
      registrationProgress: null
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Registered':
        return 'bg-emerald-100 text-emerald-700';
      case 'Upcoming':
        return 'bg-amber-100 text-amber-700';
      case 'Live':
        return 'bg-red-100 text-red-700';
      case 'Completed':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getActionButton = (status, tournamentId) => {
    switch (status) {
      case 'Registered':
        return (
          <button className="bg-white border-2 border-emerald-500 text-emerald-600 font-medium py-2 px-6 rounded-xl hover:bg-emerald-50 transition-all flex items-center gap-2">
            View Details
            <ChevronRight className="w-4 h-4" />
          </button>
        );
      case 'Upcoming':
        return (
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-6 rounded-xl transition-all flex items-center gap-2">
            Register
            <ChevronRight className="w-4 h-4" />
          </button>
        );
      case 'Live':
        return (
          <button className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-xl transition-all flex items-center gap-2 animate-pulse">
            Watch Live
            <ChevronRight className="w-4 h-4" />
          </button>
        );
      case 'Completed':
        return (
          <button className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-6 rounded-xl transition-all flex items-center gap-2">
            View Results
            <ChevronRight className="w-4 h-4" />
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      
      <PlayerSidebar onCollapseChange={setIsSidebarCollapsed} />

      {/* Main Content */}
      <div 
        className={`flex-1 p-8 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
        style={{ width: `calc(100% - ${isSidebarCollapsed ? '5rem' : '16rem'})` }}
      >
      
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Tournaments</h1>
            <p className="text-gray-600">Browse events and track your matches</p>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="appearance-none bg-white border border-gray-200 rounded-xl px-6 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer"
            >
              <option>All Tournaments</option>
              <option>Registered</option>
              <option>Upcoming</option>
              <option>Live</option>
              <option>Completed</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'emerald'
                      ? 'bg-emerald-100 text-emerald-600'
                      : stat.color === 'amber'
                      ? 'bg-amber-100 text-amber-600'
                      : stat.color === 'blue'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {stat.icon}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'browse'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Browse Tournaments
          </button>
          <button
            onClick={() => setActiveTab('matches')}
            className={`px-6 py-3 font-medium transition-all ${
              activeTab === 'matches'
                ? 'text-emerald-600 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            My Matches
          </button>
        </div>

        {/* Tournaments List */}
        {activeTab === 'browse' && (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Left Border Accent */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    tournament.status === 'Registered'
                      ? 'bg-emerald-500'
                      : tournament.status === 'Upcoming'
                      ? 'bg-amber-500'
                      : tournament.status === 'Live'
                      ? 'bg-red-500'
                      : 'bg-gray-400'
                  }`}
                />

                <div className="flex items-start justify-between">
                  {/* Left Section */}
                  <div className="flex-1 pl-4">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">
                        {tournament.name}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          tournament.status
                        )}`}
                      >
                        {tournament.status}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-4">{tournament.description}</p>

                    <div className="flex items-center gap-8 text-sm text-gray-600 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-emerald-600" />
                        <span className="font-medium">{tournament.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>{tournament.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span>{tournament.teams}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span className="font-semibold text-amber-600">
                          {tournament.prize}
                        </span>
                      </div>
                    </div>

                    {/* Registration Progress */}
                    {tournament.registrationProgress !== null && (
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">
                            Registration Progress
                          </span>
                          <span className="text-sm font-medium text-emerald-600">
                            {tournament.currentRegistrations}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all"
                            style={{ width: `${tournament.registrationProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end gap-4 ml-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-1">Entry Fee</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {tournament.entryFee}
                      </p>
                    </div>
                    {getActionButton(tournament.status, tournament.id)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* My Matches Tab */}
        {activeTab === 'matches' && (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              No Matches Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Register for a tournament to see your match schedule here
            </p>
            <button
              onClick={() => setActiveTab('browse')}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-6 rounded-xl transition-all inline-flex items-center gap-2"
            >
              Browse Tournaments
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Info Banner */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold mb-2">
                Ready to Compete?
              </h3>
              <p className="text-emerald-100">
                Join tournaments and showcase your skills on the field
              </p>
            </div>
            <button className="bg-white text-emerald-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-xl transition-all">
              View All Tournaments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentsPage;