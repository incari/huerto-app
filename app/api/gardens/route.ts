import { NextRequest, NextResponse } from "next/server";
import { db, initDb } from "@/lib/db";
import { gardens, plantedItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

initDb();

export async function GET() {
  try {
    const allGardens = await db.select().from(gardens);
    return NextResponse.json(allGardens);
  } catch (error) {
    console.error("Error fetching gardens:", error);
    return NextResponse.json(
      { error: "Failed to fetch gardens" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, config, plants } = body;

    const [garden] = await db
      .insert(gardens)
      .values({
        name,
        config: JSON.stringify(config),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (plants && plants.length > 0) {
      await db.insert(plantedItems).values(
        plants.map((plant: any) => ({
          gardenId: garden.id,
          lineIndex: plant.lineIndex,
          plantId: plant.plantId,
          varietyId: plant.varietyId,
          side: plant.side,
          positionCm: plant.positionCm,
          itemId: plant.itemId,
        })),
      );
    }

    return NextResponse.json(garden, { status: 201 });
  } catch (error) {
    console.error("Error creating garden:", error);
    return NextResponse.json(
      { error: "Failed to create garden" },
      { status: 500 },
    );
  }
}

