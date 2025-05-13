import { Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Cloud,
  Menu,
  User,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const router = useRouter();
  const { data: auth } = useQuery({
    queryKey: ["auth"],
    queryFn: () => fetch("/api/auth/me").then((res) => res.json()),
    staleTime: 60_000,
  });

  return (
    <header className='sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='container flex h-14 items-center mx-auto justify-between'>
        {/* Left side - Logo and nav */}
        <div className='flex items-center gap-6'>
          <Link to='/' className='flex items-center gap-2 font-semibold'>
            <Cloud className='h-6 w-6 text-primary' />
            <span>Cloud Lens</span>
          </Link>

          {auth?.user && (
            <nav className='hidden items-center gap-4 md:flex'>
              <Link
                to='/dashboard'
                activeProps={{ className: "text-primary" }}
                className='text-sm font-medium text-muted-foreground transition-colors hover:text-primary'
              >
                Dashboard
              </Link>
              <Link
                to='/analytics'
                activeProps={{ className: "text-primary" }}
                className='text-sm font-medium text-muted-foreground transition-colors hover:text-primary'
              >
                Analytics
              </Link>
            </nav>
          )}
        </div>

        {/* Right side - Auth state */}
        <div className='flex items-center gap-4'>
          {auth?.user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='outline'
                    size='icon'
                    className='overflow-hidden rounded-full'
                  >
                    <User className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => router.navigate({ to: "/profile" })}
                  >
                    <User className='mr-2 h-4 w-4' />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.navigate({ to: "/settings" })}
                  >
                    <Settings className='mr-2 h-4 w-4' />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      fetch("/api/auth/logout");
                      router
                        .invalidate()
                        .finally(() => router.navigate({ to: "/" }));
                    }}
                  >
                    <LogOut className='mr-2 h-4 w-4' />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className='flex gap-2'>
              <Button
                variant='outline'
                onClick={() => router.navigate({ to: "/login" })}
              >
                Sign In
              </Button>
              <Button onClick={() => router.navigate({ to: "/register" })}>
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
