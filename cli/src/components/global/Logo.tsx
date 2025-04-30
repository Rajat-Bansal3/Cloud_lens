import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

const Logo = ({ className }: Props) => {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <Cloud className='h-6 w-6 text-[#C2EFEB]' />
      <span className='text-xl font-bold tracking-tight text-[#ECFEE8]'>
        CloudLense
      </span>
    </div>
  );
};

export default Logo;
