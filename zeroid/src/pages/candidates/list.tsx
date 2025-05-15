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
import { ICategory, ICandidate } from "../../interfaces";
import { resources } from "../../utility";
import { CandidateListCard, CandidateListTable } from "../../components/candidate";
type View = "table" | "card";

export const CandidatesList = ({ children }: PropsWithChildren) => {
  const [view, setView] = useState<View>(() => {
    const view = localStorage.getItem("business-view") as View;
    return view || "table";
  });

  const go = useGo();
  const { replace } = useNavigation();
  const t = useTranslate();

  const dataGrid = useDataGrid<ICandidate>({
    resource: resources.candidates,
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
                  resource: resources.candidates,
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
            <CandidateListTable {...dataGrid} categories={categories} />
          </Paper>
        )}
        {view === "card" && (
          <CandidateListCard {...dataGrid} categories={categories} />
        )}
      </RefineListView>
      {children}
    </>
  );
};
