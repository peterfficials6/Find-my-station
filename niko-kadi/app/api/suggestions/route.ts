import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

const VALID_CATEGORIES = ["design", "code", "content", "data", "other"];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, category, file_url, contact } = body;

    if (!title || typeof title !== "string" || title.trim().length < 3) {
      return NextResponse.json(
        { error: "Title is required (at least 3 characters)" },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Description is required (at least 10 characters)" },
        { status: 400 }
      );
    }

    if (title.trim().length > 100) {
      return NextResponse.json(
        { error: "Title must be under 100 characters" },
        { status: 400 }
      );
    }

    if (description.trim().length > 2000) {
      return NextResponse.json(
        { error: "Description must be under 2000 characters" },
        { status: 400 }
      );
    }

    const cat = VALID_CATEGORIES.includes(category) ? category : "other";

    // Basic URL validation for file link
    let validatedUrl: string | null = null;
    if (file_url && typeof file_url === "string" && file_url.trim()) {
      try {
        new URL(file_url.trim());
        validatedUrl = file_url.trim();
      } catch {
        return NextResponse.json(
          { error: "File URL must be a valid link" },
          { status: 400 }
        );
      }
    }

    const suggestion = await prisma.featureSuggestion.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        category: cat,
        fileUrl: validatedUrl,
        contact: contact && typeof contact === "string" ? contact.trim().slice(0, 100) : null,
      },
    });

    return NextResponse.json(
      { message: "Suggestion submitted! Thank you.", id: suggestion.id },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
