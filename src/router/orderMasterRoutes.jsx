import AddSizeBeamOrder from "../pages/orderMaster/sizeBeamOrder/AddSizeBeamOrder";
import SizeBeamOrderList from "../pages/orderMaster/sizeBeamOrder/SizeBeamOrderList";
import UpdateSizeBeamOrder from "../pages/orderMaster/sizeBeamOrder/UpdateSizeBeamOrder";
import AddYarnOrder from "../pages/orderMaster/yarnOrder/AddYarnOrder";
// import UpdateYarnOrder from "../pages/orderMaster/yarnOrder/UpdateYarnOrder";
import YarnOrderList from "../pages/orderMaster/yarnOrder/YarnOrderList";

export const orderMasterRoutes = {
  path: "/order-master",
  children: [
    { index: true, element: <YarnOrderList /> },
    {
      path: "my-orders",
      element: <div>my-orders</div>,
    },
    {
      path: "my-yarn-orders",
      children: [
        { index: true, element: <YarnOrderList /> },
        { path: "add", element: <AddYarnOrder /> },
        // { path: "update/:id", element: <UpdateYarnOrder /> },
      ],
    },
    {
      path: "size-beam-order",
      children: [
        { index: true, element: <SizeBeamOrderList /> },
        { path: "add", element: <AddSizeBeamOrder /> },
        { path: "update/:id", element: <UpdateSizeBeamOrder /> },
      ],
    },
    {
      path: "schedule-delivery-list",
      element: <div>schedule-delivery-list</div>,
    },
  ],
};
