import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FaEnvelope } from "react-icons/fa";

export function Footer() {
  return (
    <footer className='mt-auto w-full border-t border-muted bg-background'>
      <div className='mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8'>
        {/* <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3'>
          <div className='space-y-3'>
            <h3 className='text-xl font-bold tracking-tight text-foreground'>
              Cloud Lens
            </h3>
            <p className='text-sm text-muted-foreground leading-relaxed'>
              Visualize and optimize your serverless performance.
            </p>
          </div>

          <div className='space-y-3'>
            <h4 className='text-base font-semibold text-foreground'>
              Stay in the Loop
            </h4>
            <form className='flex w-full max-w-md flex-col sm:flex-row gap-3'>
              <Input
                type='email'
                placeholder='Enter your email'
                className='bg-background'
              />
              <Button type='submit' size='sm' className='w-full sm:w-auto'>
                <FaEnvelope className='mr-2 h-4 w-4' />
                Subscribe
              </Button>
            </form>
            <p className='text-xs text-muted-foreground'>
              Get the latest on serverless insights and new features.
            </p>
          </div>

          <div className='space-y-3'>
            <h4 className='text-base font-semibold text-foreground'>
              Coming Soon
            </h4>
            <ul className='text-sm text-muted-foreground space-y-1'>
              <li>Execution Time Breakdown</li>
              <li>Cold Start Alerts</li>
              <li>Multi-cloud Support</li>
            </ul>
          </div>
        </div> */}

        {/* Footer Bottom */}
        <div className='mt-12 border-t border-muted pt-6 text-center text-sm text-muted-foreground'>
          <p>
            &copy; {new Date().getFullYear()} Cloud Lens. All rights reserved.
          </p>
          <div className='mt-2 flex justify-center space-x-6 text-xs'>
            <a href='#' className='hover:underline'>
              Privacy Policy
            </a>
            <a href='#' className='hover:underline'>
              Terms of Service
            </a>
            <a href='#' className='hover:underline'>
              Cookie Preferences
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
