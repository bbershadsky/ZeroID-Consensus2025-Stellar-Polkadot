import { useGo, useTranslate } from "@refinedev/core";
import { UseDataGridReturnType } from "@refinedev/mui";
import Typography from "@mui/material/Typography";
import { ICandidate } from "../../../interfaces";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import TablePagination from "@mui/material/TablePagination";
import { resources } from "../../../utility";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import { TextField, InputAdornment } from "@mui/material";
import debounce from "lodash.debounce";
import { useState, useCallback, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";

type Props = {} & UseDataGridReturnType<ICandidate>;

export const ProductListCard: React.FC<Props> = (props) => {
  const go = useGo();
  const t = useTranslate();
  const data = props.tableQueryResult?.data || { data: [] };
  const products = data.data;

  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<ICandidate[]>(products);

  // Debouncing function that updates the search term
  const debouncedUpdateSearchTerm = useCallback(
    debounce((search: string) => {
      setSearchTerm(search);
    }, 300),
    []
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value); // Update local state immediately
    debouncedUpdateSearchTerm(event.target.value); // Debounce updates to searchTerm
  };

  useEffect(() => {
    if (Array.isArray(products)) {
      const filteredResults = products.filter(
        (item: ICandidate) =>
          (item.productName?.toLowerCase() ?? "").includes(
            searchTerm.toLowerCase()
          ) ||
          (item.productDescription?.toLowerCase() ?? "").includes(
            searchTerm.toLowerCase()
          )
      );
      setFilteredData(filteredResults);
    }
  }, [searchTerm, products]);

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
    <>
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
      <Divider />
      <Grid
        container
        spacing={3}
        sx={{
          justifyContent: "space-between",
          padding: "12px 16px",
          marginTop: "auto",
          borderTop: "1px solid",
          borderColor: (theme) => theme.palette.divider,
        }}
      >
        {filteredData.map((product) => (
          <Grid key={product.id} item sm={3} md={4} lg={3}>
            <Card
              sx={{ height: "100%" }}
              onClick={() => {
                handleRowClick({ id: product.id });
              }}
            >
              {product.productImageURL ? (
                <CardMedia
                  component="img"
                  height="160"
                  image={product.productImageURL}
                  alt={product.productName}
                />
              ) : (
                <Box
                  sx={{
                    height: "160px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                    color: "text.secondary",
                  }}
                >
                  <PhotoCameraIcon sx={{ fontSize: 40 }} />
                  <Typography variant="caption">
                    {t("common.no-image")}
                  </Typography>
                </Box>
              )}

              <CardContent>
                <Typography variant="h6">{product.productName}</Typography>
                <Typography color="text.secondary">
                  {product.productDescription}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Divider
        sx={{
          marginTop: "24px",
        }}
      />
      <TablePagination
        component="div"
        count={props.dataGridProps.rowCount}
        page={props.dataGridProps.paginationModel?.page || 0}
        rowsPerPage={props.dataGridProps.paginationModel?.pageSize || 12}
        rowsPerPageOptions={[12, 24, 48, 96]}
        onRowsPerPageChange={(e) => {
          props.setPageSize(+e.target.value);
        }}
        onPageChange={(_e, page) => {
          props.setCurrent(page + 1);
        }}
      />
    </>
  );
};
