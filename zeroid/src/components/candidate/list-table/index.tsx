import { useCallback, useEffect, useState } from "react";
import { useList, useGo, useTranslate } from "@refinedev/core";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
// import { TablePagination } from "@mui/material";
import debounce from "lodash.debounce";
import SearchIcon from "@mui/icons-material/Search";
import EmailIcon from "@mui/icons-material/Email";
import { ICategory, ICandidate } from "../../../interfaces";
import { resources } from "../../../utility";
import { UseDataGridReturnType } from "@refinedev/mui";
import TableSkeleton from "../../table";
type Props = {
  categories: ICategory[];
} & UseDataGridReturnType<ICandidate>;
export const CandidateListTable = ({ categories, ...dataGridProps }: Props) => {
  const t = useTranslate();
  const go = useGo();

  const { data, isLoading, error } = useList({
    resource: resources.candidates,
    pagination: { pageSize: 100 },
  });
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<ICandidate[]>([]);

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
    if (data && data.data) {
      const filteredResults = data.data.filter(
        (item): item is ICandidate =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filteredResults);
    }
  }, [searchTerm, data]);

  const handleNavigateToShow = (candidateId: string) => {
    // Construct the path string directly
    const path = `/candidates/${candidateId}/show`;
    go({
      to: path,
      type: "push", // Or "replace" if you prefer
    });
  };

  return (
    <TableContainer component={Paper}>
      <TextField
        fullWidth
        placeholder={t("employers.fields.searchPlaceholder")}
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
        <TableSkeleton rows={5} columns={8} />
      ) : (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell></TableCell>
              <TableCell>{t("candidates.fields.name")}</TableCell>
              <TableCell>{t("candidates.fields.email")}</TableCell>
              <TableCell>{t("candidates.fields.isVerified")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData?.map((candidate) => (
              <TableRow key={candidate.id} style={{ cursor: "pointer" }}>
                <TableCell></TableCell>
                <TableCell onClick={() => handleNavigateToShow(candidate.id!)}>
                  {candidate.name}
                </TableCell>
                <TableCell>
                {candidate.email && (
                    <Tooltip title="Email">
                      <IconButton
                          size="small"
                          component="a" // Use 'a' as the root component
                          href={`mailto:${candidate.email}`} // Set href to dial the phone
                          aria-label={`Email ${candidate.email}`}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                ) }
                </TableCell>
                <TableCell
                    onClick={() => handleNavigateToShow(candidate.id!)}>
                  {candidate.is_verified ? "Verified": "Not Verified"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};
