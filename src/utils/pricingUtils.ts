import type { Task, Section } from "@/types";

function getTaskTotal(task: Task): number {
  return (task.assigneePrices ?? []).reduce((sum, ap) => sum + ap.price, 0);
}

export function calculateProjectTotal(
  projectId: string,
  sections: Section[],
  tasks: Task[],
): number {
  const sectionIds = sections
    .filter((s) => s.projectId === projectId)
    .map((s) => s.id);
  return tasks
    .filter((t) => sectionIds.includes(t.sectionId))
    .reduce((sum, t) => sum + getTaskTotal(t), 0);
}

export function calculateGrandTotal(tasks: Task[]): number {
  return tasks.reduce((sum, t) => sum + getTaskTotal(t), 0);
}

export function calculateColumnTotal(tasks: Task[], status: string): number {
  return tasks
    .filter((t) => t.status === status)
    .reduce((sum, t) => sum + getTaskTotal(t), 0);
}

export function formatPrice(price: number, _locale: string = "en"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
}

export function formatPricePlain(price: number): string {
  return price.toLocaleString("en-US");
}
