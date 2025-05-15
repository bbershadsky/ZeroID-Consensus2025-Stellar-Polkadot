import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Skeleton,
} from "@mui/material";

const TableSkeleton = ({ rows = 5, columns = 5 }) => (
  <Table>
    <TableHead>
      <TableRow>
        {Array.from({ length: columns }, (_, index) => (
          <TableCell key={index}>
            <Skeleton animation="wave" height={40} />
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
    <TableBody>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }, (_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton animation="wave" height={40} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export default TableSkeleton;
