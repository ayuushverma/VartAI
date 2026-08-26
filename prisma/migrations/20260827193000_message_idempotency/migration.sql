ALTER TABLE "Message" ADD COLUMN "clientRequestId" TEXT;
ALTER TABLE "Message" ADD COLUMN "replyToRequestId" TEXT;
ALTER TABLE "Message" ADD COLUMN "feedback" JSONB;
ALTER TABLE "Message" ADD COLUMN "processing" BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX "Message_clientRequestId_key" ON "Message"("clientRequestId");
CREATE INDEX "Message_conversationId_replyToRequestId_idx" ON "Message"("conversationId", "replyToRequestId");