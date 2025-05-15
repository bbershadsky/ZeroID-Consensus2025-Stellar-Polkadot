import React, { PropsWithChildren, useState } from "react";
import { useTranslate, useGo, useNavigation, useList } from "@refinedev/core";
import { CreateButton, useDataGrid } from "@refinedev/mui";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import BorderAllOutlinedIcon from "@mui/icons-material/BorderAllOutlined";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import Paper from "@mui/material/Paper";
import {
  ProductListTable,
  ProductListCard,
  RefineListView,
  ProductDrawerForm,
} from "../../components";
import { ICategory, ICandidate } from "../../interfaces";
import { resources } from "../../utility";

type View = "table" | "card";

export const ProductList = ({ children }: PropsWithChildren) => {
  const { dataGridProps } = useDataGrid<ICandidate>({
    resource: resources.candidates,
    pagination: {
      pageSize: 100,
    },
  });

  const { filterMode, filterModel, onFilterModelChange, ...restDataGridProps } =
    dataGridProps;

  const [view, setView] = useState<View>(() => {
    const view = localStorage.getItem("product-view") as View;
    return view || "table";
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const go = useGo();
  const { replace } = useNavigation();
  const t = useTranslate();

  const dataGrid = useDataGrid<ICandidate>({
    resource: resources.candidates,
  });

  // const { data: categoriesData } = useList<ICategory>({
  //   resource: resources.categories,
  //   pagination: {
  //     mode: "off",
  //   },
  // });
  // const categories = categoriesData?.data || [];

  const handleViewChange = (
    _e: React.MouseEvent<HTMLElement>,
    newView: View
  ) => {
    replace("");
    setView(newView);
    localStorage.setItem("product-view", newView);
  };

  const handleDrawerOpen = () => {
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
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
            aria-label="view toggle"
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
            onClick={handleDrawerOpen}
          >
            {t("buttons.add")}
          </CreateButton>,
        ]}
      >
        {view === "table" && (
          <Paper>
            {/* <ProductListTable
              dataGrid={dataGridProps}
              categories={categories}
            /> */}
          </Paper>
        )}
        {view === "card" && <ProductListCard {...dataGrid} />}
      </RefineListView>
      {isDrawerOpen && (
        <ProductDrawerForm
          action="create"
          open={isDrawerOpen}
          onClose={handleDrawerClose}
          isDrawerOpen={isDrawerOpen}
        />
      )}
      {children}
    </>
  );
};
