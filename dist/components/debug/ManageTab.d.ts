import type { Note, Status } from '../../types';
interface ManageTabProps {
    notes: Note[];
    updateStatus: (id: number, status: Status, options?: {
        comment?: string;
        author?: string;
    }) => Promise<boolean>;
}
export declare function ManageTab({ notes, updateStatus }: ManageTabProps): import("react/jsx-runtime").JSX.Element;
export {};
