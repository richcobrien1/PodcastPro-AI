import Parser from 'rss-parser';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser();

const AI_NEWS_FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://www.artificialintelligence-news.com/feed/',
  'https://venturebeat.com/category/ai/feed/'
];

async function collectNews() {
  const articles = [];
  const today = new Date().toISOString().split('T')[0];
  
  for (const feedUrl of AI_NEWS_FEEDS) {
    try {
      const feed = await parser.parseURL(feedUrl);
      
      for (const item of feed.items.slice(0, 5)) {
        articles.push({
          title: item.title,
          link: item.link,
          description: item.contentSnippet || item.content || '',
          pubDate: item.pubDate,
          source: feed.title || 'AI News'
        });
      }
    } catch (error) {
      console.error(`Failed to fetch ${feedUrl}:`, error.message);
    }
  }
  
  // Save to JSON file
  const outputFile = path.join(__dirname, `ai-now-daily-${today}.json`);
  await fs.writeFile(outputFile, JSON.stringify(articles, null, 2));
  
  console.log(`✓ Collected ${articles.length} articles`);
  console.log(`✓ Saved to ${outputFile}`);
  
  return articles;
}

collectNews().catch(console.error);
