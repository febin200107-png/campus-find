const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const app = express();
app.use(cors());
app.use(express.json());
const itemSchema = new mongoose.Schema({
  type: { type: String, enum: ['Lost', 'Found'], required: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  location: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  description: { type: String, default: '' },
  contact: { type: String, required: true }
}, { timestamps: true });
const Item = mongoose.model('Item', itemSchema);
app.get('/api/items', async (req, res) => { try { res.json(await Item.find().sort({ createdAt: -1 })); } catch (error) { res.status(500).json({ message: 'Failed to fetch reports' }); } });
app.post('/api/items', async (req, res) => { try { const item = await Item.create(req.body); res.status(201).json(item); } catch (error) { res.status(400).json({ message: 'Failed to create report' }); } });
app.delete('/api/items/:id', async (req, res) => { try { if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid report ID' }); const item = await Item.findByIdAndDelete(req.params.id); if (!item) return res.status(404).json({ message: 'Report not found' }); res.json({ message: 'Report deleted successfully' }); } catch (error) { res.status(500).json({ message: 'Failed to delete report' }); } });
function normalize(value) { return String(value || '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim(); }
function tokens(value) { return new Set(normalize(value).split(/\s+/).filter(word => word.length > 1)); }
function nameSimilarity(a, b) { const left = tokens(a), right = tokens(b); if (!left.size || !right.size) return 0; const common = [...left].filter(word => right.has(word)).length; return common / (left.size + right.size - common); }
function locationSimilarity(a, b) { const left = normalize(a), right = normalize(b); if (!left || !right) return 0; if (left === right) return 1; const aTokens = tokens(left), bTokens = tokens(right); const overlap = [...aTokens].filter(word => bTokens.has(word)).length; return overlap ? overlap / (aTokens.size + bTokens.size - overlap) : 0; }
function scoreMatch(lost, found) { let score = 0; const reasons = []; if (normalize(lost.category) && normalize(lost.category) === normalize(found.category)) { score += 35; reasons.push('same category (+35)'); } const name = nameSimilarity(lost.name + ' ' + lost.description, found.name + ' ' + found.description); if (name > 0) { const points = Math.round(name * 30); score += points; reasons.push('similar item details (+' + points + ')'); } const location = locationSimilarity(lost.location, found.location); if (location > 0) { const points = Math.round(location * 20); score += points; reasons.push('nearby location (+' + points + ')'); } const lostDate = Date.parse(lost.date), foundDate = Date.parse(found.date); if (Number.isFinite(lostDate) && Number.isFinite(foundDate)) { const days = Math.abs(lostDate - foundDate) / 86400000; const points = days <= 1 ? 15 : days <= 3 ? 12 : days <= 7 ? 8 : days <= 14 ? 4 : 0; if (points) { score += points; reasons.push('close date (+' + points + ')'); } } return { score: Math.min(100, score), reasons }; }
app.get('/api/matches', async (req, res) => { try { const items = await Item.find({ type: { $in: ['Lost', 'Found'] } }).sort({ createdAt: -1 }).lean(); const lost = items.filter(item => item.type === 'Lost'); const found = items.filter(item => item.type === 'Found'); const matches = []; for (const l of lost) for (const f of found) { const result = scoreMatch(l, f); if (result.score >= 30) matches.push({ lost: l, found: f, ...result }); } matches.sort((a, b) => b.score - a.score); res.json(matches); } catch (error) { res.status(500).json({ message: 'Failed to find matches' }); } });
const PORT = 5000;
mongoose.connect(process.env.MONGO_URI).then(() => { console.log('MongoDB connected successfully'); app.listen(PORT, () => console.log('CampusFind API running on port ' + PORT)); }).catch(error => console.error('MongoDB connection failed:', error.message));
