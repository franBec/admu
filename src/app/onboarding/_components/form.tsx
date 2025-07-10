"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import {
  OnboardingFormValues,
  onboardingFormSchema,
} from "@/schemas/onboarding-form-schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { startTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { onboardPerson } from "@/actions/person-action";
import { ProblemDetailsAlert } from "@/components/alert/problem-details-alert";
import { UNEXPECTED_ERROR } from "@/utils/constants";

import { useOnboardingData } from "@/app/onboarding/_components/onboarding-data-provider";

interface OnboardingFormProps {
  initialUserData: {
    givenName: string | null | undefined;
    familyName: string | null | undefined;
    email: string | undefined;
    phoneNumber: string | undefined;
  };
}

type ProblemDetails = {
  status: number;
  instance: string | null;
  timestamp: string;
  trace: string | null;
  detail: string;
};

export function OnboardingForm({ initialUserData }: OnboardingFormProps) {
  const { countries, genders, documentTypes } = useOnboardingData();
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [error, setError] = useState<ProblemDetails | null>(null);

  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(
    undefined
  );

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingFormSchema),
    defaultValues: {
      givenName: initialUserData.givenName || "",
      familyName: initialUserData.familyName || "",
      email: initialUserData.email,
      genderCode: undefined,
      birthDate: new Date("2000-01-01"),
      nationalityAlpha2Code: undefined,
      documentTypeCode: undefined,
      documentNumber: "",
      phoneNumber: initialUserData.phoneNumber,
      address: {
        street: "",
        number: "",
        floor: "",
        apartment: "",
        city: "",
        postalCode: "",
        province: "",
        countryAlpha2Code: undefined,
      },
    },
  });

  function onSubmit(values: OnboardingFormValues) {
    setIsPending(true);
    setError(null);
    startTransition(() => {
      onboardPerson(values)
        .then(result => {
          if (result) {
            setError(result);
            setIsPending(false);
            return;
          }
          router.push("/");
        })
        .catch(() => {
          setError({
            status: 500,
            detail: UNEXPECTED_ERROR,
            timestamp: new Date().toISOString(),
            instance: null,
            trace: null,
          });
          setIsPending(false);
        });
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 p-4 md:p-8 border rounded-lg shadow-sm w-full max-w-2xl bg-card text-card-foreground"
      >
        <h2 className="text-2xl font-bold text-center mb-6">
          Complete Your Profile
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="givenName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="John" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="familyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} disabled />
                </FormControl>
                <FormDescription>
                  This email is from your Clerk account.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="+1 123 456 7890"
                    type="tel"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover
                  open={isCalendarOpen}
                  onOpenChange={open => {
                    setIsCalendarOpen(open);
                    if (open) {
                      setCalendarMonth(field.value || new Date());
                    }
                  }}
                >
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <ChevronDownIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      captionLayout="dropdown"
                      selected={field.value || undefined}
                      onSelect={date => {
                        field.onChange(date);
                        setIsCalendarOpen(false);
                      }}
                      month={calendarMonth}
                      onMonthChange={setCalendarMonth}
                      disabled={date =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="genderCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your gender" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {genders.map(gender => (
                      <SelectItem key={gender.code} value={gender.code}>
                        {gender.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nationalityAlpha2Code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nationality</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your nationality" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem
                        key={country.alpha2Code}
                        value={country.alpha2Code}
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="documentTypeCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {documentTypes.map(docType => (
                      <SelectItem key={docType.code} value={docType.code}>
                        {docType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="documentNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Document Number</FormLabel>
                <FormControl>
                  <Input placeholder="12345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-xl font-semibold mt-8 mb-4">Address Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="address.street"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street</FormLabel>
                <FormControl>
                  <Input placeholder="Main St" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="123"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.floor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Floor (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="2nd"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.apartment"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Apartment (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Apt 4B"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <Input placeholder="San Luis" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code</FormLabel>
                <FormControl>
                  <Input placeholder="5700" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.province"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Province</FormLabel>
                <FormControl>
                  <Input placeholder="San Luis" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address.countryAlpha2Code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map(country => (
                      <SelectItem
                        key={country.alpha2Code}
                        value={country.alpha2Code}
                      >
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {error && (
          <ProblemDetailsAlert
            status={error.status}
            instance={error.instance}
            timestamp={error.timestamp}
            trace={error.trace}
            detail={error.detail}
          />
        )}

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Submitting..." : "Complete Onboarding"}
        </Button>
      </form>
    </Form>
  );
}
