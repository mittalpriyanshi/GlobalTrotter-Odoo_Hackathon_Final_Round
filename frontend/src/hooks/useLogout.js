import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../lib/api";
import toast from "react-hot-toast";

const useLogout = () => {
  const queryClient = useQueryClient();

  const {
    mutate: logoutMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      console.log("Logout successful, clearing auth state...");
      
      // Clear the auth user data immediately
      queryClient.setQueryData(["authUser"], { user: null });
      
      // Clear all queries to ensure clean state
      queryClient.clear();
      
      // Show success message
      toast.success("Logged out successfully!");
      
      // Force a page reload to ensure complete state reset
      setTimeout(() => {
        console.log("Redirecting to landing page...");
        window.location.replace("/");
      }, 500);
    },
    onError: (error) => {
      console.error("Logout failed:", error);
      
      // Even if logout fails on server, clear client state
      queryClient.setQueryData(["authUser"], { user: null });
      queryClient.clear();
      
      // Show error message but still redirect
      toast.error("Logout failed, but clearing local session");
      
      setTimeout(() => {
        window.location.replace("/");
      }, 500);
    },
  });

  return { logoutMutation, isPending, error };
};
export default useLogout;
