import React, { Suspense } from "react";
import BulkResultsClient from "./BulkResultsClient";

export default function Page() {
  return (
    <Suspense fallback={<div className="text-center mt-8">Loading...</div>}>
      <BulkResultsClient />
    </Suspense>
  );
}
