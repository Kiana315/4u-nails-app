import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { auth } from "@/lib/api";

const schema = z.object({
  username: z.string().min(1, "Please enter your username"),
  password: z.string().min(1, "Please enter your password"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    document.title = "Sign In | 4U Nails";
  }, []);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      await auth.login(values);
      const user = await auth.me();
      toast({ title: "Signed in", description: "Welcome back!" });
      navigate(user?.role === "customer" ? "/" : "/admin", { replace: true });
    } catch (error: any) {
      toast({
        title: "Sign-in failed",
        description: error?.response?.data?.detail || "Incorrect username or password.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-24">
      <article className="w-full max-w-md rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        <header className="mb-6 text-center">
          <Link to="/" className="font-serif text-2xl font-semibold text-primary">4U Nails</Link>
          <h1 className="mt-4 text-3xl font-serif font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">Access your 4U Nails account.</p>
        </header>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="username" render={({ field }) => (
              <FormItem><FormLabel>Username</FormLabel><FormControl><Input autoComplete="username" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" autoComplete="current-password" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </Form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to 4U Nails? <Link to="/register" className="font-medium text-primary hover:underline">Create an account</Link>
        </p>
        <p className="mt-2 text-center"><Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Back to home</Link></p>
      </article>
    </main>
  );
}
