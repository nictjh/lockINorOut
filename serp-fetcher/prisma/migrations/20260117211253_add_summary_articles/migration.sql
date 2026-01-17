-- CreateTable
CREATE TABLE "Article" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "snippet" TEXT,
    "category" TEXT,
    "topic" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Article_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SummaryArticle" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "category" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SummaryArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Article_url_key" ON "Article"("url");

-- CreateIndex
CREATE UNIQUE INDEX "SummaryArticle_articleId_key" ON "SummaryArticle"("articleId");

-- CreateIndex
CREATE INDEX "SummaryArticle_topic_idx" ON "SummaryArticle"("topic");

-- CreateIndex
CREATE INDEX "SummaryArticle_category_idx" ON "SummaryArticle"("category");

-- CreateIndex
CREATE INDEX "SummaryArticle_createdAt_idx" ON "SummaryArticle"("createdAt");

-- AddForeignKey
ALTER TABLE "SummaryArticle" ADD CONSTRAINT "SummaryArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;
