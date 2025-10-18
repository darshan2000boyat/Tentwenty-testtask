"use client";

import React from "react";
import TimesheetPageClient from "@/components/TimesheetPageClient";
import { useParams } from "next/navigation";

export default function TimesheetPage() {
  const params = useParams();
  const week = params.week as string;

  console.log("Router params:", params);

  return <TimesheetPageClient week={week} />;
}
