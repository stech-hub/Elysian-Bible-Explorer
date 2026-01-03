
import React from 'react';
import { BibleBook, BibleSection } from './types';

export const BIBLE_BOOKS: BibleBook[] = [
  // Old Testament
  { id: 'gen', name: 'Genesis', section: BibleSection.OLD_TESTAMENT, chapters: 50 },
  { id: 'exo', name: 'Exodus', section: BibleSection.OLD_TESTAMENT, chapters: 40 },
  { id: 'lev', name: 'Leviticus', section: BibleSection.OLD_TESTAMENT, chapters: 27 },
  { id: 'num', name: 'Numbers', section: BibleSection.OLD_TESTAMENT, chapters: 36 },
  { id: 'deu', name: 'Deuteronomy', section: BibleSection.OLD_TESTAMENT, chapters: 34 },
  { id: 'psa', name: 'Psalms', section: BibleSection.OLD_TESTAMENT, chapters: 150 },
  { id: 'pro', name: 'Proverbs', section: BibleSection.OLD_TESTAMENT, chapters: 31 },
  { id: 'isa', name: 'Isaiah', section: BibleSection.OLD_TESTAMENT, chapters: 66 },
  // New Testament
  { id: 'mat', name: 'Matthew', section: BibleSection.NEW_TESTAMENT, chapters: 28 },
  { id: 'mar', name: 'Mark', section: BibleSection.NEW_TESTAMENT, chapters: 16 },
  { id: 'luk', name: 'Luke', section: BibleSection.NEW_TESTAMENT, chapters: 24 },
  { id: 'joh', name: 'John', section: BibleSection.NEW_TESTAMENT, chapters: 21 },
  { id: 'act', name: 'Acts', section: BibleSection.NEW_TESTAMENT, chapters: 28 },
  { id: 'rom', name: 'Romans', section: BibleSection.NEW_TESTAMENT, chapters: 16 },
  { id: 'rev', name: 'Revelation', section: BibleSection.NEW_TESTAMENT, chapters: 22 },
  // Excluded Books
  { id: 'eno', name: '1 Enoch', section: BibleSection.PSEUDEPIGRAPHA, chapters: 108 },
  { id: 'jas', name: 'Book of Jasher', section: BibleSection.PSEUDEPIGRAPHA, chapters: 91 },
  { id: 'tho', name: 'Gospel of Thomas', section: BibleSection.GNOSTIC_GOSPELS, chapters: 1 },
  { id: 'mar_g', name: 'Gospel of Mary', section: BibleSection.GNOSTIC_GOSPELS, chapters: 1 },
  { id: 'jud', name: 'Gospel of Judas', section: BibleSection.GNOSTIC_GOSPELS, chapters: 1 },
  { id: 'phi', name: 'Gospel of Philip', section: BibleSection.GNOSTIC_GOSPELS, chapters: 1 },
  { id: 'mac', name: '1 Maccabees', section: BibleSection.APOCRYPHA, chapters: 16 },
  { id: 'tob', name: 'Tobit', section: BibleSection.APOCRYPHA, chapters: 14 }
];

export const VERSES_OF_DAY = [
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ which strengtheneth me." },
  { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { ref: "Jeremiah 29:11", text: "For I know the thoughts that I think toward you, saith the Lord, thoughts of peace, and not of evil, to give you an expected end." }
];
