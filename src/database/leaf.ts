export interface LeafDetails {
    id: string;
    path: string;
    title: string;
    created_by: string | undefined;
    last_modified_date: Date;
    backlinks: [] | undefined;
}

export const isLeafDetails = (value: LeafDetails): value is LeafDetails => !!value?.id;

export interface Leaf {
    details: LeafDetails;
    content: string;
}