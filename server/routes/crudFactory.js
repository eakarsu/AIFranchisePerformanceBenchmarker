const express = require('express');
const auth = require('../middleware/auth');

function createCrudRouter(Model, aiFunction) {
  const router = express.Router();

  // Get all
  router.get('/', auth, async (req, res) => {
    try {
      const items = await Model.findAll({ order: [['id', 'ASC']] });
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // AI endpoints (must be before /:id to avoid route conflicts)
  if (aiFunction) {
    router.post('/ai-analyze-all', auth, async (req, res) => {
      try {
        const items = await Model.findAll();
        const result = await aiFunction(items.map(i => i.toJSON()));
        res.json({ analysis: result });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });

    router.post('/:id/ai-analyze', auth, async (req, res) => {
      try {
        const item = await Model.findByPk(req.params.id);
        if (!item) return res.status(404).json({ error: 'Not found' });
        const result = await aiFunction(item.toJSON());
        res.json({ analysis: result });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
  }

  // Get by ID
  router.get('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Create
  router.post('/', auth, async (req, res) => {
    try {
      const item = await Model.create(req.body);
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Update
  router.put('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.update(req.body);
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Delete
  router.delete('/:id', auth, async (req, res) => {
    try {
      const item = await Model.findByPk(req.params.id);
      if (!item) return res.status(404).json({ error: 'Not found' });
      await item.destroy();
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
}

module.exports = createCrudRouter;
