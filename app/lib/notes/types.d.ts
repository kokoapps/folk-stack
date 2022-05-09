import { Note } from "@prisma/client";

export interface INotesReposirory {
  getNotes(): Promise<Note[]>;
  getNote(note: Pick<Note, "userId" | "id">): Promise<Note | null>;
  getNoteListItems({ userId }: { userId: Note["userId"] }): Promise<Note[]>;
  createNote(note: Note): Promise<Note>;
  deleteNote({ userId, id }: Pick<Note, "userId" | "id">): Promise<void>;
}
