import { documents, CombinePath } from '#database/documents.ts';
import { type LeafDetails } from './leaf';

import remarkHtml from 'remark-html';
import remarkParse from 'remark-parse';
import { unified } from 'unified'

export async function GetLeafMetadata(id: string): Promise<LeafDetails | undefined> {
  const location = documents.locate(id, 'leaves');
  if (!location)
    return undefined;
  const content = await documents.getJSON<LeafDetails>(CombinePath(location, 'metadata'))
  if (content)
    return content;
  return undefined;
}

export async function SetLeafMetadata(id: string, metadata: LeafDetails) {
  const location = CombinePath(metadata.path, id);
  const detected_location = documents.locate(id, 'leaves');
  if (detected_location && detected_location != location) {
    // if there exists a detected location and its NOT the specified:
    // remove the original metadata, we'll save this in the new location
    await documents.del(CombinePath(detected_location, 'metadata'));
    // delete the original render so documents can clean up the file tree
    await documents.del(CombinePath(detected_location, 'rendered'));
    // also move the source (we can assume it exists since it's indexed)
    await documents.mov(CombinePath(detected_location, 'source'), CombinePath(location, 'source'));
    // overwrite the index to the new location
    documents.index(id, location, 'leaves');
    // rerender in the new location
    ForceLeafRerender(id, location);
  }
  await documents.set(CombinePath(location, 'metadata'), JSON.stringify(metadata));
  // if there was no previous location this is a new leaf so index it
  if (!detected_location)
    documents.index(id, location, 'leaves');
}

export async function GetLeafSourceString(id: string): Promise<string | undefined> {
  const location = documents.locate(id, 'leaves');
  if (!location)
    return undefined;
  const content = await documents.get(CombinePath(location, 'source'))
  if (content)
    return content;
  return undefined;
}

export async function SetLeafSourceString(id: string, content: string) {
  const location = documents.locate(id, 'leaves');
  if (!location)
    throw new Error(`no leaf indexed for '${id}'!`);
  await documents.set(CombinePath(location, 'source'), content);
  await ForceLeafRerender(id);
}

export async function GetRenderedLeafString(id: string): Promise<string | undefined> {
  const location = documents.locate(id, 'leaves');
  if (!location)
    return undefined;
  const content = await documents.get(CombinePath(location, 'rendered'))
  if (content)
    return content;

  // if not rendered version is available attempt to rebuild it
  // (we can assume there is a source since its indexed)
  console.warn(`[WARN] no cached render found for '${id}' (at: ${location})! attempting render...`)
  try {
    return await ForceLeafRerender(id);
  } catch (error) {
    console.error(error);
  }
  return undefined;
}

export async function ForceLeafRerender(id: string, location_override?: string): Promise<string> {
  const location = location_override ?? documents.locate(id, 'leaves');
  if (!location)
    throw new Error(`no leaf indexed for '${id}'!`);
  const check_source = await documents.get(CombinePath(location, 'source'))
  if (check_source) {
    try {
      let rendered = await unified()
        .use(remarkParse)
        .use(remarkHtml)
        .process(check_source);
      // promise resolution actually doesnt really matter here tbh
      documents.set(CombinePath(location, 'rendered'), rendered.toString());
      return rendered.toString();
    } catch (error) {
      console.error(error);
    }
  }
  throw new Error(`no source found for leaf '${id}' (at: ${location}), assumed broken!`);
}
