const { promises: fs } = require('fs');
const path = require('path');
const RSS = require('rss');
const matter = require('gray-matter');

async function generate() {
  const feed = new RSS({
    title: 'Joe Lee',
    site_url: 'https://shyun.dev',
    feed_url: 'https://shyun.dev/feed.xml'
  });

  const posts = await fs.readdir(path.join(__dirname, '..', 'pages', 'posts'));
  const allPosts = [];
  await Promise.all(
    posts.map(async (name) => {
      if (name.startsWith('index.')) return;

      const content = await fs.readFile(
        path.join(__dirname, '..', 'pages', 'posts', name)
      );
      const frontmatter = matter(content);

      allPosts.push({
        title: frontmatter.data.title,
        url: '/posts/' + name.replace(/\.mdx?/, ''),
        date: frontmatter.data.date,
        description: frontmatter.data.description,
        author: frontmatter.data.author
      });
    })
  );

  allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
  allPosts.forEach((post) => {
    feed.item(post);
  });
  await fs.writeFile('./public/feed.xml', feed.xml({ indent: true }));
}

generate();
