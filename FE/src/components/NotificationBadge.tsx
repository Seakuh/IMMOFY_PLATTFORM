import { cn } from '@/lib/utils';

interface NotificationBadgeProps {
  count: number;
  className?: string;
  maxCount?: number;
}

export default function NotificationBadge({ 
  count, 
  className,
  maxCount = 99 
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span 
      className={cn(
        "absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1",
        "animate-pulse",
        className
      )}
    >
      {displayCount}
    </span>
  );
}