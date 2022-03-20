export interface INotesReposirory {
  getNotes(): Promise<Note[]>;
  getNote(note: Pick<Note, "userId" | "id">): Promise<Note>;
  getNoteListItems(userId: string): Promise<Note[]>;
  createNote(note: Note): Promise<Note>;
  deleteNote({ userId, id }: Pick<Note, "userId" | "id">): Promise<void>;
}
