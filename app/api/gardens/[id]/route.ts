import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { gardens, plantedItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const gardenId = parseInt(id);

    const [garden] = await db
      .select()
      .from(gardens)
      .where(eq(gardens.id, gardenId));

    if (!garden) {
      return NextResponse.json({ error: "Garden not found" }, { status: 404 });
    }

    const plants = await db
      .select()
      .from(plantedItems)
      .where(eq(plantedItems.gardenId, gardenId));

    const parsedConfig = JSON.parse(garden.config);
    console.log("🔍 [SERVER] GET /api/gardens/" + gardenId);
    console.log(
      "🔍 [SERVER] Raw config from DB:",
      garden.config.substring(0, 200) + "...",
    );
    console.log(
      "🔍 [SERVER] Parsed config lines:",
      parsedConfig?.lines?.length || 0,
    );

    return NextResponse.json({
      ...garden,
      config: parsedConfig,
      plants,
    });
  } catch (error) {
    console.error("Error fetching garden:", error);
    return NextResponse.json(
      { error: "Failed to fetch garden" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const gardenId = parseInt(id);
    const body = await request.json();
    const { name, config, plants } = body;

    console.log("🔧 [SERVER] PUT /api/gardens/" + gardenId);
    console.log("🔧 [SERVER] Received config:", JSON.stringify(config));
    console.log("🔧 [SERVER] Config lines:", config?.lines?.length || 0);

    const [updatedGarden] = await db
      .update(gardens)
      .set({
        name,
        config: JSON.stringify(config),
        updatedAt: new Date(),
      })
      .where(eq(gardens.id, gardenId))
      .returning();

    console.log("🔧 [SERVER] Updated garden config:", updatedGarden.config);

    if (!updatedGarden) {
      return NextResponse.json({ error: "Garden not found" }, { status: 404 });
    }

    await db.delete(plantedItems).where(eq(plantedItems.gardenId, gardenId));

    if (plants && plants.length > 0) {
      await db.insert(plantedItems).values(
        plants.map((plant: any) => ({
          gardenId: gardenId,
          lineIndex: plant.lineIndex,
          plantId: plant.plantId,
          varietyId: plant.varietyId,
          side: plant.side,
          positionCm: plant.positionCm,
          itemId: plant.itemId,
        })),
      );
    }

    return NextResponse.json(updatedGarden);
  } catch (error) {
    console.error("Error updating garden:", error);
    return NextResponse.json(
      { error: "Failed to update garden" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const gardenId = parseInt(id);

    await db.delete(gardens).where(eq(gardens.id, gardenId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting garden:", error);
    return NextResponse.json(
      { error: "Failed to delete garden" },
      { status: 500 },
    );
  }
}
