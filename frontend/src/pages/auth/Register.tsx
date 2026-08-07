import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/api";

const schema = z
  .object({
    first_name: z.string().trim().min(1, "Please enter your first name"),
    last_name: z.string().trim().min(1, "Please enter your last name"),
    username: z.string().trim().min(3, "Username must be at least 3 characters"),
    email: z.string().trim().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .refine((value) => !/^\d+$/.test(value), "Password cannot contain only numbers"),
    password_confirm: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

type FormValues = z.infer<typeof schema>;

const getErrorMessage = (error: any) => {
  const data = error?.response?.data;
  if (data && typeof data === "object") {
    const first = Object.values(data).flat()[0];
    if (typeof first === "string") return first;
  }
  return error?.message || "Unable to create your account. Please try again.";
};

const formFields: Array<keyof FormValues> = [
  "first_name",
  "last_name",
  "username",
  "email",
  "password",
  "password_confirm",
];

export default function Register() {
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      email: "",
      password: "",
      password_confirm: "",
    },
  });

  useEffect(() => {
    document.title = "Create Account | 4U Nails";
  }, []);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await auth.register(values);
      toast({
        title: "Account created",
        description: "Welcome to 4U Nails! You are now signed in.",
      });
      window.location.replace("/");
    } catch (error: any) {
      const data = error?.response?.data;
      if (data && typeof data === "object") {
        formFields.forEach((field) => {
          const messages = data[field];
          if (messages) {
            form.setError(field, {
              type: "server",
              message: (Array.isArray(messages) ? messages : [messages]).join(" "),
            });
          }
        });
      }
      toast({
        title: "Registration failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <article className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <header className="mb-6 text-center">
          <Link to="/" className="font-serif text-2xl font-semibold text-primary">4U Nails</Link>
          <h1 className="mt-4 text-3xl font-serif font-semibold">Create your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">Save your details for a smoother booking experience.</p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="first_name" render={({ field }) => (
                <FormItem><FormLabel>First name</FormLabel><FormControl><Input autoComplete="given-name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="last_name" render={({ field }) => (
                <FormItem><FormLabel>Last name</FormLabel><FormControl><Input autoComplete="family-name" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem><FormLabel>Username</FormLabel><FormControl><Input autoComplete="username" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" autoComplete="email" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Use at least 8 characters. Avoid common passwords, personal information, and passwords made only of numbers.
                </p>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="password_confirm" render={({ field }) => (
              <FormItem><FormLabel>Confirm password</FormLabel><FormControl><Input type="password" autoComplete="new-password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link>
        </p>
      </article>
    </main>
  );
}
