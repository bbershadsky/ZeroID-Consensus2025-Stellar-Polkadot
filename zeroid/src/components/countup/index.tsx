import React from "react";
import { useList } from "@refinedev/core";
import CountUp from "react-countup";
import {
  Box,
  Card,
  CardContent,
  Icon,
  Skeleton,
  Typography,
} from "@mui/material";

interface AnimatedNumberCardProps {
  title: string;
  resource: string;
  Icon: React.ElementType;
}

export const AnimatedNumberCard: React.FC<AnimatedNumberCardProps> = ({
  title,
  resource,
  Icon: IconComponent,
}) => {
  const { data, isLoading, error } = useList({
    resource: resource,
    pagination: { pageSize: 1 }, // Minimal data fetch
  });
  const totalCount = data?.total || 0;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ textAlign: "center", pb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mb: 2,
          }}
        >
          <IconComponent color="action" />
          <Typography variant="h5" component="h2" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        {isLoading ? (
          <Skeleton variant="text" width={100} height={56} />
        ) : error ? (
          <Typography color="error">Error: {error.message}</Typography>
        ) : (
          <Typography variant="h4" sx={{ pb: 2 }}>
            <CountUp end={totalCount} duration={2.75} />
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
