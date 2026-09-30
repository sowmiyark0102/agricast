import { AlertTriangle } from "lucide-react";

export default function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="border border-red-200 bg-red-50 rounded p-4 flex items-start gap-3">
      <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} aria-hidden="true" />
      <div>
        <p className="text-sm text-red-800">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="mt-2 text-sm font-semibold text-red-700 underline">
            Try again
          </button>
        )}
      </div>
    </div>
  );
}
