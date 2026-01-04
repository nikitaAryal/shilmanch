import { useEffect, useState } from "react";
import api from "../services/api";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    const capturePayment = async () => {
      try {
        const paypalOrderId = params.get("token"); // PayPal returns token
        const orderId = localStorage.getItem("paypal_order_id");

        if (!paypalOrderId || !orderId) {
          setError("Missing payment information");
          return;
        }

        await api.post("/paypal/capture", {
          paypalOrderId,
          orderId,
        });

        // Clean up localStorage
        localStorage.removeItem("paypal_order_id");

        navigate("/my-tickets");
      } catch (err) {
        console.error("Payment capture failed:", err);
        setError("Payment capture failed. Please contact support.");
      }
    };

    capturePayment();
  }, [params, navigate]);

  if (error) {
    return <h2>{error}</h2>;
  }

  return <h2>Processing payment...</h2>;
}
