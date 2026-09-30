import { Inbox } from "lucide-react";

export default function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-dashed border-agri-green/40 rounded p-6 text-center text-gray-600 bg-agri-light/40">
      <Inbox className="mx-auto mb-2 text-agri-green" size={22} aria-hidden="true" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
