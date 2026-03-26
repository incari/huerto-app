// This file should only be imported dynamically on the client side
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type {
  Plant,
  PlantedItem,
  PlantingHistoryEntry,
  GardenLine,
} from "./plants";

interface PDFExportOptions {
  plantedItem: PlantedItem;
  currentPlant?: Plant;
  plants: Plant[];
  lineIndex: number;
}

export function exportPlantHistoryToPDF({
  plantedItem,
  currentPlant,
  plants,
  lineIndex,
}: PDFExportOptions) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(18);
  doc.text("Historial de Plantación", pageWidth / 2, 20, { align: "center" });

  // Subtitle with position info
  doc.setFontSize(12);
  doc.text(
    `Línea ${lineIndex + 1} - Posición ${plantedItem.positionCm}cm (${plantedItem.side === "top" ? "Arriba" : "Abajo"})`,
    pageWidth / 2,
    30,
    { align: "center" },
  );

  let yPosition = 45;

  // Current plant section
  if (currentPlant) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Planta Actual", 14, yPosition);

    const variety = plantedItem.varietyId
      ? currentPlant.varieties.find((v) => v.id === plantedItem.varietyId)
      : null;

    const currentData = [
      ["Planta", currentPlant.name],
      ["Variedad", variety ? variety.name : "N/A"],
      [
        "Fecha de plantación",
        new Date(plantedItem.plantedDate).toLocaleDateString("es-ES"),
      ],
      [
        "Días plantada",
        Math.floor(
          (Date.now() - new Date(plantedItem.plantedDate).getTime()) /
            (1000 * 60 * 60 * 24),
        ).toString(),
      ],
    ];

    (autoTable as any)(doc, {
      startY: yPosition + 5,
      head: [["Campo", "Valor"]],
      body: currentData,
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] }, // green-500
      margin: { left: 14, right: 14 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  } else {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text("No hay planta actualmente", 14, yPosition + 10);
    yPosition += 25;
  }

  // Historical plants section
  const history = plantedItem.history || [];

  if (history.length > 0) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Historial de Plantaciones", 14, yPosition);

    const historyData = history.map((entry) => {
      const plant = plants.find((p) => p.id === entry.plantId);
      if (!plant) return ["Desconocida", "", "", ""];

      const variety = entry.varietyId
        ? plant.varieties.find((v) => v.id === entry.varietyId)
        : null;

      const plantedDate = new Date(entry.plantedDate).toLocaleDateString(
        "es-ES",
      );
      const removedDate = new Date(entry.removedDate).toLocaleDateString(
        "es-ES",
      );
      const duration = Math.floor(
        (new Date(entry.removedDate).getTime() -
          new Date(entry.plantedDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      return [
        plant.name + (variety ? ` (${variety.name})` : ""),
        `${plantedDate} - ${removedDate}`,
        `${duration} días`,
        entry.yieldAmount
          ? `${entry.yieldAmount} ${entry.yieldUnit || ""}`
          : "N/A",
        entry.harvestNotes || "Sin notas",
      ];
    });

    (autoTable as any)(doc, {
      startY: yPosition + 5,
      head: [["Planta", "Período", "Duración", "Cosecha", "Notas"]],
      body: historyData,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] }, // blue-500
      margin: { left: 14, right: 14 },
      columnStyles: {
        4: { cellWidth: 50 },
      },
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("No hay historial de plantaciones previas", 14, yPosition + 10);
  }

  // Footer
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(9);
  doc.setTextColor(128, 128, 128);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}`,
    pageWidth / 2,
    footerY,
    { align: "center" },
  );

  // Save the PDF
  const fileName = `historial-linea${lineIndex + 1}-${plantedItem.positionCm}cm-${new Date().toISOString().split("T")[0]}.pdf`;
  doc.save(fileName);
}

// Export full garden as visual (canvas screenshot)
export async function exportFullGardenVisualPDF(canvasElement: HTMLElement) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Use dom-to-image-more
  const domtoimage = await import("dom-to-image-more");

  try {
    // Clone the element to avoid visual shifts
    const clone = canvasElement.cloneNode(true) as HTMLElement;

    // Style the clone with garden background and border
    clone.style.backgroundColor = "rgb(254 252 232 / 0.5)"; // bg-amber-50/50
    clone.style.padding = "16px";
    clone.style.border = "2px dashed rgb(253 230 138)"; // border-amber-200
    clone.style.borderRadius = "0.75rem"; // rounded-xl
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.top = "0";

    // Append clone to body temporarily
    document.body.appendChild(clone);

    // Get dimensions
    const fullWidth = clone.scrollWidth;
    const fullHeight = clone.scrollHeight;

    // Convert to PNG with dom-to-image-more, preserving the garden background
    const dataUrl = await domtoimage.toPng(clone, {
      quality: 1.0,
      scale: 2,
      width: fullWidth,
      height: fullHeight,
      filter: (node: HTMLElement) => {
        // Only override CSS variables in the cloned DOM, not the original
        if (node instanceof HTMLElement && node.style) {
          // Override border-related CSS variables to prevent beige color
          node.style.setProperty("--border", "transparent", "important");
          node.style.setProperty(
            "--sidebar-border",
            "transparent",
            "important",
          );
        }
        return true;
      },
    });

    // Remove the clone
    document.body.removeChild(clone);

    // Load image to get dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = dataUrl;
    });

    const imgData = dataUrl;
    const imgWidth = pageWidth - 40; // margins
    const imgHeight = (img.height * imgWidth) / img.width;

    // Add title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Estado Actual del Huerto", pageWidth / 2, 30, {
      align: "center",
    });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Snapshot del ${new Date().toLocaleDateString("es-ES")}`,
      pageWidth / 2,
      45,
      { align: "center" },
    );

    // Add image
    let yPosition = 60;

    // If image is too tall, split into multiple pages
    if (imgHeight > pageHeight - 100) {
      const pagesNeeded = Math.ceil(imgHeight / (pageHeight - 100));
      const pageImgHeight = pageHeight - 100;

      for (let i = 0; i < pagesNeeded; i++) {
        if (i > 0) {
          doc.addPage();
          yPosition = 20;
        }

        const sourceY = (i * pageImgHeight * img.height) / imgHeight;
        const sourceHeight = (pageImgHeight * img.height) / imgHeight;

        // Create a temporary canvas for this section
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = img.width;
        tempCanvas.height = sourceHeight;
        const tempCtx = tempCanvas.getContext("2d");

        if (tempCtx) {
          tempCtx.drawImage(
            img,
            0,
            sourceY,
            img.width,
            sourceHeight,
            0,
            0,
            img.width,
            sourceHeight,
          );

          const tempImgData = tempCanvas.toDataURL("image/png");
          doc.addImage(
            tempImgData,
            "PNG",
            20,
            yPosition,
            imgWidth,
            pageImgHeight,
          );
        }
      }
    } else {
      doc.addImage(imgData, "PNG", 20, yPosition, imgWidth, imgHeight);
    }

    // Footer
    const footerY = pageHeight - 15;
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Generado el ${new Date().toLocaleDateString("es-ES")} a las ${new Date().toLocaleTimeString("es-ES")}`,
      pageWidth / 2,
      footerY,
      { align: "center" },
    );

    // Return blob for preview
    return {
      blob: doc.output("blob"),
      fileName: `huerto-visual-${new Date().toISOString().split("T")[0]}.pdf`,
    };
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
}

// Export full garden with current state and history changes (TABLE FORMAT)
export function exportFullGardenTablePDF(lines: GardenLine[], plants: Plant[]) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Helper function to add footer
  const addFooter = (pageNum: number, totalPages: number) => {
    const footerY = pageHeight - 15;
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${pageNum} de ${totalPages} - Generado el ${new Date().toLocaleDateString("es-ES")}`,
      pageWidth / 2,
      footerY,
      { align: "center" },
    );
  };

  // Helper to get plant name
  const getPlantName = (plantId: string, varietyId?: string) => {
    const plant = plants.find((p) => p.id === plantId);
    if (!plant) return "Desconocida";
    const variety = varietyId
      ? plant.varieties.find((v) => v.id === varietyId)
      : null;
    return plant.name + (variety ? ` (${variety.name})` : "");
  };

  // ========== PAGE 1: CURRENT GARDEN STATE ==========
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Estado Actual del Huerto", pageWidth / 2, 20, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Snapshot del ${new Date().toLocaleDateString("es-ES")}`,
    pageWidth / 2,
    28,
    { align: "center" },
  );

  // Collect all current plants
  const currentPlantsData: any[] = [];
  lines.forEach((line, lineIndex) => {
    line.plants.forEach((plantedItem) => {
      // Skip ghost plants
      if (plantedItem.plantId === "") return;

      const plantName = getPlantName(
        plantedItem.plantId,
        plantedItem.varietyId,
      );
      const daysPlanted = Math.floor(
        (Date.now() - new Date(plantedItem.plantedDate).getTime()) /
          (1000 * 60 * 60 * 24),
      );

      currentPlantsData.push([
        `Línea ${lineIndex + 1}`,
        `${plantedItem.positionCm}cm`,
        plantedItem.side === "top" ? "Arriba" : "Abajo",
        plantName,
        new Date(plantedItem.plantedDate).toLocaleDateString("es-ES"),
        `${daysPlanted} días`,
      ]);
    });
  });

  if (currentPlantsData.length > 0) {
    (autoTable as any)(doc, {
      startY: 40,
      head: [["Línea", "Posición", "Lado", "Planta", "Plantada", "Edad"]],
      body: currentPlantsData,
      theme: "grid",
      headStyles: { fillColor: [34, 197, 94] }, // green-500
      margin: { left: 14, right: 14 },
      styles: { fontSize: 9 },
    });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(150, 150, 150);
    doc.text("No hay plantas actualmente en el huerto", pageWidth / 2, 60, {
      align: "center",
    });
  }

  // ========== PAGE 2+: HISTORY CHANGES (ONLY POSITIONS WITH HISTORY) ==========

  // Collect all positions with history
  const positionsWithHistory: Array<{
    lineIndex: number;
    plantedItem: PlantedItem;
    currentPlant?: Plant;
  }> = [];

  lines.forEach((line, lineIndex) => {
    line.plants.forEach((plantedItem) => {
      // Skip ghost plants
      if (plantedItem.plantId === "") return;

      // Only include if it has history
      if (plantedItem.history && plantedItem.history.length > 0) {
        const plant = plants.find((p) => p.id === plantedItem.plantId);
        positionsWithHistory.push({
          lineIndex,
          plantedItem,
          currentPlant: plant,
        });
      }
    });
  });

  if (positionsWithHistory.length > 0) {
    // Add new page for history
    doc.addPage();

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Historial de Cambios", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text("Solo posiciones con cambios anteriores", pageWidth / 2, 28, {
      align: "center",
    });

    let yPosition = 40;

    positionsWithHistory.forEach((item, index) => {
      const { lineIndex, plantedItem, currentPlant } = item;

      // Check if we need a new page
      if (yPosition > pageHeight - 80) {
        doc.addPage();
        yPosition = 20;
      }

      // Position header
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Línea ${lineIndex + 1} - ${plantedItem.positionCm}cm (${plantedItem.side === "top" ? "Arriba" : "Abajo"})`,
        14,
        yPosition,
      );
      yPosition += 8;

      // Current plant (what's there now)
      if (currentPlant) {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(34, 197, 94); // green
        doc.text("→ Ahora:", 14, yPosition);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const currentName = getPlantName(
          plantedItem.plantId,
          plantedItem.varietyId,
        );
        doc.text(
          `${currentName} (desde ${new Date(plantedItem.plantedDate).toLocaleDateString("es-ES")})`,
          35,
          yPosition,
        );
        yPosition += 6;
      }

      // Previous plants (history)
      const history = plantedItem.history || [];
      history.forEach((entry, histIndex) => {
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(59, 130, 246); // blue
        doc.text(`← Antes (${histIndex + 1}):`, 14, yPosition);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(0, 0, 0);
        const histPlantName = getPlantName(entry.plantId, entry.varietyId);
        const period = `${new Date(entry.plantedDate).toLocaleDateString("es-ES")} - ${new Date(entry.removedDate).toLocaleDateString("es-ES")}`;

        doc.text(`${histPlantName} (${period})`, 35, yPosition);
        yPosition += 5;

        // Add notes if available
        if (entry.harvestNotes || entry.yieldAmount) {
          doc.setFontSize(8);
          doc.setTextColor(100, 100, 100);
          const notes = [];
          if (entry.yieldAmount) {
            notes.push(
              `Cosecha: ${entry.yieldAmount} ${entry.yieldUnit || ""}`,
            );
          }
          if (entry.harvestNotes) {
            notes.push(entry.harvestNotes);
          }
          doc.text(notes.join(" - "), 35, yPosition);
          yPosition += 5;
        }
      });

      // Add separator line
      yPosition += 5;
      doc.setDrawColor(200, 200, 200);
      doc.line(14, yPosition, pageWidth - 14, yPosition);
      yPosition += 10;
    });
  }

  // Return blob for preview
  return {
    blob: doc.output("blob"),
    fileName: `huerto-completo-${new Date().toISOString().split("T")[0]}.pdf`,
  };
}
