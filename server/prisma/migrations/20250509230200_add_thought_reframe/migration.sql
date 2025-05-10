-- CreateTable
CREATE TABLE "ThoughtReframe" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "originalThought" TEXT NOT NULL,
  "beliefStrength" INTEGER NOT NULL,
  "reframedThought" TEXT NOT NULL,
  "language" TEXT NOT NULL DEFAULT 'pt-BR',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "ThoughtReframe_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ThoughtReframe" ADD CONSTRAINT "ThoughtReframe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
