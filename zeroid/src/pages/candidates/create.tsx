import React, { useState } from "react";
import { ProductDrawerForm } from "../../components";

// Import the CandidateFormValues type from the shared location

export interface CandidateFormValues {
  name: string;
  email: string;
  resume_file_id?: string;
  resume_file_hash?: string;
  resume_original_filename?: string; // To store the original name of the resume
  uploaded_at?: string;
  is_verified: boolean;
  verification_status: string;
}

export const CandidatesCreate = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleFinish = async (data: CandidateFormValues) => {
    // Implement the logic for handling form submission
    console.log("Form submitted with data:", data);
  };

  return (
    <ProductDrawerForm
      action="create"
      open={isDrawerOpen}
      onClose={handleDrawerClose}
      // onFinish={handleFinish}
    />
  );
};
