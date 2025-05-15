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
  Avatar,
  Tooltip,
  TextField,
  InputAdornment,
} from "@mui/material";
// import { TablePagination } from "@mui/material";
import debounce from "lodash.debounce";
import SearchIcon from "@mui/icons-material/Search";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import { IEmployer, ICategory } from "../../../interfaces";
import { resources } from "../../../utility";
import { UseDataGridReturnType } from "@refinedev/mui";
import CurrencySelector from "../../currency-selector";
import { LanguageDisplay } from "../..";
import TableSkeleton from "../../table";
import { Edit } from "@mui/icons-material";
import { BusinessLanguagesDisplay } from "../../languages-chip";
type Props = {
  categories: ICategory[];
} & UseDataGridReturnType<IEmployer>;
export const BusinessListTable = ({ categories, ...dataGridProps }: Props) => {
  const t = useTranslate();
  const go = useGo();

  const { data, isLoading, error } = useList({
    resource: resources.employers,
    pagination: { pageSize: 100 },
  });
  const [inputValue, setInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState<IEmployer[]>([]);

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
        (item): item is IEmployer =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filteredResults);
    }
  }, [searchTerm, data]);

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
              <TableCell>{t("employers.fields.name")}</TableCell>
              <TableCell>{t("employers.fields.companyName")}</TableCell>
              <TableCell>{t("employers.fields.primaryEmail")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData?.map((employer) => (
              <TableRow key={employer.id} style={{ cursor: "pointer" }}>
                <TableCell
                  onClick={() => {
                    go({
                      to: {
                        action: "show",
                        resource: resources.employers,
                        id: employer.id!,
                      },
                    });
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{}}
                    src={employer.imageURL}
                    alt={employer.name}
                  />
                </TableCell>
                <TableCell
                  onClick={() => {
                    go({
                      to: {
                        action: "show",
                        resource: resources.employers,
                        id: employer.id!,
                      },
                    });
                  }}
                >
                  {employer.name}
                </TableCell>
                <TableCell
                  onClick={() => {
                    go({
                      to: {
                        action: "show",
                        resource: resources.employers,
                        id: employer.id!,
                      },
                    });
                  }}
                >
                  {employer.company_name}
                </TableCell>
                <TableCell>
                  {employer.primary_email && (
                    <Tooltip title="Email">
                      <IconButton
                        size="small"
                        component="a" // Use 'a' as the root component
                        href={`mailto:${employer.primary_email}`} // Set href to dial the phone
                        aria-label={`Email ${employer.primary_email}`}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};
