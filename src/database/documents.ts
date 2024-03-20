import * as fs from 'node:fs/promises';
import * as fssync from 'node:fs';

type Result<T> = T | undefined;

export interface Options {
  name?: string;
  location?: string;
}

interface DocMetaIndex {
  name: string;
  index: any;
}

interface DocMeta {
  indicies: Array<DocMetaIndex>;
}

class NamedIndex {
  readonly name: string;
  readonly index: Map<string, string>;
  get isEmpty(): boolean {
    return this.index.size == 0;
  }
  constructor(name: string, map?: Map<string, string>) {
    this.name = name;
    if (map)
      this.index = map;
    else
      this.index = new Map();
  }
  set(key: string, value: string) {
    this.index.set(key, value);
  }
  has(key: string): boolean {
    if (this.index.get(key))
      return true;
    return false;
  }
  get(key: string): string {
    const value =  this.index.get(key);
    if (value)
      return value;
    return "";
  }
  del(key: string) {
    this.index.delete(key);
  }
}

class Documents {
  // database metadata
  readonly name: string;
  readonly location: string;
  readonly encoding: BufferEncoding;
  get searchLocation(): string {
    return this.location + this.name + '/';
  }
  get metaLocation(): string {
    return this.location + this.name + '/_docmeta.json';
  }

  private indicies: Array<NamedIndex>;
  private currentIndexPromise?: Promise<any>;

  constructor(options?: {
    name: string | undefined,
    location: string | undefined,
  }) {
    this.name = options?.name ?? "default";
    this.location = formatSystemUrlString(options?.location ?? "/home");
    if (!this.location.endsWith('/'))
      this.location += '/';
    this.encoding = "utf-8";
    this.indicies = new Array<NamedIndex>;

    if (!fssync.existsSync(this.searchLocation))
      fssync.mkdirSync(this.searchLocation, { recursive: true });
    // check for existing database
    const docmeta_location = this.metaLocation;
    console.log(`checking for docmeta at ${docmeta_location}`);
    if (fssync.existsSync(docmeta_location)) {
      try {
        const docmeta: DocMeta = JSON.parse(fssync.readFileSync(docmeta_location, this.encoding));
        if (docmeta.indicies)
          for (const index of docmeta.indicies) {
            console.log(`importing index '${index.name}'...`)
            this.indicies.push(
              new NamedIndex(
                index.name,
                new Map<string, string>(index.index)
              )
            );
          }
      } catch (error) {
        console.error(`problem error in accessing _docmeta for db '${this.name}'! (at: ${docmeta_location}) error: ${error}`);
      }
    }
    
    console.log(`opened ${this.name} at ${this.location + this.name + '/'}`);
  }

  async index(key: string, location: string, index: string): Promise<NamedIndex> {
    if (this.currentIndexPromise) {
      await this.currentIndexPromise;
      this.currentIndexPromise = undefined;
    }
    const target_index = this.indicies.find(indx => indx.name == index);
    if (target_index) {
      target_index.set(key, location);
      this.currentIndexPromise = this.savedocmeta();
      return target_index;
    }
    // create new named index and insert
    const new_index = new NamedIndex(index);
    new_index.set(key, location);
    this.indicies.push(new_index);
    this.currentIndexPromise = this.savedocmeta();
    return new_index;
  }

  locate(key: string, index: string): Result<string> {
    const target_index = this.indicies.find(indx => indx.name == index);
    if (target_index && target_index.has(key))
      return target_index.get(key);
    // a key not being indexed will result in the same thing as no index
    return undefined;
  }

  unindex(key: string, index: string) {
    const target_index = this.indicies.find(indx => indx.name == index);
    if (target_index) {
      target_index.del(key);
      // remove index if empty
      if (target_index.isEmpty) {
        const target_index_idx = this.indicies.indexOf(target_index);
        this.indicies.splice(target_index_idx, 1);
      }
    }
  }

  async savedocmeta(): Promise<any> {
    console.log("saving docmeta...");
    const docmeta: DocMeta = {
      indicies: new Array<DocMetaIndex>,
    };
    for (const index of this.indicies) {
      const docmeta_index: DocMetaIndex = {
        name: index.name,
        index: Array.from(index.index),
      };
      docmeta.indicies.push(docmeta_index);
    }
    const handle = await fs.open(this.metaLocation, 'w+') // open rw - will create file
    const result =  await handle.writeFile(JSON.stringify(docmeta), this.encoding);
    handle.close();
    const wait = (msec: number) => new Promise((resolve, _) => {
      setTimeout(resolve, msec);
    });
    await wait(1000);
    console.log("docmeta saved!");
    return result;
  }

  async get(key: string): Promise<Result<string>> {
    let expanded_key = CombinePath(this.searchLocation, key);
    const parent_path = PathParent(expanded_key);
    try {
      await fs.access(parent_path)
    } catch (error) {
      await fs.mkdir(parent_path, { recursive: true });
    }
    const filepath = expanded_key + '.document'
    // check if file exists
    // fs apparently doesnt have a better way to do this other than try
    // opening the file and handling a rejected promise.
    try {
      const handle = await fs.open(filepath, 'r') // open r - will not create
      const file_contents = handle.readFile(this.encoding);
      handle.close();
      return await file_contents;
    } catch (error) {
      //console.log(error);
      console.error(`document ${filepath} does not exist!`);
      return undefined;
    }
  }

