import { useParams } from "react-router-dom";
import { useOne } from "@refinedev/core";
import { CircularProgress } from "@mui/material";
import { CandidateDrawerForm } from "../../components";
import { resources } from "../../utility";
import { ICandidate } from "../../interfaces";

export const ProductEdit = () => {
  const { id } = useParams();
  const { data, isLoading, error } = useOne<ICandidate>({
    resource: resources.candidates,
    id: id as string,
  });

  if (isLoading) {
    return <CircularProgress />;
  }

  if (error) {
    return <div>Error loading product data!</div>;
  }

  return (
    <CandidateDrawerForm
      action="edit"
      open={true}
      onClose={() => {}}
    />
  );
};
