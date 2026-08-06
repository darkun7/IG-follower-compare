import axios from 'axios';
import { API_BASE } from './env';

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 60_000,
});

interface CompareResult {
  mutuals: Array<{ username: string; profile_url: string }>;
  notFolback: Array<{ username: string; profile_url: string }>;
  onlyFollowers: Array<{ username: string; profile_url: string }>;
  onlyFollowing: Array<{ username: string; profile_url: string }>;
}

async function compareFiles(
  followersBlob: Blob,
  followingBlob: Blob,
): Promise<CompareResult> {
  const form = new FormData();
  form.set('followers', followersBlob, 'followers.csv');
  form.set('following', followingBlob, 'following.csv');
  form.set('followerFileType', 'auto');
  form.set('followingFileType', 'auto');

  const { data } = await apiClient.post('/api/compare-files', form);
  return data as CompareResult;
}

async function compareText(
  followersBlob: Blob,
  followingBlob: Blob,
): Promise<CompareResult> {
  const followersText = await followersBlob.text().catch(() => '');
  const followingText = await followingBlob.text().catch(() => '');

  const form = new FormData();
  form.set('followers_content', followersText);
  form.set('following_content', followingText);
  form.set('followerFileType', 'auto');
  form.set('followingFileType', 'auto');

  const { data } = await apiClient.post('/api/compare', form);
  return data as CompareResult;
}

export { compareFiles, compareText };
