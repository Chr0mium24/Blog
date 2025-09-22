import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async ({ params }) => {
  const { slug } = params;

  if (!slug) {
    return new Response('Slug is required', { status: 400 });
  }

  try {
    // Get the post from the collection to verify it exists
    const posts = await getCollection('posts');
    const post = posts.find(p => p.slug === slug);

    if (!post) {
      return new Response('Post not found', { status: 404 });
    }

    // Read the raw markdown file
    const filePath = path.join(process.cwd(), 'src/content/posts', `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return new Response('Markdown file not found', { status: 404 });
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    // Return the markdown file with proper headers
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slug}.md"`,
      },
    });
  } catch (error) {
    console.error('Error downloading markdown:', error);
    return new Response('Internal server error', { status: 500 });
  }
};

export async function getStaticPaths() {
  const posts = await getCollection('posts');
  return posts.map((post) => ({
    params: { slug: post.slug },
  }));
}