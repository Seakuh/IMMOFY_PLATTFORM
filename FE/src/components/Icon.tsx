import { LucideIcon } from 'lucide-react'

interface IconProps {
  icon: LucideIcon
  className?: string
  size?: number
  strokeWidth?: number
}

export default function Icon({ icon: IconComponent, className = "w-4 h-4", size, strokeWidth = 2 }: IconProps) {
  const iconProps = {
    className,
    strokeWidth,
    ...(size && { size })
  }

  return <IconComponent {...iconProps} />
}

export { Icon }