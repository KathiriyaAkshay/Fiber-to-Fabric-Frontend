import AddMyOrder from "../pages/orderMaster/myOrder/AddMyOrder";
import MyOrderList from "../pages/orderMaster/myOrder/MyOrderList";
import UpdateMyOrder from "../pages/orderMaster/myOrder/UpdateMyOrder";
import AddScheduleDelivery from "../pages/orderMaster/scheduleDelivery/AddScheduleDelivery";
import ScheduleDeliveryList from "../pages/orderMaster/scheduleDelivery/ScheduleDeliveryList";
import UpdateScheduleDelivery from "../pages/orderMaster/scheduleDelivery/UpdateScheduleDelivery";
import AddSizeBeamOrder from "../pages/orderMaster/sizeBeamOrder/AddSizeBeamOrder";
import SizeBeamOrderList from "../pages/orderMaster/sizeBeamOrder/SizeBeamOrderList";
import UpdateSizeBeamOrder from "../pages/orderMaster/sizeBeamOrder/UpdateSizeBeamOrder";
import AddYarnOrder from "../pages/orderMaster/yarnOrder/AddYarnOrder";
import UpdateYarnOrder from "../pages/orderMaster/yarnOrder/UpdateYarnOrder";
import YarnOrderList from "../pages/orderMaster/yarnOrder/YarnOrderList";

export const orderMasterRoutes = {
  path: "/order-master",
  children: [
    { index: true, element: <MyOrderList /> },
    {
      path: "my-orders",
      children: [
        { index: true, element: <MyOrderList /> },
        { path: "add", element: <AddMyOrder /> },
        { path: "update/:id", element: <UpdateMyOrder /> },
      ],
    },
    {
      path: "my-yarn-orders",
      children: [
        { index: true, element: <YarnOrderList /> },
        { path: "add", element: <AddYarnOrder /> },
        { path: "update/:id", element: <UpdateYarnOrder /> },
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
      children: [
        { index: true, element: <ScheduleDeliveryList /> },
        { path: "add", element: <AddScheduleDelivery /> },
        { path: "update/:id", element: <UpdateScheduleDelivery /> },
      ],
    },
  ],
};
