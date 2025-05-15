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
import { IEmployer, ICategory, ICandidate } from "../../../interfaces";
import { resources } from "../../../utility";
import { UseDataGridReturnType } from "@refinedev/mui";
import CurrencySelector from "../../currency-selector";
import { LanguageDisplay } from "../..";
import TableSkeleton from "../../table";
import { Edit } from "@mui/icons-material";
import { BusinessLanguagesDisplay } from "../../languages-chip";
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
              <TableCell>{t("businesses.fields.name")}</TableCell>
              <TableCell>{t("businesses.fields.description")}</TableCell>
              {/* <TableCell>{t("businesses.fields.languages")}</TableCell> */}
              {/* <TableCell>@</TableCell> */}
              {/* <TableCell>{t("businesses.fields.phone")}</TableCell> */}
              {/* <TableCell>{t("businesses.fields.currency")}</TableCell> */}
              {/* <TableCell></TableCell> */}
              {/* <TableCell></TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData?.map((candidate) => (
              <TableRow key={candidate.id} style={{ cursor: "pointer" }}>
                <TableCell onClick={() => handleNavigateToShow(candidate.id!)}>

                  <Avatar
                    variant="rounded"
                    sx={{}}
                    src={candidate.imageURL}
                    alt={candidate.name}
                  />
                </TableCell>
                <TableCell onClick={() => handleNavigateToShow(candidate.id!)}>

                  {candidate.name}
                </TableCell>
                <TableCell
                  onClick={() => {
                    go({
                      to: {
                        action: "show",
                        resource: resources.candidates,
                        id: candidate.id!,
                      },
                    });
                  }}
                >
                  {candidate.description}
                </TableCell>
                <TableCell
                  onClick={() => {
                    go({
                      to: {
                        action: "show",
                        resource: resources.candidates,
                        id: candidate.id!,
                      },
                    });
                  }}
                >
                  <BusinessLanguagesDisplay
                    showAvatarGroup={true}
                    languages={candidate?.languages}
                  />

                  {/* <LanguageDisplay currentLanguage={candidate.language} /> */}
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
                  )}
                </TableCell>
                <TableCell>
                  {candidate.phone && (
                    <Tooltip title="Call">
                      <IconButton
                        size="small"
                        component="a" // Use 'a' as the root component
                        href={`tel:${candidate.phone}`} // Set href to dial the phone
                        aria-label={`Call ${candidate.phone}`}
                      >
                        <PhoneIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
                <TableCell align="center">
                  <CurrencySelector currentCurrency={candidate?.currency} />
                </TableCell>
                {/* {business?.userID && (
                  <TableCell>
                    <IconButton
                      onClick={() => {
                        go({
                          to: {
                            action: "edit",
                            resource: resources.candidates,
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
