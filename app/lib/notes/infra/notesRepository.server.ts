import { INotesReposirory } from "../types";

import { Note, PrismaClient } from "@prisma/client";

export class NotesRepository implements INotesReposirory {
  constructor(private db: PrismaClient) {}
  getNote(note: Pick<Note, "userId" | "id">): Promise<Note | null> {
    return this.db.note.findFirst({
      where: { id: note.id, userId: note.userId },
    });
  }
  getNoteListItems({ userId }: { userId: Note["userId"] }): Promise<Note[]> {
    return this.db.note.findMany({ where: { userId } });
  }
  getNotes(): Promise<Note[]> {
    return this.db.note.findMany();
  }
  createNote(note: Pick<Note, "userId" | "title" | "body">): Promise<Note> {
    return this.db.note.create({ data: note });
  }
  async deleteNote({ userId, id }: Pick<Note, "userId" | "id">): Promise<void> {
    await this.db.note.deleteMany({ where: { id, userId } });
  }
}
