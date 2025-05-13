import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SidebarInset } from "@/components/ui/sidebar";
import { Footer } from "@/components/global/Footer";
import Header from "@/components/global/Header";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <SidebarInset>
        <div className='flex min-h-screen flex-col bg-background'>
          <Header />
          <main className='mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8'>
            <Outlet />
          </main>
          <Footer />
        </div>
      </SidebarInset>
      <TanStackRouterDevtools position='bottom-left' initialIsOpen={false} />
      <ReactQueryDevtools position='bottom' initialIsOpen={false} />
    </>
  );
}
