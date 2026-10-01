import { BrowserRouter } from "react-router-dom";
import MockPay from "./pages/mockPage";
import { Route } from "react-router-dom";
import { Routes } from "react-router-dom";
import CallBackTest from "./pages/callBackTest";
import EsewaRedirect from "./pages/EsewaRedirect";

export default function App()
{
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/mock-pay/:paymentId" element={<MockPay />} />
        <Route path = "/callback" element = {<CallBackTest/>} />
        <Route path="/pay/esewa/:paymentId" element={<EsewaRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}