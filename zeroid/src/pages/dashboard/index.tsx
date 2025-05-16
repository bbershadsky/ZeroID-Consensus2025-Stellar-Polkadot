import React from "react";
import { useTranslate } from "@refinedev/core";
import Grid from "@mui/material/Grid";
import BusinessIcon from "@mui/icons-material/Business";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { Card } from "../../components";
import { AnimatedNumberCard } from "../../components/countup";
import { resources } from "../../utility";
import { CardActions, CardContent, Stack, Typography } from "@mui/material";
import {
  Star,
  ViewList,
} from "@mui/icons-material";

export const DashboardPage: React.FC = () => {
  const t = useTranslate();

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Card icon={<TrendingUpIcon />} title={t("dashboard.realtime-stats")}>
          <CardContent>
            <Grid container spacing={2} sx={{ paddingBottom: 2 }}>
              <Grid item xs={6}>
                <AnimatedNumberCard
                  title={t("dashboard.total-candidates")}
                  resource={resources.candidates}
                  Icon={ViewList}
                />
              </Grid>
              <Grid item xs={6}>
                <AnimatedNumberCard
                  title={t("dashboard.total-employers")}
                  resource={resources.employers}
                  Icon={BusinessIcon}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Card icon={<Star />} title={t("dashboard.zeroid")}>
          <CardActions>
            <Stack sx={{ width: "100%" }} spacing={2}>
              <Typography
                sx={{
                  maxHeight: "3.6em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {t("dashboard.description")}
              </Typography>
            </Stack>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
};
