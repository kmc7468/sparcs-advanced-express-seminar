import { Router } from "express";
import crypto from "node:crypto";
import { z } from "zod";
import { prisma } from "../lib/prisma.ts";
import { buildPublicUrl, createPresignedUpload, objectExists } from "../lib/s3.ts";
import { requireAuth } from "../middlewares/auth.ts";

const router = Router();

const presignUrlSchema = z.object({
  contentType: z.string().startsWith("image/"),
  fileSize: z.int().nonnegative(),
});

const createPhotoSchema = z.object({
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).default(""),
  isPublic: z.boolean().default(true),
  imageKey: z.string().min(1),
});

function toPhotoResponse(photo: {
  id: string;
  title: string;
  description: string | null;
  imageKey: string;
  isPublic: boolean;
  createdAt: Date;
  user: { username: string };
}) {
  return {
    id: photo.id,
    title: photo.title,
    description: photo.description,
    imageUrl: buildPublicUrl(photo.imageKey),
    isPublic: photo.isPublic,
    createdAt: photo.createdAt,
    username: photo.user.username,
  };
}

router.get("/", async (_req, res) => {
  const photos = await prisma.photo.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true } } },
  });

  return res.json({ photos: photos.map(toPhotoResponse) });
});

router.get("/user/:username", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { username: req.params.username },
    select: { id: true, username: true },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const includePrivate = req.user?.id === user.id;
  const photos = await prisma.photo.findMany({
    where: {
      userId: user.id,
      ...(includePrivate ? {} : { isPublic: true }),
    },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { username: true } } },
  });

  return res.json({
    user: { id: user.id, username: user.username },
    photos: photos.map(toPhotoResponse),
  });
});

router.post("/upload-url", requireAuth, async (req, res) => {
  const { contentType, fileSize } = presignUrlSchema.parse(req.body);

  if (fileSize === 0) {
    return res.status(400).json({ message: "Invalid file size" });
  }

  const key = `photos/${req.user!.id}/${crypto.randomUUID()}`;
  const uploadPayload = await createPresignedUpload({
    key,
    contentType,
  });

  return res.json(uploadPayload);
});

router.post("/", requireAuth, async (req, res) => {
  const { title, description, isPublic, imageKey } = createPhotoSchema.parse(req.body);

  if (!imageKey.startsWith(`photos/${req.user!.id}/`)) {
    return res.status(400).json({ message: "Invalid image key" });
  }

  const imageExists = await objectExists(imageKey);

  if (!imageExists) {
    return res.status(400).json({ message: "Image not found" });
  }

  const photo = await prisma.photo.create({
    data: {
      title,
      description,
      isPublic,
      imageKey,
      userId: req.user!.id,
    },
    include: { user: { select: { username: true } } },
  });

  return res.status(201).json({ photo: toPhotoResponse(photo) });
});

export default router;
