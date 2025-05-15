import React, { useState } from "react";
import { ProductDrawerForm } from "../../components";

export const ProductCreate = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  return (
    <ProductDrawerForm
      action="create"
      open={isDrawerOpen}
      onClose={handleDrawerClose}
      isDrawerOpen={false}
    />
  );
};
