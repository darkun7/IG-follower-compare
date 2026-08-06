import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { IncomingMessage } from 'node:http';


async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf-8');
}


interface ParsedPart {
  name: string;
  filename?: string;
  content: string | Buffer;
  contentType?: string;
}


function parseMultipart(formText: string, boundary: string): ParsedPart[] {
  const parts: ParsedPart[] = [];
  const delimiter = `\n--${boundary}`;
  const partsArr = formText.split(delimiter);

  for (const item of partsArr) {
    const trimmed = item.trimEnd();
    if (!trimmed || trimmed === '--') continue;

    const headerEnd = trimmed.indexOf('\r\n\r\n');
    if (headerEnd === -1) continue;

    const headerSection = trimmed.substring(0, headerEnd);
    const rawContent = trimmed.substring(headerEnd + 4).replace(/\r$/, '');

    const lines = headerSection.split('\r\n');
    const contentDisposition = lines.find(l => l.toLowerCase().startsWith('content-disposition:'));
    const contentTypeLine = lines.find(l => l.toLowerCase().startsWith('content-type:'));

    const nameMatch = contentDisposition?.match(/name="([^"]+)"/);
    const filenameMatch = contentDisposition?.match(/filename="([^"]+)"/);

    if (!nameMatch) continue;

    const content: string | Buffer = filenameMatch ? Buffer.from(rawContent, 'base64') : rawContent;

    parts.push({
      name: nameMatch[1],
      filename: filenameMatch?.[1],
      content,
      contentType: contentTypeLine?.split(':').slice(1).join(':').trim(),
    });
  }

  return parts;
}


// ========== Instagram Data Parse & Compare Logic ==========

function _parseCSVAsMap(content: string): Map<string, string> {
  const map = new Map<string, string>();
  const cleaned = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  const rows = cleaned.split('\n');
  if (rows.length < 2) return map;

  const headers = rows[0].split(',').map(h => h.trim());

  for (let i = 1; i < rows.length; i++) {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let j = 0; j < rows[i].length; j++) {
      const ch = rows[i][j];
      if (ch === '"') inQuotes = !inQuotes;
      else if (ch === ',' && !inQuotes) { values.push(current); current = ''; }
      else current += ch;
    }
    values.push(current);

    for (let k = 0; k < Math.min(headers.length, values.length); k++) {
      map.set(`${i}-${headers[k]}`, values[k].trim());
    }
  }
  return map;
}


function getRowValue(map: Map<string, string>, rowIndex: number, key: string): string {
  return map.get(`${rowIndex}-${key}`) || '';
}


function extractUsernamesFromCSV(content: string): Set<string> {
  const map = _parseCSVAsMap(content);
  const usernames = new Set<string>();

  for (const [k, v] of map) {
    if (k.endsWith('-Username') || k.endsWith('-username')) {
      const val = v.toLowerCase().trim();
      if (val && val !== 'username') {
        usernames.add(val);
      }
    }
  }
  return usernames;
}


function extractUsernamesFromHTML(content: string): Set<string> {
  const usernames = new Set<string>();
  const reserved = new Set([
    'accounts', 'reel', 'p', 'explore', 'login', 'about', 'help',
    'developer', 'privacy', 'terms', 'discover', 'directory', 'tags',
    'stories', 'direct', 'settings', 'www', 'r', 'share', 'create',
  ]);
  const pattern = /instagram\.com\/([A-Za-z0-9._]{1,30})(?:\/)?[^\w]/g;
  for (const m of content.matchAll(pattern)) {
    let user = m[1].trim().toLowerCase().replace(/\.$/, '');
    if (user && !reserved.has(user) && !user.endsWith('.com')) {
      usernames.add(user);
    }
  }
  return usernames;
}


