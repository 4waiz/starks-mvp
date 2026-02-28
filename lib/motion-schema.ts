import { z } from "zod";

export const inputSchema = z.object({
  styleText: z.string().trim().min(3).max(220),
  actionText: z.string().trim().min(3).max(220),
  engine: z.enum(["unity", "unreal", "blender"]),
  rigType: z.literal("humanoid"),
  toggles: z.object({
    noFootSliding: z.boolean(),
    contactConstraints: z.boolean(),
    limpLeftLeg: z.boolean(),
  }),
});

export const motionSpecSchema = z
  .object({
    style_tags: z.array(z.string().min(1).max(48)).max(12),
    action_tags: z.array(z.string().min(1).max(48)).max(12),
    tempo_bpm: z.number().min(40).max(220),
    constraints: z.object({
      no_foot_sliding: z.boolean(),
      contact_points: z.array(z.string().min(1).max(24)).max(8),
      limp_left_leg: z.boolean(),
    }),
    rig_notes: z.array(z.string().min(1).max(120)).max(8),
    engine: z.enum(["unity", "unreal", "blender"]),
    export: z.object({
      formats: z.array(z.enum(["FBX", "BVH"])).min(1),
      retargeting: z.literal("humanoid"),
    }),
    quality_checks: z.array(z.string().min(1).max(48)).min(1).max(8),
  })
  .strict();

export type DemoInput = z.infer<typeof inputSchema>;
export type MotionSpec = z.infer<typeof motionSpecSchema>;

export type MotionResponse = {
  summary: string;
  motionSpec: MotionSpec;
};
