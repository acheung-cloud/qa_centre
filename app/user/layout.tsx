'use client';

import { useEffect, useState } from "react";
import "@aws-amplify/ui-react/styles.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import UserLayout from "../components/UserLayout";

Amplify.configure(outputs);

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <UserLayout>
      {children}
    </UserLayout>
  );
}
