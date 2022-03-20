import { db } from "~/db.server";
import { NotesRepository } from "./infra/notesRepository.server";
export type { Note } from "@prisma/client";
export let notesReposirory = new NotesRepository(db);
