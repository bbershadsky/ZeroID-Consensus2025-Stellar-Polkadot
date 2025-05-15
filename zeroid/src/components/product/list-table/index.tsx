import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useList, useGo, useTranslate, BaseRecord } from "@refinedev/core";
import { DataGrid, GridColDef, GridSlots } from "@mui/x-data-grid";
import {
  IconButton,
  InputAdornment,
  TableContainer,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import debounce from "lodash.debounce";
import { ICategory } from "../../../interfaces";
import { resources } from "../../../utility";
import { UseDataGridReturnType } from "@refinedev/mui";
import TableSkeleton from "../../table";
type Props = {
  categories: ICategory[];
} & UseDataGridReturnType<IProduct>;

interface IProduct extends BaseRecord {
  // Assuming BaseRecord is the correct base type you should be extending from.
  id: string;
  productName: string;
  productDescription: string;
  productPrice: string;
  // Ensure all required properties are included.
}

interface ProductListTableProps {
  categories: ICategory[];
  dataGrid: any; // Specify the correct type based on what `useDataGrid` returns
}

export const ProductListTable: React.FC<ProductListTableProps> = ({
  dataGrid,
  categories,
}) => {
  const t = useTranslate();
  const go = useGo();

  const { data, isLoading, error } = useList({
    resource: resources.candidates,
    pagination: { pageSize: 100 }, // Adjust based on your expected data size
  });
  const [inputValue, setInputValue] = useState(""); // Local input state
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<IProduct[]>([]);

  // Debouncing function that updates the search term
  const debouncedUpdateSearchTerm = useCallback(
    debounce((search: string) => {
      setSearchTerm(search);
    }, 300),
    []
  );

  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value); // Update local state immediately
    debouncedUpdateSearchTerm(event.target.value); // Debounce updates to searchTerm
  };
  useEffect(() => {
    if (data && data.data) {
      const filteredResults = data.data.filter(
        (item): item is IProduct =>
          item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.productDescription
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
      setFilteredData(filteredResults);
    }
  }, [searchTerm, data]);

  const columns = useMemo<GridColDef<IProduct>[]>(
    () => [
      {
        field: "productImageURL",
        headerName: "",
        width: 60,
        resizable: false,
        sortable: false,
        align: "left",
        renderCell: (params: GridCellParams) => (
          <ImageCell value={params.value as string} />
        ),
        headerAlign: "left",
      },
      {
        field: "productName",
        headerName: t("businesses.fields.name"),
        width: 200,
        align: "left",
        headerAlign: "left",
        renderCell: (params: GridCellParams) => (
          <CustomCell align="left" value={params.value} />
        ),
      },
      {
        field: "productDescription",
        headerName: t("businesses.fields.description"),

        flex: 1,
        minWidth: 150,
        align: "left",
        headerAlign: "left",
        renderCell: (params: GridCellParams) => (
          <CustomCell align="left" value={params.value} />
        ),
      },
      {
        field: "productPrice",
        headerName: t("businesses.fields.price"),
        width: 110,
        align: "right",
        headerAlign: "right",
        renderCell: (params: GridCellParams) => (
          <PriceCell align="right" value={params.value} />
        ),
      },
    ],
    [t, go]
  );
  const handleRowClick = (params: { id: any }) => {
    go({
      to: {
        action: "show",
        resource: resources.candidates,
        id: params.id,
      },
    });
  };

  return (
    <TableContainer>
      <TextField
        fullWidth
        placeholder={t("businesses.fields.searchPlaceholder")}
        value={inputValue}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      {isLoading ? (
        <TableSkeleton rows={8} columns={4} />
      ) : (
        <DataGrid
          columns={columns}
          rows={filteredData}
          onRowClick={handleRowClick}
          autoHeight
          pageSizeOptions={[10, 25, 50, 100]}
          disableDensitySelector
          pagination
        />
      )}
    </TableContainer>
  );
};

import { GridCellParams } from "@mui/x-data-grid";
import { ImageCell, CustomCell, PriceCell } from "../../table-cell";