export function instagramParse(content: string, _fileType: string = 'auto'): Set<string> {
  // Strip BOM
  content = content.replace(/^\uFEFF/, '').trim();
  if (!content) return new Set();

  // Standard Instagram JSON export (followers_1.json / following.json)
  if (content.startsWith('{') || content.startsWith('[')) {
    try {
      const data = JSON.parse(content);
      const usernames = new Set<string>();

      const walk = (obj: unknown): void => {
        if (Array.isArray(obj)) {
          for (const item of obj) walk(item);
          return;
        }
        if (obj && typeof obj === 'object') {
          const record = obj as Record<string, unknown>;
          // Standard Instagram format: {"string_list_data": [{"value": "user"}]}
          if (Array.isArray(record.string_list_data)) {
            for (const item of record.string_list_data as Array<Record<string, unknown>>) {
              let value = String(item.value ?? '').trim().toLowerCase();
              // No "value" field — extract from href like instagram.com/_u/username
              if (!value && item.href) {
                const href = String(item.href);
                const m = href.match(/instagram\.com\/(?:_u\/)?([A-Za-z0-9._]{1,30})\/?$/);
                if (m) value = m[1].toLowerCase();
              }
              if (value) usernames.add(value);
            }
          }
          // Alternative: {"username": "user"}
          else if (record.username) {
            const val = String(record.username).trim().toLowerCase();
            if (val) usernames.add(val);
          }
          // Alternative: {"value": "user"} (top-level without string_list_data)
          else if (record.value && !record.string_list_data) {
            const val = String(record.value).trim().toLowerCase();
            if (val) usernames.add(val);
          }
          // Fallback: look for "href" containing instagram.com/user
          else if (record.href) {
            const href = String(record.href);
            const m = href.match(/instagram\.com\/([A-Za-z0-9._]{1,30})\/?$/);
            if (m) usernames.add(m[1].toLowerCase());
          }
          else {
            for (const v of Object.values(record)) walk(v);
          }
        }
      };

      walk(data);
      if (usernames.size > 0) return usernames;
    } catch {
      // not valid JSON, fall through
    }
  }

  // Try standard username extraction first
  const usernames = extractUsernamesFromCSV(content);
  if (usernames.size > 0) return usernames;

  // HTML export: extract usernames from instagram.com profile links
  const htmlUsernames = extractUsernamesFromHTML(content);
  if (htmlUsernames.size > 0) return htmlUsernames;

  return usernames;
}


export function compareLists(data: {
  followers: string;
  following: string;
  followerFileType?: string;
  followingFileType?: string;
}): Record<string, Array<{ username: string; profile_url: string }>> {
  const followers = instagramParse(data.followers, data.followerFileType);
  const following = instagramParse(data.following, data.followingFileType);

  const mutuals = [...followers].filter(u => following.has(u)).sort();
  const notFolback = [...following].filter(u => !followers.has(u)).sort();
  const onlyFollowers = [...followers].filter(u => !following.has(u)).sort();
  const onlyFollowing = [...following].filter(u => !followers.has(u)).sort();

  const makeList = (items: string[]) =>
    items.map(u => ({ username: u, profile_url: `https://instagram.com/${u}` }));

  return {
    mutuals: makeList(mutuals),
    notFolback: makeList(notFolback),
    onlyFollowers: makeList(onlyFollowers),
    onlyFollowing: makeList(onlyFollowing),
  };
}


// ========== HTTP Handlers ==========

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  try {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const pathname = url.pathname.replace(/\/+$/, '') || '/';

    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).end();
    }

    if (pathname === '/health' || pathname === '/health/') {
      return res.json({ status: 'ok' });
    }

    // Text-based comparison endpoint
    if (pathname === '/api/compare' || pathname === '/api/compare/') {
      const body = await readBody(req);
      let parsed: {
        followers_content: string;
        following_content: string;
        followerFileType?: string;
        followingFileType?: string;
      };
      try {
        parsed = JSON.parse(body);
      } catch {
        return res.status(400).json({ error: 'Invalid JSON body' });
      }

      if (!parsed.followers_content || !parsed.following_content) {
        return res.status(400).json({ error: 'Both followers and following content required' });
      }

      const result = compareLists({
        followers: parsed.followers_content,
        following: parsed.following_content,
        followerFileType: parsed.followerFileType,
        followingFileType: parsed.followingFileType,
      });

      return res.status(200).json(result);
    }

    // File upload comparison endpoint
    if (pathname === '/api/compare-files' || pathname === '/api/compare-files/') {
      const contentType = req.headers['content-type'] || '';
      if (!contentType.includes('multipart/form-data')) {
        return res.status(400).json({ error: 'Expected multipart/form-data' });
      }

      const rawBody = await readBody(req);
      const boundaryMatch = /boundary=(?:"([^"]+)"|(.+?))$/.exec(contentType);
      if (!boundaryMatch) {
        return res.status(400).json({ error: 'Could not parse boundary' });
      }

      const boundary = boundaryMatch[1] || boundaryMatch[2]!;
      const parts = parseMultipart(rawBody, boundary);

      const byName = new Map<string, ParsedPart>();
      for (const p of parts) byName.set(p.name, p);

      const followers = byName.get('followers')?.content;
      const following = byName.get('following')?.content;
      const followerFileType = byName.get('followerFileType')?.content || 'auto';
      const followingFileType = byName.get('followingFileType')?.content || 'auto';

      if (!followers || !following) {
        return res.status(400).json({ error: 'Both followers and following files required' });
      }

      const result = compareLists({
        followers: typeof followers === 'string' ? followers : followers.toString('utf-8'),
        following: typeof following === 'string' ? following : following.toString('utf-8'),
        followerFileType: String(followerFileType),
        followingFileType: String(followingFileType),
      });

      return res.status(200).json(result);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
