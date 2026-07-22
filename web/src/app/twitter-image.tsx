import { ImageResponse } from "next/og";
import { SocialImageContent } from "@/lib/socialImage";

export const alt = "Ozones — Focus Timer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(<SocialImageContent />, { ...size });
}
