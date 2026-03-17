export interface ImageDropZoneProps {
    files: File[];
    onAdd: (files: File[]) => void;
    onRemove: (index: number) => void;
    maxFiles?: number;
    maxFileSize?: number;
    disabled?: boolean;
    /** PiP ウィンドウの document（paste イベント用） */
    pipDocument?: Document | null;
}
export declare function ImageDropZone({ files, onAdd, onRemove, maxFiles, maxFileSize, disabled, pipDocument, }: ImageDropZoneProps): import("react/jsx-runtime").JSX.Element;
