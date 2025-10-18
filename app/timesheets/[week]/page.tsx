import React from "react";
import TimesheetPageClient from "@/components/TimesheetPageClient";

export default async function TimesheetPage({
  params,
}: {
  params: { week: string };
}) {
  const { week } = await params;
  return <TimesheetPageClient week={week} />;
}
