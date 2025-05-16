import { useGo, useTranslate } from "@refinedev/core";
import { UseDataGridReturnType } from "@refinedev/mui";
import Typography from "@mui/material/Typography";
import { ICandidate, ICategory, IEmployer } from "../../../interfaces";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Divider from "@mui/material/Divider";
import SearchIcon from "@mui/icons-material/Search";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { IconButton, InputAdornment, TextField, debounce } from "@mui/material";
import TablePagination from "@mui/material/TablePagination";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { resources } from "../../../utility";
import { useState, useCallback, useEffect } from "react";

type Props = {
  categories: ICategory[];
} & UseDataGridReturnType<ICandidate>;

export const CandidateListCard: React.FC<Props> = (props) => {
  const go = useGo();
  const t = useTranslate();
  const data = props.tableQueryResult?.data || { data: [] };

  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<ICandidate[]>([]);

  const debouncedUpdateSearchTerm = useCallback(
    debounce((search: string) => {
      setSearchTerm(search);
    }, 300),
    []
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
    debouncedUpdateSearchTerm(event.target.value);
  };

  useEffect(() => {
    if (Array.isArray(data.data)) {
      const filteredResults = data.data.filter(
        (item: ICandidate) =>
          // item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filteredResults);
    }
  }, [searchTerm, data.data]);

  return (
    <>
      <TextField
        fullWidth
        placeholder={t("candidates.fields.searchPlaceholder")}
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
      <Grid container spacing={3} sx={{ marginTop: "24px" }}>
        {filteredData.map((candidate) => (
          <Grid key={candidate.id} item sm={3} md={4} lg={3}>
            <Card
              sx={{ height: "100%", position: "relative" }}
              onClick={() => {
                go({
                  to: {
                    action: "show",
                    resource: resources.employers,
                    id: candidate.id ?? "",
                  },
                });
              }}
            >
              {candidate.imageURL ? (
                <CardMedia
                  component="img"
                  height="160"
                  image={candidate.imageURL}
                  alt={candidate.name}
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
              {/* <Button
                className="view-button"
                variant="contained"
                color="inherit"
                size="small"
                startIcon={<EditOutlinedIcon />}
                onClick={(e) => {
                  e.stopPropagation(); // Prevent triggering the card's onClick
                  go({
                    to: {
                      action: "edit",
                      resource: resources.businesses,
                      id: business.id,
                    },
                  });
                }}
                sx={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                }}
              >
                {t("buttons.edit")}
              </Button> */}
              <CardContent>
                <Typography
                  sx={{
                    maxHeight: "3.6em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {candidate.name}
                </Typography>
                <Typography
                  sx={{
                    maxHeight: "3.6em",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {candidate.description}
                </Typography>
              </CardContent>
              <CardActions
                sx={{
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  marginTop: "auto",
                  borderTop: "1px solid",
                  borderColor: (theme) => theme.palette.divider,
                  display: "flex",
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    justifyContent: "flex-start",
                  }}
                >
                  {candidate.phone ? (
                    <IconButton
                      size="small"
                      component="a"
                      href={`tel:${candidate.phone}`}
                      aria-label={`Call ${candidate.phone}`}
                    >
                      <PhoneIcon />
                    </IconButton>
                  ) : (
                    <span style={{ width: 48, height: 48 }} />
                  )}
                </Box>
                <Box
                  sx={{ flex: 1, display: "flex", justifyContent: "flex-end" }}
                >
                  {candidate.email ? (
                    <IconButton
                      size="small"
                      component="a"
                      href={`mailto:${candidate.email}`}
                      aria-label={`Email ${candidate.email}`}
                    >
                      <EmailIcon />
                    </IconButton>
                  ) : (
                    <span style={{ width: 48, height: 48 }} />
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Divider sx={{ marginTop: "24px" }} />
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
