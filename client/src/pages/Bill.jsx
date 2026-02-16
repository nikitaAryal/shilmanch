import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

const Bill = () => {
  const { orderId } = useParams();   // ✅ IMPORTANT
  const [bill, setBill] = useState(null);

  useEffect(() => {
    if (!orderId) return;

    axios.get(`http://localhost:5000/api/bill/${orderId}`)
      .then(res => {
        console.log(res.data); // DEBUG
        setBill(res.data);
      })
      .catch(err => {
        console.error("Bill fetch failed:", err);
      });
  }, [orderId]);

  if (!bill) return <h2>Loading...</h2>;

  return (
    <div>
      <h2>Bill #{bill.billNo}</h2>
      <p>Total: Rs {bill.total}</p>
    </div>
  );
};

export default Bill;
