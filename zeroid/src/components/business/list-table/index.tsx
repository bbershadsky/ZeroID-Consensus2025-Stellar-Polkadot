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

  const handleNavigateToShow = (employerId: string) => {
    // Construct the path string directly
    const path = `/employers/${employerId}/show`;
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
              <TableCell>{t("businesses.fields.name")}</TableCell>
              <TableCell>{t("businesses.fields.description")}</TableCell>
              <TableCell>{t("businesses.fields.languages")}</TableCell>
              <TableCell>@</TableCell>
              <TableCell>{t("businesses.fields.phone")}</TableCell>
              <TableCell>{t("businesses.fields.currency")}</TableCell>
              {/* <TableCell></TableCell> */}
              {/* <TableCell></TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData?.map((business) => (
              <TableRow key={business.id} style={{ cursor: "pointer" }}>
                <TableCell onClick={() => handleNavigateToShow(business.id!)}>

                  <Avatar
                    variant="rounded"
                    sx={{}}
                    src={business.imageURL}
                    alt={business.name}
                  />
                </TableCell>
                <TableCell
                  onClick={() => handleNavigateToShow(business.id!)}
                >
                  {business.name}
                </TableCell>
                <TableCell
                  onClick={() => {
                    go({
                      to: {
                        action: "show",
                        resource: resources.employers,
                        id: business.id!,
                      },
                    });
                  }}
                >
                  {business.description}
                </TableCell>
                <TableCell
                  onClick={() => {
                    go({
                      to: {
                        action: "show",
                        resource: resources.employers,
                        id: business.id!,
                      },
                    });
                  }}
                >
                  <BusinessLanguagesDisplay
                    showAvatarGroup={true}
                    languages={business?.languages}
                  />

                  {/* <LanguageDisplay currentLanguage={business.language} /> */}
                </TableCell>
                <TableCell>
                  {business.email && (
                    <Tooltip title="Email">
                      <IconButton
                        size="small"
                        component="a" // Use 'a' as the root component
                        href={`mailto:${business.email}`} // Set href to dial the phone
                        aria-label={`Email ${business.email}`}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell>
                  {business.phone && (
                    <Tooltip title="Call">
                      <IconButton
                        size="small"
                        component="a" // Use 'a' as the root component
                        href={`tel:${business.phone}`} // Set href to dial the phone
                        aria-label={`Call ${business.phone}`}
                      >
                        <PhoneIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="center">
                  <CurrencySelector currentCurrency={business?.currency} />
                </TableCell>
                {/* {business?.userID && (
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        go({
                          to: {
                            action: "edit",
                            resource: resources.employers,
                            id: business.id!,
                          },
                        });
                      }}
                    >
                      <Edit />
                    </IconButton>
                  </TableCell>
                )} */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </TableContainer>
  );
};
