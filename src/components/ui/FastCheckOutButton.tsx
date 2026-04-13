import { api } from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "./button";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";

export default function FastCheckoutButton({ bookingId }: { bookingId: string }) {
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);

  const { mutate: handleCheckout, isPending } = useMutation({
    mutationFn: async () => {
      // Make a simple request to the backend /payment endpoint
      // The backend handles the Polar integration, redirection, and webhooks
      const { data } = await api.post("/api/payments", {
        bookingId: bookingId,
        method: "card"
      });
      return data;
    },
    onSuccess: (data) => {
      // If the backend returns a checkout URL, redirect the user
      if (data?.url || data?.checkoutUrl) {
        window.location.href = data.url || data.checkoutUrl;
      } else {
        setSuccess(true);
        queryClient.invalidateQueries({ queryKey: ["myBookings"] });
        setTimeout(() => setSuccess(false), 3000);
      }
    },
    onError: (err: any) => {
      console.error("Checkout error:", err);
      alert(err.response?.data?.message || "Checkout failed. Please ensure the backend /payment endpoint is working.");
    }
  });

  if (success) {
    return (
      <Button variant="outline" className="w-full bg-green-50 text-green-600 border-green-200 pointer-events-none mt-4">
        <CheckCircle2 className="w-4 h-4 mr-2" />
        Payment Successful
      </Button>
    );
  }

  return (
    <Button 
      className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm transition-all group" 
      onClick={() => handleCheckout()} 
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
      )}
      {isPending ? "Processing..." : "Checkout now"}
    </Button>
  );
};