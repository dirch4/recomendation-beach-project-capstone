-- CreateTable
CREATE TABLE "Beach" (
    "place_Id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "reviews" INTEGER NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "featured_image" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "review_keywords" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "coordinates" TEXT NOT NULL,

    CONSTRAINT "Beach_pkey" PRIMARY KEY ("place_Id")
);

-- CreateTable
CREATE TABLE "Reviews" (
    "placeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" DOUBLE PRECISION NOT NULL,
    "review_text" TEXT NOT NULL,
    "average_sentiment" TEXT NOT NULL,

    CONSTRAINT "Reviews_pkey" PRIMARY KEY ("placeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Beach_place_Id_key" ON "Beach"("place_Id");

-- CreateIndex
CREATE UNIQUE INDEX "Reviews_placeId_key" ON "Reviews"("placeId");

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "Beach"("place_Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reviews" ADD CONSTRAINT "Reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
