import { useCallback, useEffect, useState } from "react";
import { useShow, useTranslate, useUpdate } from "@refinedev/core";
import {
  Action,
  createAction,
  Priority,
  useRegisterActions,
} from "@refinedev/kbar";
import CheckOutlined from "@mui/icons-material/CheckOutlined";
import CloseOutlined from "@mui/icons-material/CloseOutlined";

import { IOrder } from "../../interfaces";
import { Typography } from "@mui/material";

export const useOrderCustomKbarActions = (order?: IOrder): void => {
  const t = useTranslate();
  const { queryResult } = useShow<IOrder>();
  const record = queryResult.data?.data;
  const canAcceptOrder = record?.orderStatus === "Pending";
  const canRejectOrder =
    record?.orderStatus === "Pending" ||
    record?.orderStatus === "Ready" ||
    record?.orderStatus === "On The Way";

  if (!record) {
    return; // Return a message if no order data
    // return <Typography>{t("order.notFound")}</Typography>; // Return a message if no order data
  }

  const [actions, setActions] = useState<Action[]>([]);
  const { mutate } = useUpdate();

  const handleMutate = useCallback(
    (status: { id: number; text: string }) => {
      if (!order?.id) return;

      mutate({
        resource: "orders",
        id: order?.id,
        values: {
          status,
        },
      });
    },
    [mutate, order?.id]
  );

  useEffect(() => {
    const preActions: Action[] = [];
    if (canAcceptOrder) {
      preActions.push(
        createAction({
          name: t("buttons.accept"),
          icon: <CheckOutlined />,
          section: "actions",
          perform: () => {
            handleMutate({
              id: 2,
              text: "Ready",
            });
          },
          priority: Priority.HIGH,
        })
      );
    }
    if (canRejectOrder) {
      preActions.push(
        createAction({
          name: t("buttons.reject"),
          icon: <CloseOutlined />,
          section: "actions",
          perform: () => {
            handleMutate({
              id: 5,
              text: "Cancelled",
            });
          },
          priority: Priority.HIGH,
        })
      );
    }
    setActions(preActions);
  }, [t, canAcceptOrder, canRejectOrder, handleMutate]);

  useRegisterActions(actions, [actions]);
};
