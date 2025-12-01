/*
  Warnings:

  - You are about to drop the column `fileSize` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `pageCount` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `pdfKey` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `thumbnailUrl` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `class` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `pageCount` on the `notes` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `notes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_bookId_fkey";

-- DropForeignKey
ALTER TABLE "notes" DROP CONSTRAINT "notes_subjectId_fkey";

-- AlterTable
ALTER TABLE "books" DROP COLUMN "fileSize",
DROP COLUMN "pageCount",
DROP COLUMN "pdfKey",
DROP COLUMN "pdfUrl",
DROP COLUMN "thumbnailUrl",
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "edition" TEXT,
ADD COLUMN     "publisher" TEXT NOT NULL DEFAULT 'NCERT',
ADD COLUMN     "year" INTEGER;

-- AlterTable
ALTER TABLE "notes" DROP COLUMN "bookId",
DROP COLUMN "class",
DROP COLUMN "pageCount",
DROP COLUMN "subjectId",
ADD COLUMN     "chapterId" TEXT,
ADD COLUMN     "createdBy" TEXT;

-- CreateTable
CREATE TABLE "chapters" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pdfUrl" TEXT,
    "pdfKey" TEXT,
    "fileSize" INTEGER,
    "pageRange" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "chapters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "chapters_bookId_chapterNumber_key" ON "chapters"("bookId", "chapterNumber");

-- AddForeignKey
ALTER TABLE "chapters" ADD CONSTRAINT "chapters_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "books"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notes" ADD CONSTRAINT "notes_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "chapters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
