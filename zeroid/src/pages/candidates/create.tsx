import React, { useState } from "react";
import { ProductDrawerForm } from "../../components";

export const CandidatesCreate = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <ProductDrawerForm
      action="create"
      open={isDrawerOpen}
      onClose={handleDrawerClose}
    />
  );
};
