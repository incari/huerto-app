import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GardenConfig } from "@/lib/plants";

interface Garden {
  id: number;
  name: string;
  config: GardenConfig;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateGardenInput {
  name: string;
  config: GardenConfig;
  plants?: any[];
}

interface UpdateGardenInput {
  id: number;
  name: string;
  config: GardenConfig;
}

// Fetch all gardens
export function useGardens() {
  return useQuery({
    queryKey: ["gardens"],
    queryFn: async (): Promise<Garden[]> => {
      const response = await fetch("/api/gardens");
      if (!response.ok) {
        throw new Error("Failed to fetch gardens");
      }
      return response.json();
    },
  });
}

// Create a new garden
export function useCreateGarden() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateGardenInput): Promise<Garden> => {
      const response = await fetch("/api/gardens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        throw new Error("Failed to create garden");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch gardens list
      queryClient.invalidateQueries({ queryKey: ["gardens"] });
    },
  });
}

// Update an existing garden
export function useUpdateGarden() {
  return useMutation({
    mutationFn: async (input: UpdateGardenInput): Promise<Garden> => {
      const response = await fetch(`/api/gardens/${input.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: input.name,
          config: input.config,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update garden");
      }

      return response.json();
    },
    // Don't invalidate queries on update to prevent infinite loops
    // The local state is already up-to-date
  });
}
