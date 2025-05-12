import { Loader } from "lucide-react";
import React from "react";

const loading = () => {
  return (
    <div className='w-full min-h-screen flex justify-center items-center'>
      <Loader className='animate-spin' />
    </div>
  );
};

export default loading;
