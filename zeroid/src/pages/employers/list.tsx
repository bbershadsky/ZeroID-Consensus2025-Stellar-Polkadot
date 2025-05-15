import React, { PropsWithChildren, useState } from "react";
import { useTranslate, useGo, useNavigation, useList } from "@refinedev/core";
import { CreateButton, useDataGrid } from "@refinedev/mui";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import BorderAllOutlinedIcon from "@mui/icons-material/BorderAllOutlined";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Paper from "@mui/material/Paper";
import {
  BusinessListTable,
  BusinessListCard,
  RefineListView,
} from "../../components";
import { ICategory, IEmployer } from "../../interfaces";
import { resources } from "../../utility";
type View = "table" | "card";

export const EmployersList = ({ children }: PropsWithChildren) => {
  const [view, setView] = useState<View>(() => {
    const view = localStorage.getItem("business-view") as View;
    return view || "table";
  });

  const go = useGo();
  const { replace } = useNavigation();
  const t = useTranslate();

  const dataGrid = useDataGrid<IEmployer>({
    resource: resources.employers,
    pagination: {
      pageSize: 12,
    },
  });

  const { data: categoriesData } = useList<ICategory>({
    resource: resources.candidates,
    pagination: {
      mode: "off",
    },
  });
  const categories = categoriesData?.data || [];

  const handleViewChange = (
    _e: React.MouseEvent<HTMLElement>,
    newView: View
  ) => {
    // remove query params (pagination, filters, etc.) when changing view
    replace("");

    setView(newView);
    localStorage.setItem("business-view", newView);
  };
  return (
    <>
      <RefineListView
        headerButtons={(props) => [
          <ToggleButtonGroup
            key="view-toggle"
            value={view}
            exclusive
            onChange={handleViewChange}
            aria-label="text alignment"
          >
            <ToggleButton value="table" aria-label="table view" size="small">
              <ListOutlinedIcon />
            </ToggleButton>
            <ToggleButton value="card" aria-label="card view" size="small">
              <BorderAllOutlinedIcon />
            </ToggleButton>
          </ToggleButtonGroup>,
          <CreateButton
            {...props.createButtonProps}
            key="create"
            size="medium"
            sx={{ height: "40px" }}
            onClick={() => {
              go({
                to: {
                  action: "create",
                  resource: resources.employers,
                },
              });
            }}
          >
            {t("buttons.add")}
          </CreateButton>,
        ]}
      >
        {view === "table" && (
          <Paper>
            <BusinessListTable {...dataGrid} categories={categories} />
          </Paper>
        )}
        {view === "card" && (
          <BusinessListCard {...dataGrid} categories={categories} />
        )}
      </RefineListView>
      {children}
    </>
  );
};
