/**
 * One-time demo tournament seed for viva / supervisor showcase.
 * Run from backend folder: npm run seed:demo
 *
 * Idempotent: skips if "Summer Cup 2026 — Demo" already exists.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/UserModel');
const Venue = require('../models/VenueModel');
const Team = require('../models/TeamModel');
const Tournament = require('../models/TournamentModel');
const TournamentTeam = require('../models/TournamentTeamModel');
const TournamentMatch = require('../models/TournamentMatchModel');

const DEMO_TOURNAMENT_NAME = 'Summer Cup 2026 — Demo';
const OWNER_EMAIL = 'ayushneupane2022@gmail.com';
const ENTRY_FEE = 1500;

const TEAM_NAMES = [
  'FC Kathmandu',
  'Pokhara Strikers',
  'Lalitpur Lions',
  'Bhaktapur Bulls',
  'Chitwan Challengers',
  'Biratnagar Blazers',
  'Dharan Dynamos',
  'Butwal Warriors',
  'Hetauda Hawks',
  'Nepalgunj Nomads',
  'Janakpur Jets',
  'Itahari Invaders',
  'Tansen Tigers',
  'Damak Dragons',
  'Gorkha Gunners',
  'Mustang Mariners',
];

const MEMBER_POSITIONS = ['Goalkeeper', 'Defender', 'Midfielder', 'Forward'];

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(12, 0, 0, 0);
  return d;
}

function addDaysAt(base, days, hour, minute = 0) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function connectDb() {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is missing in backend/.env');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected for demo seed');
}

async function ensureDemoMemberPool() {
  const pool = [];
  for (let i = 1; i <= 4; i++) {
    const email = `demo-member-${i}@playpal.seed`;
    let user = await User.findOne({ email });
    if (!user) {
      const hash = await bcrypt.hash('DemoSeed@1', 10);
      user = await User.create({
        name: `Demo Member ${i}`,
        email,
        password: hash,
        role: 'player',
        isVerified: true,
        status: 'active',
      });
    }
    pool.push(user._id);
  }
  return pool;
}

async function ensureDemoLeader(index) {
  const email = `demo-leader-${index + 1}@playpal.seed`;
  let user = await User.findOne({ email });
  if (!user) {
    const hash = await bcrypt.hash('DemoSeed@1', 10);
    user = await User.create({
      name: `Demo Captain ${index + 1}`,
      email,
      password: hash,
      role: 'player',
      isVerified: true,
      status: 'active',
    });
  }
  return user._id;
}

async function createDemoTeams(memberPool) {
  const teams = [];
  for (let i = 0; i < TEAM_NAMES.length; i++) {
    const leaderId = await ensureDemoLeader(i);
    const players = memberPool.map((userId, j) => ({
      user: userId,
      role: 'member',
      position: MEMBER_POSITIONS[j % MEMBER_POSITIONS.length],
    }));

    const team = await Team.create({
      name: TEAM_NAMES[i],
      leader: leaderId,
      players,
      skillLevel: 'Intermediate',
      maxPlayers: 10,
      matchFormat: '5v5',
      isPublic: false,
      allowAutoFill: false,
      description: 'Demo squad for Summer Cup 2026 showcase',
      status: 'ready',
    });
    teams.push(team);
  }
  return teams;
}

function buildKnockoutMatches(tournamentId, venueId, startDate, tournamentTeams) {
  const tt = tournamentTeams.map((row) => row._id);
  const matches = [];
  let matchDayOffset = 0;

  const pushMatch = (round, stage, teamA, teamB, status, winner, scoreA, scoreB) => {
    matches.push({
      tournament: tournamentId,
      venue: venueId,
      round,
      stage,
      teamA,
      teamB,
      matchDate: addDaysAt(startDate, matchDayOffset, 16 + (matches.length % 3) * 2),
      timeSlot: { startTime: '16:00', endTime: '17:00' },
      status,
      score: { teamAGoals: scoreA, teamBGoals: scoreB },
      winner: winner || undefined,
    });
  };

  // Round of 16 — teamA wins each pair for predictable bracket
  const r1Winners = [];
  for (let i = 0; i < 16; i += 2) {
    const a = tt[i];
    const b = tt[i + 1];
    pushMatch('Round of 16', 'knockout', a, b, 'completed', a, 3, 1);
    r1Winners.push(a);
    matchDayOffset += 1;
  }

  // Quarter-finals
  const r2Winners = [];
  for (let i = 0; i < 8; i += 2) {
    const a = r1Winners[i];
    const b = r1Winners[i + 1];
    pushMatch('Quarter-final', 'knockout', a, b, 'completed', a, 2, 0);
    r2Winners.push(a);
    matchDayOffset += 1;
  }

  // Semi-finals
  const semiWinners = [];
  for (let i = 0; i < 4; i += 2) {
    const a = r2Winners[i];
    const b = r2Winners[i + 1];
    pushMatch('Semi-final', 'knockout', a, b, 'completed', a, 2, 1);
    semiWinners.push(a);
    matchDayOffset += 1;
  }

  // Final — scheduled (live-looking)
  pushMatch('Final', 'knockout', semiWinners[0], semiWinners[1], 'scheduled', null, 0, 0);

  return matches;
}

async function seedDemoTournament() {
  const existing = await Tournament.findOne({ name: DEMO_TOURNAMENT_NAME });
  if (existing) {
    console.log(`"${DEMO_TOURNAMENT_NAME}" already exists (_id: ${existing._id}). Skipping seed.`);
    return;
  }

  const owner = await User.findOne({ email: OWNER_EMAIL.toLowerCase().trim() });
  if (!owner) {
    throw new Error(`Owner not found: ${OWNER_EMAIL}. Log in once or create this account first.`);
  }

  const venue = await Venue.findOne({ owner: owner._id }).sort({ createdAt: 1 });
  if (!venue) {
    throw new Error(
      `No venue found for ${OWNER_EMAIL}. Create a venue in the app before running the demo seed.`
    );
  }

  const now = new Date();
  const registrationDeadline = addDays(now, -1);
  const startDate = addDays(now, 14);
  const endDate = addDays(now, 28);

  console.log('Creating demo teams and users…');
  const memberPool = await ensureDemoMemberPool();
  const teams = await createDemoTeams(memberPool);

  console.log('Creating tournament…');
  const tournament = await Tournament.create({
    owner: owner._id,
    venue: venue._id,
    name: DEMO_TOURNAMENT_NAME,
    description:
      'Showcase knockout tournament with 16 paid teams and a live final — seeded for demo and viva presentation.',
    location: venue.fullAddress || venue.venueName || '',
    format: 'knockout',
    startDate,
    endDate,
    registrationDeadline,
    maxTeams: 16,
    minPlayersPerTeam: 5,
    entryFeePerTeam: ENTRY_FEE,
    paymentMethods: ['cash', 'online'],
    status: 'in_progress',
    isDemoProtected: true,
    prizes: [
      { title: 'Champion', type: 'winner', enabled: true, amount: 25000 },
      { title: 'Runner-up', type: 'runner_up', enabled: true, amount: 12000 },
      { title: 'Best Player', type: 'best_player', enabled: true, amount: 5000 },
    ],
    totalPrizePool: 42000,
    stats: {
      registeredTeams: 16,
      totalRevenue: 16 * ENTRY_FEE,
    },
  });

  console.log('Registering 16 teams…');
  const tournamentTeams = [];
  for (const team of teams) {
    const row = await TournamentTeam.create({
      tournament: tournament._id,
      team: team._id,
      leader: team.leader,
      paymentStatus: 'paid',
      paymentMethod: 'online',
      isApproved: true,
    });
    tournamentTeams.push(row);
  }

  console.log('Generating knockout bracket (15 matches)…');
  const matchDocs = buildKnockoutMatches(
    tournament._id,
    venue._id,
    startDate,
    tournamentTeams
  );
  const createdMatches = await TournamentMatch.insertMany(matchDocs);

  const completed = createdMatches.filter((m) => m.status === 'completed').length;
  const scheduled = createdMatches.filter((m) => m.status === 'scheduled').length;

  console.log('\n✅ Demo tournament seeded successfully');
  console.log(`   Tournament ID: ${tournament._id}`);
  console.log(`   Owner: ${owner.email}`);
  console.log(`   Venue: ${venue.venueName}`);
  console.log(`   Teams: ${tournamentTeams.length}`);
  console.log(`   Matches: ${createdMatches.length} (${completed} completed, ${scheduled} scheduled final)`);
  console.log(`   Status: ${tournament.status} | Protected: ${tournament.isDemoProtected}`);
  console.log('\n   Log in as the futsal owner and open My Tournaments → bracket / fixtures.\n');
}

async function main() {
  try {
    await connectDb();
    await seedDemoTournament();
  } catch (err) {
    console.error('Demo seed failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main();
