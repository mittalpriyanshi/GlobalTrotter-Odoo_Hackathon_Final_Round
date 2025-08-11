import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { signup } from "../lib/api";

const useSignUp = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate, isPending, error } = useMutation({
    mutationFn: signup,
    onSuccess: (data, variables) => {
      console.log("Signup successful:", data);
      console.log("User data:", data.user);
      console.log("Is onboarded:", data.user.isOnboarded);
      
      // Set the user data directly in the query cache
      const cacheData = { success: true, user: data.user };
      console.log("Setting cache data:", cacheData);
      queryClient.setQueryData(["authUser"], cacheData);
      
      // Navigate to onboarding page immediately with prefill data
      console.log("Navigating to onboarding...");
      navigate("/onboarding", {
        state: {
          fullName: data?.user?.fullName ?? variables?.fullName ?? "",
          email: data?.user?.email ?? variables?.email ?? "",
        },
      });
    },
    onError: (error) => {
      console.error("Signup error:", error);
    }
  });

  return { isPending, error, signupMutation: mutate };
};
export default useSignUp;
