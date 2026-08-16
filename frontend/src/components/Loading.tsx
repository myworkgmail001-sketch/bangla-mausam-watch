import { AlertTriangle } from 'lucide-react';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center animate-pulse">
          <AlertTriangle className="w-6 h-6 text-white" />
        </div>
        <div className="w-24 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-primary-500 rounded-full animate-[loading_1.5s_ease-in-out_infinite]" style={{width:'40%'}} />
        </div>
      </div>
    </div>
  );
}
