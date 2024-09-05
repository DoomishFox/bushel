export interface Notebook {
    metadata: {
        signature: string,
    },
    nbformat: number,
    nbformat_minor: number,
    cells: Cell[],
}

export interface Cell {
    cell_type: string,
    id: string, // alphanumeric string (including '-' and '_') between 1 and 64 characters
    metadata: { // ok to have arbitrary data
        bushel?: { // bushel specific metadata dict
            language?: string,
            filename?: string,
            url?: string, // clickable, for referencing source material
        },
    },
    source: string | string[],
    attachments?: { // optional, only on markdown and raw. used for images referenced in markdown
        //"image.png": { "image/png": "base64-encoded-png-data" }
    }
}