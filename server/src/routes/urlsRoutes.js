const { getAllUrls, getUrlByShortenUrlKey, createShortenedUrl } = require('../services/urlsService');

function urlsRoutes(app) {
  app.get('/api/urls', async (req, res) => {
    try {
      const urls = await getAllUrls();
      res.status(200).json(urls);
    } catch (error) {
      res.status(500).send('Failed to retrieve the list of URLs');
    }
  });

  app.get('/:shortenUrlKey', async (req, res) => {
    try {
      const { shortenUrlKey } = req.params;
      const originalUrl = await getUrlByShortenUrlKey(shortenUrlKey);
      if (originalUrl) {
        res.redirect(302, originalUrl);  // Redirect to original URL
      } else {
        res.status(404).send('Short URL not found');
      }
    } catch (error) {
      res.status(500).send('Failed to redirect');
    }
  });

  app.get('/api/urls/:shortenUrlKey', async (req, res) => {
    try {
      const { shortenUrlKey } = req.params;
      const originalUrl = await getUrlByShortenUrlKey(shortenUrlKey);
      res.status(200).send(originalUrl);
    } catch (error) {
      const status = error.message === 'Short URL not found' ? 404 : 500;
      res.status(status).send(error.message);
    }
  });

  app.post('/api/shorten', async (req, res) => {
    try {
      const { originalUrl } = req.body;
      const { alias } = req.query;
      const shortenUrlKey = await createShortenedUrl(originalUrl, alias);
      res.status(201).send(shortenUrlKey);
    } catch (error) {
      const status = error.message === 'Invalid URL' ? 400 :
        error.message === 'Custom alias already taken' ? 409 : 500;
      res.status(status).send(error.message);
    }
  });
}

module.exports = urlsRoutes;