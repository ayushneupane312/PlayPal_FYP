const Endorsement = require('../models/EndorsementModel');

// POST /api/endorsements/upsert
const upsertEndorsement = async (req, res) => {
  try {
    const endorsedBy = req.userId;
    const { playerId, rating, skills, comment } = req.body;

    if (!playerId || !rating) {
      return res.status(400).json({ message: 'playerId and rating are required' });
    }

    if (endorsedBy === playerId) {
      return res.status(400).json({ message: 'You cannot endorse yourself' });
    }

    const endorsement = await Endorsement.findOneAndUpdate(
      { player: playerId, endorsedBy },
      { rating, skills: skills || [], comment: comment || '', updatedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ endorsement });
  } catch (err) {
    console.error('upsertEndorsement error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/endorsements/me/:playerId
const getMyEndorsement = async (req, res) => {
  try {
    const endorsedBy = req.userId;
    const { playerId } = req.params;

    const endorsement = await Endorsement.findOne({ player: playerId, endorsedBy });
    if (!endorsement) return res.json(null);

    res.json({
      rating: endorsement.rating,
      skills: endorsement.skills,
      comment: endorsement.comment,
      updatedAt: endorsement.updatedAt
    });
  } catch (err) {
    console.error('getMyEndorsement error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/endorsements/summary/:playerId
const getRatingSummary = async (req, res) => {
  try {
    const { playerId } = req.params;

    const endorsements = await Endorsement.find({ player: playerId });

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    endorsements.forEach(e => {
      if (distribution[e.rating] !== undefined) distribution[e.rating]++;
    });

    const endorsementsCount = endorsements.length;
    const sum = endorsements.reduce((acc, e) => acc + e.rating, 0);
    const overallRating = endorsementsCount
      ? Math.round((sum / endorsementsCount) * 10) / 10
      : 0;

    res.json({ overallRating, endorsementsCount, distribution });
  } catch (err) {
    console.error('getRatingSummary error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { upsertEndorsement, getMyEndorsement, getRatingSummary };
