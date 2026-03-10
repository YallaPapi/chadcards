-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "manaCost" INTEGER NOT NULL,
    "colors" TEXT NOT NULL,
    "typeLine" TEXT NOT NULL,
    "abilities" TEXT NOT NULL,
    "flavorText" TEXT NOT NULL,
    "flavorAttribution" TEXT NOT NULL,
    "power" INTEGER NOT NULL,
    "toughness" INTEGER NOT NULL,
    "rarity" TEXT NOT NULL,
    "artUrl" TEXT NOT NULL,
    "artDescription" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Card_name_key" ON "Card"("name");
