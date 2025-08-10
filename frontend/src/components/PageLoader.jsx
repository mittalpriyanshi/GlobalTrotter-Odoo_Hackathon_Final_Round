import { LoaderIcon } from "lucide-react";

const PageLoader = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <LoaderIcon className="animate-spin w-12 h-12 text-primary" />
    </div>
  );
};
export default PageLoader;
