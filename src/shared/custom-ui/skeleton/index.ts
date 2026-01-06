/**
 * Enterprise Skeleton Engine
 *
 * A metadata-driven skeleton system that auto-generates loading states
 * based on your existing column definitions, form schemas, and layout configs.
 *
 * Usage:
 * - <SkeletonTable columns={columns} rows={10} />
 * - <SkeletonTablePage columns={columns} /> (Full page with header)
 * - <SkeletonCards count={3} columns={3} />
 * - <SkeletonForm fields={fieldSchema} />
 */

export { SkeletonBase } from "./SkeletonBase";
export { SkeletonTable } from "./SkeletonTable";
export { SkeletonTablePage } from "./SkeletonTablePage";
export { SkeletonPageHeader } from "./SkeletonPageHeader";
export { SkeletonCard, SkeletonCards } from "./SkeletonCard";
export { SkeletonForm } from "./SkeletonForm";
export { SkeletonSection } from "./SkeletonSection";
