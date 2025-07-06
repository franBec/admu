"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import * as React from "react";

type ProblemDetailsAlertProps = {
  status: number;
  instance?: string;
  timestamp: string;
  trace?: string;
  detail: string;
};

function getVariantFromStatus(status: number) {
  if (status >= 400 && status < 600) {
    return "destructive";
  }
  return "default";
}

function getTitleFromStatus(status: number): string {
  if (status >= 500) {
    return "Something went wrong on our end.";
  }
  if (status >= 400) {
    return "There was a problem with your request.";
  }
  return "Information";
}

function getIconFromStatus(status: number) {
  if (status >= 500) {
    return <AlertTriangle className="h-4 w-4" />;
  }
  if (status >= 400) {
    return <AlertCircle className="h-4 w-4" />;
  }
  return <Info className="h-4 w-4" />;
}

export function ProblemDetailsAlert({
  status,
  instance,
  timestamp,
  trace,
  detail,
}: ProblemDetailsAlertProps) {
  const variant = getVariantFromStatus(status);
  const title = getTitleFromStatus(status);
  const icon = getIconFromStatus(status);

  return (
    <Alert variant={variant}>
      {icon}
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {detail}
        <Collapsible>
          <CollapsibleTrigger asChild>
            <button className="text-sm font-semibold mt-2">More info</button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 text-xs">
            {instance && <p>Instance: {instance}</p>}
            <p>Timestamp: {timestamp}</p>
            {trace && <p>Trace ID: {trace}</p>}
          </CollapsibleContent>
        </Collapsible>
      </AlertDescription>
    </Alert>
  );
}
