import { useEffect } from "react";
import axios from "axios";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const capturePayment = async () => {
      const paypalOrderId = params.get("token"); // PayPal returns token

      await axios.post("http://localhost:3000/api/paypal/capture", {
        paypalOrderId,
        orderId: localStorage.getItem("orderId"),
        activeplay_id: localStorage.getItem("activeplay_id")
      });

      navigate("/my-tickets");
    };

    capturePayment();
  }, []);

  return <h2>Processing payment...</h2>;
}
