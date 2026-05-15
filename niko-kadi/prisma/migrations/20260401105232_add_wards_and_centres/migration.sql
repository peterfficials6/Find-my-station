-- CreateTable
CREATE TABLE "wards" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "constituency_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registration_centres" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "code" INTEGER NOT NULL,
    "ward_id" TEXT NOT NULL,
    "constituency_id" TEXT NOT NULL,
    "cycle_year" INTEGER NOT NULL,
    "active_from" TIMESTAMP(3),
    "active_until" TIMESTAMP(3),
    "verified_lat" DOUBLE PRECISION,
    "verified_lng" DOUBLE PRECISION,
    "verification_status" TEXT NOT NULL DEFAULT 'unverified',
    "confirmation_count" INTEGER NOT NULL DEFAULT 0,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registration_centres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centre_contributions" (
    "id" TEXT NOT NULL,
    "centre_id" TEXT NOT NULL,
    "contributor_id" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "cluster_id" TEXT,
    "device_fingerprint" TEXT NOT NULL,
    "ip_hash" TEXT NOT NULL,
    "is_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "centre_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "centre_flags" (
    "id" TEXT NOT NULL,
    "centre_id" TEXT NOT NULL,
    "device_fingerprint" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "centre_flags_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wards_slug_key" ON "wards"("slug");

-- CreateIndex
CREATE INDEX "wards_constituency_id_idx" ON "wards"("constituency_id");

-- CreateIndex
CREATE UNIQUE INDEX "wards_code_constituency_id_key" ON "wards"("code", "constituency_id");

-- CreateIndex
CREATE UNIQUE INDEX "registration_centres_slug_key" ON "registration_centres"("slug");

-- CreateIndex
CREATE INDEX "registration_centres_ward_id_idx" ON "registration_centres"("ward_id");

-- CreateIndex
CREATE INDEX "registration_centres_constituency_id_idx" ON "registration_centres"("constituency_id");

-- CreateIndex
CREATE INDEX "registration_centres_verification_status_idx" ON "registration_centres"("verification_status");

-- CreateIndex
CREATE INDEX "registration_centres_cycle_year_idx" ON "registration_centres"("cycle_year");

-- CreateIndex
CREATE UNIQUE INDEX "registration_centres_code_ward_id_key" ON "registration_centres"("code", "ward_id");

-- CreateIndex
CREATE INDEX "centre_contributions_centre_id_idx" ON "centre_contributions"("centre_id");

-- CreateIndex
CREATE INDEX "centre_contributions_cluster_id_idx" ON "centre_contributions"("cluster_id");

-- CreateIndex
CREATE UNIQUE INDEX "centre_contributions_device_fingerprint_centre_id_key" ON "centre_contributions"("device_fingerprint", "centre_id");

-- CreateIndex
CREATE INDEX "centre_flags_centre_id_idx" ON "centre_flags"("centre_id");

-- CreateIndex
CREATE UNIQUE INDEX "centre_flags_device_fingerprint_centre_id_key" ON "centre_flags"("device_fingerprint", "centre_id");

-- AddForeignKey
ALTER TABLE "wards" ADD CONSTRAINT "wards_constituency_id_fkey" FOREIGN KEY ("constituency_id") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_centres" ADD CONSTRAINT "registration_centres_ward_id_fkey" FOREIGN KEY ("ward_id") REFERENCES "wards"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registration_centres" ADD CONSTRAINT "registration_centres_constituency_id_fkey" FOREIGN KEY ("constituency_id") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "centre_contributions" ADD CONSTRAINT "centre_contributions_centre_id_fkey" FOREIGN KEY ("centre_id") REFERENCES "registration_centres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "centre_contributions" ADD CONSTRAINT "centre_contributions_contributor_id_fkey" FOREIGN KEY ("contributor_id") REFERENCES "contributor_identities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "centre_flags" ADD CONSTRAINT "centre_flags_centre_id_fkey" FOREIGN KEY ("centre_id") REFERENCES "registration_centres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