  async getJSON<T>(key: string): Promise<Result<T>> {
    const text = await this.get(key);
    if (text)
      return JSON.parse(text);
    return undefined;
  }

  async set(key: string, document: string) {
    let expanded_key = CombinePath(this.searchLocation, key);
    const parent_path = PathParent(expanded_key);
    try {
      await fs.access(parent_path)
    } catch (error) {
      await fs.mkdir(parent_path, { recursive: true });
    }
    const filepath = expanded_key + '.document'
    try {
      const handle = await fs.open(filepath, 'w') // open w - will replace file
      await handle.writeFile(document, this.encoding);
      handle.close();
    } catch (error) {
      console.error(error);
    }
  }

  async mov(key: string, next_key: string) {
    let expanded_key = CombinePath(this.searchLocation, key);
    let expanded_next_key = CombinePath(this.searchLocation, next_key);
    const parent_path = PathParent(expanded_key);
    const parent_next_path = PathParent(expanded_next_key);
    try {
      await fs.access(parent_next_path)
    } catch (error) {
      await fs.mkdir(parent_next_path, { recursive: true });
    }
    const filepath = expanded_key + '.document'
    const file_nextpath = expanded_next_key + '.document'
    try {
      await fs.rename(filepath, file_nextpath);
      this.cleandirs(parent_path);
    } catch (error) {
      console.error(error);
    }
  }

  async del(key: string) {
    let expanded_key = CombinePath(this.searchLocation, key);
    const filepath = expanded_key + '.document'
    try {
      fs.rm(filepath);
      const parent_path = PathParent(expanded_key);
      this.cleandirs(parent_path);
    } catch (error) {
      console.error(error);
    }
  }

  async cleandirs(path: string) {
    let operating_path = path + '/';
    // check if parent to current is empty
    // it's ok that we start with stepping up because when we start
    // we add a trailing slash to the current dir
    // eg: /home/bushel-store/one/two/three/
    let overrun = 0;
    let will_delete = false;
    let parent_operating_path = PathParent(operating_path);
    while ((await PathIsEmpty(parent_operating_path)
          || await PathHasChildOnly(parent_operating_path, PathLastElement(operating_path)))
          && overrun < 20) {
      if (parent_operating_path == '' || parent_operating_path + '/' == this.searchLocation) {
        console.error('[documents] directory clean up operation stepped path until db root! aborting...')
        return;
      }
      overrun++;
      will_delete = true;
      operating_path = parent_operating_path;
      parent_operating_path = PathParent(operating_path);
    }
    // do an extra check for overrun because if it overran it likely
    // means something went wrong
    if (overrun >= 20) {
      console.error('[documents] directory clean up operation exceeded 20 steps up path! aborting...');
      return;
    }
    try {
      if (will_delete)
        fs.rm(operating_path, { recursive: true });
    } catch (error) {
      console.error(error);
    }
  }
}

// i hate this
function formatSystemUrlString(path: string): string {
  switch (process.platform) {
    case 'win32':
      if (path.includes(':')) { // windows path
        return path;
      }
      return 'C:' + path; // only supporting C:, sorry
    default:
      if (path.includes(':')) {
        return path.substring(2);
      }
      return path;
  }
}

export function CombinePath(fragment1: string, fragment2: string): string {
  let mod_frag2 = `${fragment2}`; // "copy" to a new string. yeag
  if (fragment2.startsWith('/'))
    mod_frag2 = fragment2.substring(1)
  if (fragment1.endsWith('/'))
    return fragment1 + mod_frag2;
  return fragment1 + '/' + mod_frag2;
}

async function PathIsEmpty(path: string) {
  try {
    const stat = await fs.stat(path);
    if (stat.isDirectory()) {
      return fs.readdir(path, { withFileTypes: true }).then(contents => {
        return contents.length == 0;
      });
    }
  } catch (error) {
    console.error(error);
  }
  // everything else is inherently *not* empty
  return false;
}

async function PathHasChildOnly(path: string, key: string) {
  try {
    const stat = await fs.stat(path);
    if (stat.isDirectory()) {
      return fs.readdir(path, { withFileTypes: true }).then(contents => {
        if (contents.length == 0 || contents.length > 1)
          return false; // if theres more than one thing its inherrently false
        if (contents[0].name == key)
          return true;
      })
    }
  } catch (error) {
    console.error(error);
  }
  // files can't contain children
  return false;
}

export function PathParent(path: string) {
  return path.substring(0, path.lastIndexOf("/"));
}

function PathLastElement(path: string) {
  return path.substring(path.lastIndexOf("/") + 1);
}

export const documents = new Documents({
  name: process.env.DB_NAME,
  location: process.env.DB_LOCATION,
});
