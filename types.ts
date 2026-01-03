
export enum BibleSection {
  OLD_TESTAMENT = 'Old Testament',
  NEW_TESTAMENT = 'New Testament',
  APOCRYPHA = 'Apocrypha',
  PSEUDEPIGRAPHA = 'Pseudepigrapha',
  GNOSTIC_GOSPELS = 'Gnostic Gospels'
}

export interface BibleBook {
  id: string;
  name: string;
  section: BibleSection;
  chapters: number;
  summary?: string;
}

export interface Verse {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface Bookmark {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  timestamp: number;
}

export interface Prayer {
  id: string;
  title: string;
  content: string;
  completed: boolean;
  date: number;
}

export interface Note {
  id: string;
  verseRef: string;
  content: string;
  lastUpdated: number;
}
