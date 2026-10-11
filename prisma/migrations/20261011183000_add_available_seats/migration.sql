BEGIN;

ALTER TABLE "Event"
ADD COLUMN "availableSeats" INTEGER;

UPDATE "Event" AS e
SET "availableSeats" = GREATEST(
  0,
  e."totalSeats" - COALESCE(
    (
      SELECT SUM(b."quantity")
      FROM "Booking" AS b
      WHERE b."eventId" = e."id"
        AND b."status"::text = 'CONFIRMED'
    ),
    0
  )
)::INTEGER;

ALTER TABLE "Event"
ALTER COLUMN "availableSeats" SET NOT NULL;

COMMIT;