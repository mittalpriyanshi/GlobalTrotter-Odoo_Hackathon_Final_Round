import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { login } from "../lib/api";

const useLogin = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { mutate, isPending, error } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Refresh cache and route based on onboarding status
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      const isOnboarded = data?.user?.isOnboarded;
      navigate(isOnboarded ? "/landing" : "/onboarding");
    },
  });

  return { error, isPending, loginMutation: mutate };
};

export default useLogin;
